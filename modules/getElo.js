/**
 * Libraries
 */
const Logger = require('./discordLogger')

const {Tft} = require('riotgames-gg')
const tft = new Tft({region: "EUW", apikey: process.env.RIOT_TOKEN})

module.exports = class GetElo{
    
    static async all(message, doc){
        const sheet = doc.sheetsById["0"]

        const rows = await sheet.getRows()
        for(let row of rows){
            let redo
            do{
                redo = false
                try{
                    const summoner = await tft.League.entriesByPuuid(row["Puuid"])
                    row["Elo"] = summoner[0].tier.substring(0, 1) + summoner[0].tier.substring(1).toLowerCase()
                    await row.save()
                    Logger.log("Recup Elo", `Elo récupéré pour ${row["Nom Invocateur"]} - ${row["Elo"]}`)
                }catch(err){
                    if(err.response && err.response.status == 429){
                        redo = true
                    }else{
                        Logger.log("Recup Elo", `Erreur inconnue pour ${row["Nom Invocateur"]}`)
                        console.log(err)
                    }
                }
            }while(redo)
        }
        message.react("✅")
    }

    static async specific(message, doc){
        const sheet = doc.sheetsById["0"]

        let redo
        do{
            redo = false
            try{
                const summoner = await tft.League.entriesByName(encodeURI(message.content.substring(5)))

                const rows = await sheet.getRows()
                for(let row of rows){
                    if(row["Nom Invocateur"].equalsRiotName(message.content.substring(5))){
                        row["Nom Invocateur"] = summoner[0].name
                        row["Elo"] = summoner[0].tier.substring(0, 1) + summoner[0].tier.substring(1).toLowerCase()
                        await row.save()
                        Logger.log("Recup Elo", `Elo récupéré pour ${row["Nom Invocateur"]} - ${row["Elo"]}`)
                        message.react("✅")
                        return
                    }
                }
            }catch(err){
                if(err.response && err.response.status == 429){
                    redo = true
                }else if(err.response && err.response.status == 404){
                    Logger.log("Ajout Infos", `Nom d'invocateur inconnu ${message.content.substring(5)}`)
                }else{
                    Logger.log("Ajout Infos", `Erreur inconnue pour ${message.content.substring(5)}`)
                    console.log(err)
                }
            }
        }while(redo)
    }

}