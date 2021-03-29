module.exports = async(client, guild) => {
    const dbClient = client.dbClient;
    await dbClient.query("INSERT INTO guildConfigs (guildID, DJRole) VALUES ($1 , $2)", [guild.id, guild.roles.everyone.id], function (dbError, dbResponse) {
        if (dbError) {
            console.log(dbError);
            return;
        }
        else {
            console.log("Joined the guild: '" + guild.name + "' !!!!!!!!!");
        }
    });
    guild.fetchAuditLogs({
        type: "BOT_ADD"
        , limit: 1
    }).then(log => { // Fetching 1 entry from the AuditLogs for BOT_ADD.
            var userWhoAddedMe = log.entries.first().executor; // Sending the message to the executor.
            var msgEmbed = {
                color: 0x09fc81
                , thumbnail: {
                    url: "attachment://botbasicicon.png"
                }
            };
            const Discord = require('discord.js');
            const attachment = new Discord.MessageAttachment('./resources/icons/botbasicicon.png', 'botbasicicon.png');
            msgEmbed.files = [attachment];
            if (!userWhoAddedMe) return console.log("NO USER who added");
            if (userWhoAddedMe.id !== guild.owner.user.id) {
                msgEmbed.description = `Thank you for adding **böt** to \`${guild.name}\`. The owner was messaged, too.`;
                userWhoAddedMe.send({
                    embed: msgEmbed
                })
            }
            msgEmbed.description = "**böt** was added to `" + guild.name + "`.\nThere is some stuff you can configure:\n```fix\n+ Prefix: '$setPrefix'\n\n+ DJrole: '$setDJrole'\n\n+ Soundboard: '$soundboard <on/off>```\nFor more information use '$help'.";
            userWhoAddedMe.send({
                embed: msgEmbed
            })
        }
        //schauen ob der der owner ist
        //ja -> dann wegen (password für web interface)
        //nein -> sagen, dass (configs for web interface an owner) 
        //selbe für djrole / prefix / soundboard
    );
}