module.exports = {
    name: "configuresoundboard"
    , aliases: ["csb"]
    , description: "Turn on/off the soundboard for a server."
    , cType: "Soundboard"
    , usage: "<on/off>"
    , args: true
    , cooldown: 30
    , permissions: "ADMINISTRATOR"
    , guildOnly: true
    , async execute(message, arguments) {
        const helpF = require("../../botJS/lib/helpFunctions");
        var dbClient = message.client.dbClient;
        const Discord = require('discord.js');
        var guild = message.guild;
        var returnMsg = "The soundboard for this server was turned "
        var newState = false;
        if (arguments[0] === "off") {
            returnMsg += "**off**"
            newState = false;
        }
        else if (arguments[0] === "on") {
            returnMsg += "**on**"
            newState = true;
        }
        await dbClient.query("UPDATE guildConfigs SET soundboard = $1 WHERE guildID = $2", [newState, guild.id], async function (dbError, dbResponse) {
            if (dbError) {
                console.log(dbError);
                returnMsg = "There was an ERROR (de)aktivating the soundboard for this server!"
            }
            else {
                message.client.guildConfigs.get(guild.id).soundboard = newState;
            }
            const exampleEmbed = {
                color: 0xFFB224
                , title: returnMsg
                , thumbnail: {
                    url: "attachment://bothelpicon.png"
                }
            };
            const Discord = require('discord.js');
            const attachment = new Discord.MessageAttachment('./resources/icons/bothelpicon.png', 'bothelpicon.png');
            exampleEmbed.files = [attachment];
            message.channel.send("@everyone", {
                embed: exampleEmbed
            });
        });
    }
}