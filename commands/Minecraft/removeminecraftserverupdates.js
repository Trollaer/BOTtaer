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
        if (arguments.length != 1) return receivedMessage.reply(this.usage);
        var guildID = receivedMessage.guild.id;
        var servername = arguments[0];
        dbClient.query("DELETE FROM mcservernotifylist WHERE mcservername = $1", [servername], function (dbErrorSelect, dbResponseSelect) {
            if (dbErrorSelect) {
                return console.log("ERROR delete server " + servername)
            }
            //nolonge updates //delete lastmsg
        })
    }
}