module.exports = {
    name: 'setprefix'
    , description: "Sets the prefix for this server.\nDefault '$'"
    , cType: "Basic"
    , cooldown: 30
    , args: true
    , guildOnly: true
    , permissions: "ADMINISTRATOR"
    , async execute(receivedMessage, arguments) {
        if (!receivedMessage.channel.guild) {
            receivedMessage.reply("The prefix for DMs is always '$' and can not be changed!");
            return;
        }
        var dbClient=receivedMessage.client.dbClient;
        const Discord = require('discord.js');
        var guild = receivedMessage.guild;
        var newPrefix = arguments[0];
        var validPrefixes = ["!", "§", "$", "%", "&", "/", "(", ")", "=", "?", "ß", "{", "}", "[", "]", "+", "*", "~", "#", "_", "-", "<", ">", "|", ".", ":", ",", ";", "°", "^"];
        if (newPrefix.length !== 1) {
            receivedMessage.reply("Please only one character as prefix.");
            return;
        }
        else if (!validPrefixes.includes(newPrefix)) {
            receivedMessage.reply("Please chose a valid prefix:\n" + validPrefixes.join(" , "));
            return;
        }
        await dbClient.query("UPDATE guildConfigs SET prefix = $1 WHERE guildID = $2", [newPrefix, guild.id], async function (dbError, dbResponse) {
            if (dbError) {
                console.log(dbError);
                receivedMessage.reply("Error");
                return;
            }
            else {
                receivedMessage.client.guildConfigs.get(guild.id).prefix = newPrefix;
                const exampleEmbed = {
                    color: 0xFFB224
                    , title: "The prefix for this server was updated to: ** ` " + newPrefix + " ` **"
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