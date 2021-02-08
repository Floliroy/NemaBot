/**
 * Libraries
 */
const Discord = require('discord.js')
const bot = new Discord.Client()
bot.login(process.env.DISCORD_TOKEN)

/**
 * Change base console.log
 */
const moment = require('moment')
const basicConsole = console.log
console.log = function(){
    const date = `[${moment(new Date()).format("DD/MM/yyyy - HH:mm:ss")}]`
    Array.prototype.unshift.call(arguments, date)
    basicConsole.apply(this, arguments)
}

/**
 * Channel to log in
 */
let channel

module.exports = class DiscordLogger{

    static async log(titre, texte){
        console.log(`${titre.toUpperCase()}: ${texte}`)

        if(!channel){
            channel = await bot.channels.fetch("808267686005047356")
        }
        if(channel){
            channel.send(new Discord.MessageEmbed()
                .setTitle(titre)
                .setDescription(texte)
                .setTimestamp()
            )
        }
    }
}