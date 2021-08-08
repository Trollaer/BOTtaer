//list
//remove
module.exports = {
    name: 'addhost'
    , aliases: []
    , description: "Add Host"
    , cType: "Server Hosting"
    , cooldown: 5
    , args: true
    , usage: "<server name>"
    , guildOnly: true
    , permissions: "ADMINISTRATOR"
    , async execute(receivedMessage, arguments) {

        //************************** client.serverhosts und DB hinzufügen */
        const helpF = require("../../botJS/lib/helpFunctions");
        if (arguments.length > 1) return receivedMessage.reply(this.usage);
        var guildID = receivedMessage.guild.id;
        var servername = arguments[0];
        var channelID = receivedMessage.channel.id;
        const dbClient = receivedMessage.client.dbClient;
        dbClient.query("SELECT * FROM mcserverlist WHERE mcservername = $1", [servername], function (dbErrorSelect, dbResponseSelect) {
            if (dbErrorSelect || dbResponseSelect.rows > 1) {
                return console.log("ERROR select server " + servername)
            }
            if (dbResponseSelect.rows.length == 0) {
                return receivedMessage.reply("No server with this name.")
            }
            var msgT = `Status updates for \`${servername}\` will now be posted in this channel.`
            var msgD = `It runs on \`${dbResponseSelect.rows[0].address}:${dbResponseSelect.rows[0].port}\``;
            if (dbResponseSelect.rows[0].modpack) {
                msgD += " with the modpack: " + dbResponseSelect.rows[0].modpack;
            }
            dbClient.query("INSERT INTO mcservernotifylist (mcservername, guildid ,channelid, msgid) VALUES($1,$2,$3,$4) ON CONFLICT (mcservername, guildid) DO UPDATE SET channelid = $3 , msgid = $4", [servername, guildID, channelID, null], function (dbErrorInsert, dbResponseInsert) {
                if (dbErrorInsert) {
                    console.log(dbErrorInsert);
                    return;
                }
                helpF.sendMsg(receivedMessage.channel, msgD, {
                    color: "#2456f2"
                    , title: msgT
                    , deleteAfter: 20000
                })
            })
        })
        if (receivedMessage.deletable) {
            receivedMessage.delete().catch(console.error);
        }
    }
}