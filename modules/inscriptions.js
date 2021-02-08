/**
 * Libraries
 */
const Logger = require('./discordLogger')

const {Tft} = require('riotgames-gg')
const tft = new Tft({region: "EUW", apikey: process.env.RIOT_TOKEN})

/**
 * Check if two string are the same riot name
 */
String.prototype.equalsRiotName = function(value){
    return encodeURI(this.replace(" ", "").toLowerCase()) == encodeURI(value.replace(" ", "").toLowerCase())
}

module.exports = class Inscriptions{

    static async handle(message, doc){
        const sheet = doc.sheetsById["0"]

        let redo
        do{
            redo = false
            try{
                const summoner = await tft.Summoner.summonerByName(encodeURI(message.content))
                
                const rows = await sheet.getRows()
                for(let row of rows){
                    if(row["Nom Invocateur"].equalsRiotName(summoner.name)){
                        //Check if this player is already in
                        return
                    }else if(row["Discord Id"] == message.author.id){
                        //Check if this player try to modif 
                        row["Nom Invocateur"] = summoner.name
                        row["Puuid"] = summoner.puuid
                        await row.save()

                        Logger.log("Inscription", `${summoner.name} a modifié son inscription`)
                        message.react("✅")
                        return
                    }
                }

                //If we get here it is a new player
                await sheet.addRow({
                    "Discord Tag": message.author.tag, 
                    "Discord Id": message.author.id,
                    "Nom Invocateur": summoner.name,
                    "Puuid": summoner.puuid
                })
                Logger.log("Inscription", `${summoner.name} s'est inscrit`)
                message.react("✅")
                return
            }catch(err){
                if(err.response && err.response.status == 429){
                    redo = true
                }else if(err.response && err.response.status == 404){
                    Logger.log("Inscription", `Nom d'invocateur inconnu ${message.content}`)
                }else{
                    Logger.log("Inscription", `Erreur inconnue pour ${message.content}`)
                    console.log(err)
                }
            }
        }while(redo)
    }

    static async delete(message, doc){
        const sheet = doc.sheetsById["0"]

        let redo
        do{
            redo = false
            try{
                const rows = await sheet.getRows()
                for(let row of rows){
                    if(row["Discord Id"] == message.author.id){
                        await row.delete()
                        Logger.log("Desinscription", `${message.content} s'est désinscrit`)
                        return
                    }
                }
            }catch(err){
                if(err.response && err.response.status == 429){
                    redo = true
                }else{
                    Logger.log("Desinscription", `Erreur pour ${message.content}`)
                    console.log(err)
                }
            }
        }while(redo)
    }

    static async manual(message, doc){
        const sheet = doc.sheetsById["0"]

        let redo
        do{
            redo = false
            try{
                const summoner = await tft.Summoner.summonerByName(encodeURI(message.content.substring(7)))

                const rows = await sheet.getRows()
                for(let row of rows){
                    if(row["Nom Invocateur"].equalsRiotName(summoner.name)){
                        row["Nom Invocateur"] = summoner.name
                        row["Puuid"] = summoner.puuid
                        await row.save()
                        Logger.log("Ajout Infos", `Informations trouvées pour ${summoner.name}`)
                        message.react("✅")
                        return
                    }
                }
            }catch(err){
                if(err.response && err.response.status == 429){
                    redo = true
                }else if(err.response && err.response.status == 404){
                    Logger.log("Ajout Infos", `Nom d'invocateur inconnu ${message.content.substring(7)}`)
                }else{
                    Logger.log("Ajout Infos", `Erreur inconnue pour ${message.content.substring(7)}`)
                    console.log(err)
                }
            }
        }while(redo)
    }

}