module.exports = {
    name: 'setdjrole'
    , aliases: ["setdj"]
    , description: "Sets the DJ- role for this server."
    , cType: "Music"
    , cooldown: 30
    , args: true
    , guildOnly: true
    , permissions: "ADMINISTRATOR"
    , async execute(receivedMessage, arguments) {
        const helpFkts = require("../../botJS/lib/helpFunctions");
        if (receivedMessage.mentions.roles.size === 0) {
            return helpFkts.sendMsgWithDeleteAfter(receivedMessage.channel, "You need to specify a role with @[rolename]", 20000);
        }
        var addMsg;
        if (receivedMessage.mentions.roles.size > 1) {
            addMsg = "There can only be one DJ-role.\nOnly the first role mentioned was added.";
        }
        var dbClient = receivedMessage.client.dbClient;
        const Discord = require('discord.js');
        var djRole = receivedMessage.mentions.roles.first();
        var guild = receivedMessage.guild;
        await dbClient.query("UPDATE guildConfigs SET DJrole = $1 WHERE guildID = $2", [djRole.id, guild.id], async function (dbError, dbResponse) {
            if (dbError) {
                console.log(dbError);
                receivedMessage.reply("Error");
                return;
            }
            else {
                receivedMessage.client.guildConfigs.get(guild.id).DJrole = djRole.id;
                const exampleEmbed = {
                    color: 0xFFB224
                    , title: "The DJ-role for this server was updated to: ** ` " + djRole.name + " ` **"
                    , description: addMsg ? addMsg : ""
                    , thumbnail: {
                        url: "attachment://bothelpicon.png"
                    }
                };
                const Discord = require('discord.js');
                const attachment = new Discord.MessageAttachment('./resources/icons/bothelpicon.png', 'bothelpicon.png');
                exampleEmbed.files = [
                                    attachment
                                        ]
                receivedMessage.channel.send("@everyone", {
                    embed: exampleEmbed
                });
            }
        });
    }
}