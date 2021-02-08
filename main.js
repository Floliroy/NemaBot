require('dotenv').config()

/**
 * My libraries
 */
const Logger = require('./modules/discordLogger')
const Inscriptions = require('./modules/inscriptions')
const GetElo = require('./modules/getElo')
const GeneratePools = require('./modules/generatePools')

/**
 * Init discord bot
 */
const Discord = require('discord.js')
const bot = new Discord.Client()
bot.login(process.env.DISCORD_TOKEN)

/**
 * Init the google spreadsheet
 */
const {GoogleSpreadsheet} = require('google-spreadsheet')
const doc = new GoogleSpreadsheet("1BhTiwPWrGwnBtXDHz1jsOvRZRlHwxfaCOL_h8jQYJEA")
doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_EMAIL,
    private_key: process.env.GOOGLE_TOKEN.replace(/\\n/g, '\n')
})
doc.loadInfo()

/**
 * Constants
 */
const channelsId = {
    logger: "808267686005047356",
    inscriptions: "808267705547096104",
    gestion: "808292576770785310"
}

let matchHandled = new Array()
function checkValidMatch(matchData){
    if(matchHandled.includes(matchData) //Already got this match
    || matchData.info.queue_id != 1090 //This isnt a normal game
    || new Date() - new Date(matchData.info.game_datetime) >= 1800000){ //Game ended more than 30 min
        return false
    }

    matchHandled.push(matchData)
    return true
}

bot.on('ready', async function(){
    console.log(`DEMARRAGE: Log en tant que ${bot.user.tag}`)
})

bot.on('message', async function(message){
    if(message.author.bot || message.channel instanceof Discord.DMChannel) return

    if(message.channel.id == channelsId.inscriptions){
        Inscriptions.handle(message, doc)
    }else if(message.channel.id == channelsId.gestion){
        if(message.content.startsWith("/puuid ")){
            Inscriptions.manual(message, doc)
        }else if(message.content.startsWith("/elo")){
            if(message.content.includes(" ")){
                GetElo.specific(message, doc)
            }else{
                GetElo.all(doc).then(function(){
                    message.react("✅")
                })
            }
        }else if(message.content.startsWith("/generate ")){
            let args = message.content.split(" ")
            if(args[1] == "init"){
                GeneratePools.generateInit(doc).then(function(){
                    message.react("✅")
                })
            }else if(!isNaN(args[1])){
                GeneratePools.generateRound(args[1], doc).then(function(){
                    message.react("✅")
                })
            }
        }
    }
})

bot.on('messageUpdate', function(_, message){
    if(message.author.bot || message.channel instanceof Discord.DMChannel) return

    if(message.channel.id == channelsId.inscriptions){
        Inscriptions.handle(message, doc)
    }
})

bot.on('messageDelete', function(message){
    if(message.channel.id == channelsId.inscriptions){
        Inscriptions.delete(message, doc)
    }
})