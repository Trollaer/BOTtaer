//list
//remove
module.exports = {
    name: 'removeminecraftserverstatusupdates'
    , aliases: ["removemcserver", "rmcs"]
    , description: "Notify if server is on/off"
    , cType: "Minecraft"
    , cooldown: 5
    , args: true
    , usage: "<minecraft_server_name>"
    , guildOnly: true
    , permissions: "ADMINISTRATOR"
    , async execute(receivedMessage, arguments) {
        const dbClient = receivedMessage.client.dbClient;
        const helpF = require("../../botJS/lib/helpFunctions");
        if (arguments.length != 1) return receivedMessage.reply(this.usage);
        var guildID = receivedMessage.guild.id;
        var servername = arguments[0];
        dbClient.query("DELETE FROM mcservernotifylist WHERE mcservername = $1 and guildid = $2", [servername, receivedMessage.guild.id], function (dbErrorSelect, dbResponseSelect) {
            if (dbErrorSelect) {
                return console.log("ERROR delete server " + servername)
            }
            helpF.sendMsg(receivedMessage.channel,"You will no longer receive status updates for `" + servername + "`", {
                color: "#2456f2"
                , deleteAfter: 20000
            })
        })
    }
}