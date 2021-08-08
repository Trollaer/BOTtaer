//list
//remove
module.exports = {
    name: 'addserverforupdates'
    , aliases: ["asfu"]
    , description: "Add a server to get notify if the server is online/offline. The status will be send in the channel this command is posted.\nUse `$listServers` to see all servers."
    , cType: "Server Hosting"
    , cooldown: 10
    , args: true
    , usage: "<server_name>"
    , guildOnly: true
    , permissions: "ADMINISTRATOR"
    , async execute(receivedMessage, arguments) {
        const helpF = require("../../botJS/lib/helpFunctions");
        var guildID = receivedMessage.guild.id;
        var servername = arguments.join(" ");
        var channelID = receivedMessage.channel.id;
        const dbClient = receivedMessage.client.dbClient;
        dbClient.query("SELECT * FROM hosted_servers WHERE server_name = $1", [servername], function (dbErrorSelect, dbResponseSelect) {
            if (dbErrorSelect || dbResponseSelect.rows > 1) {
                return console.log("ERROR select server while adding status updates: " + servername)
            }
            if (dbResponseSelect.rows.length == 0) {
                return receivedMessage.reply("No server with this name.")
            }
            var msgT = `Status updates for \`${servername}\` will now be posted in this channel.`
            var version_mods_text = "";
            if (dbResponseSelect.rows[0].game_version) version_mods_text += `(**${dbResponseSelect.rows[0].game}** [${dbResponseSelect.rows[0].game_version}])`
            if (dbResponseSelect.rows[0].mods) version_mods_text += `with mod/s ${modsR}`
            var msgD = `It runs on \`${dbResponseSelect.rows[0].ip}:${dbResponseSelect.rows[0].port}\` ${version_mods_text}.`;
            helpF.sendMsg(receivedMessage.channel, msgD, {
                color: "#2456f2"
                , title: msgT
                , deleteAfter: 20000
            })
            var msgEmbed = {
                color: dbResponseSelect.rows[0].online ? "#0CFA08" : "#FF0101"
                , title: `The ${dbResponseSelect.rows[0].game}-Sever: \`${dbResponseSelect.rows[0].server_name}\` is currently **${dbResponseSelect.rows[0].online ? "ONLINE" : "OFFLINE"}!**`
                , description: `${msgD}.`
            }
            receivedMessage.channel.send({
                embed: msgEmbed
            }).then(mssg => {
                dbClient.query("INSERT INTO notifylist (server_name, guildid ,channelid, msgid) VALUES($1,$2,$3,$4) ON CONFLICT (server_name, guildid) DO UPDATE SET channelid = $3 , msgid = $4", [servername, guildID, channelID, mssg.id], function (dbErrorInsert, dbResponseInsert) {
                    if (dbErrorInsert) {
                        console.log(dbErrorInsert);
                        return;
                    }
                })
            }).catch("No mssg asfu");
        })
        if (receivedMessage.deletable) {
            receivedMessage.delete().catch(console.error);
        }
    }
}