//list
//remove
module.exports = {
    name: 'removeserverforupdates'
    , aliases: ["rsfu"]
    , description: "Remove a server to no longer get status updates.\nUse `$listServers` to see all servers."
    , cType: "Server Hosting"
    , cooldown: 10
    , args: true
    , usage: "<server_name>"
    , guildOnly: true
    , argsWithUpper: true
    , permissions: "ADMINISTRATOR"
    , async execute(receivedMessage, arguments) {
        const dbClient = receivedMessage.client.dbClient;
        const helpF = require("../../botJS/lib/helpFunctions");
        var guildID = receivedMessage.guild.id;
        var servername = arguments.join("");
        dbClient.query("SELECT guildid, channelid, msgid FROM notifylist WHERE server_name = $1", [servername], async function (dbErrorSelect, dbResponseSelect) {
            if (dbErrorSelect) {
                return console.log("ERROR while loading " + servername);
            }
            if (dbResponseSelect.rows.length == 0) {
                return console.log("No such  server " + servername);
            }

            var r = dbResponseSelect.rows[0];
            var msgID = r.msgid;
            var channelID = r.channelid;
            var guildID = r.guildid;
            var guild = receivedMessage.client.guilds.cache.get(guildID);
            if (!guild) {
                console.log("NO Guild found for : " + guildID);
                return;
            }
            var channel = guild.channels.cache.get(channelID);
            if (!channel) {
                console.log("NO Channel found for : " + guild.name + " with " + channelID);
                return;
            }
            if (msgID) {
                //console.log(channel.messages.cache);
                var Smsg = await channel.messages.fetch(msgID).catch("Smsg ERROR");;
                if (Smsg) {
                    Smsg.delete().catch("Smsg ERROR 2");
                }
            }
        })
        dbClient.query("DELETE FROM notifylist WHERE server_name = $1 and guildid = $2", [servername, guildID], function (dbErrorSelectD, dbResponseSelectD) {
            if (dbErrorSelectD) {
                return console.log("ERROR delete server " + servername + " from " + receivedMessage.guild.name)
            }
            helpF.sendMsg(receivedMessage.channel, "You will no longer receive status updates for `" + servername + "`", {
                color: "#2456f2"
                , deleteAfter: 20000
            })
        })
        if (receivedMessage.deletable) {
            receivedMessage.delete().catch(console.error);
        }
    }
}