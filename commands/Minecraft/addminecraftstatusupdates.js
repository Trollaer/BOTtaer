//list
//remove
module.exports = {
    name: 'addminecraftserverstatusupdates'
    , aliases: ["addmcserver", "addmcs"]
    , description: "Add a server to get notify if the server is on/off"
    , cType: "Minecraft"
    , cooldown: 5
    , args: true
    , usage: "<minecraft_server_name> <channelID_for_updates>"
    , guildOnly: true
    , permissions: "ADMINISTRATOR"
    , async execute(receivedMessage, arguments) {
        if (arguments.length != 2) return receivedMessage.reply(this.usage);
        var guildID = receivedMessage.guild.id;
        var servername = arguments[0];
        var channelID = arguments[1];
        const dbClient = receivedMessage.client.dbClient;
        dbClient.query("SELECT DISTINCT mcservername FROM mcservernotifylist WHERE mcservername = $1", [servername], function (dbErrorSelect, dbResponseSelect) {
            if (dbErrorSelect || dbResponseSelect.rows > 1) {
                return console.log("ERROR select server " + servername)
            }
            if (dbResponseSelect.rows.length == 0) {
                return receivedMessage.reply("No server with this name.")
            }
            dbClient.query("INSERT INTO mcservernotifylist (mcservername, guildid ,channelid, msgid) VALUES($1,$2,$3,$4) ON CONFLICT (mcservername, guildid) DO UPDATE SET channelid = $3 , msgid = $4", [servername, guildID, channelID, null], function (dbErrorInsert, dbResponseInsert) {
                if (dbErrorInsert) {
                    console.log(dbErrorInsert);
                    return;
                }
            })
        })
    }
}