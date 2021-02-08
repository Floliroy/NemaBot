require('dotenv').config()

/**
 * My libraries
 */
const Logger = require('./modules/discordLogger')
const Inscriptions = require('./modules/inscriptions')

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
    if(matchHandled.includes(matchData) //Already get this match
    || matchData.info.queue_id != 1090 //This isnt a normal game
    || new Date() - new Date(matchData.info.game_datetime) >= 1800000){ //Game ended more than 30 min
        return false
    }

    matchHandled.push(matchData)
    return true
}

bot.on('ready', async function(){
    Logger.log("Demarrage", `Log en tant que ${bot.user.tag}`)
})
bot.on('message', async function(message){
    if(message.author.bot) return

    if(message.channel.id == channelsId.inscriptions){
        Inscriptions.handle(message, doc)
    }else if(message.channelsId.id == channelsId.gestion && message.content.startsWith("/inscription ")){
        Inscriptions.manual(message, doc)
    }
})

bot.on('messageUpdate', function(_, message){
    if(message.author.bot) return

    if(message.channel.id == channelsId.inscriptions){
        Inscriptions.handle(message, doc)
    }
})

bot.on('messageDelete', function(message){
    if(message.channel.id == channelsId.inscriptions){
        Inscriptions.delete(message, doc)
    }
})