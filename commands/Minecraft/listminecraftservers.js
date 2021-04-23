//remove
module.exports = {
    name: 'lisminecraftservers'
    , aliases: ["lmcservers", "lmcs"]
    , description: "Notify if server is on/off"
    , cType: "Minecraft"
    , cooldown: 5
    , args: false
    , guildOnly: true
    , permissions: "ADMINISTRATOR"
    , async execute(receivedMessage, arguments) {
        const dbClient = receivedMessage.client.dbClient;
        const helpF = require("../../botJS/lib/helpFunctions");
        var response = ""
        dbClient.query("SELECT * FROM mcserverlist", function (dbErrorSelect, dbResponseSelect) {
            if (dbErrorSelect) {
                return console.log("ERROR select all servers")
            }
            dbResponseSelect.rows.forEach(r => {
                response += `\n+ **${r.mcservername}** running on: \`${r.address}:${r.port}\``
                if (r.modpack) {
                    response += " with modpack: " + r.modpack;
                }
            });
            helpF.sendMsg(receivedMessage.channel, response, {
                color: "#2456f2"
                , title: "List of all servers currently running:"
                , deleteAfter: 30000
            })
        })
    }
}