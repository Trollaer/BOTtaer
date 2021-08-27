const helpF = require("../../botJS/lib/helpFunctions");
module.exports = {
    name: 'infosaboutservers'
    , aliases: ["ias"]
    , description: "More detailed informations about a hosted server. (like ip, game or mods)"
    , cType: "Server Hosting"
    , usage: "<server_name>"
    , cooldown: 5
    , guildOnly: true
    , argsWithUpper: true
    , async execute(receivedMessage, arguments) {
        const dbClient = receivedMessage.client.dbClient;
        var servername = arguments.join("");
        var response;
        var title;
        dbClient.query("SELECT h.host_name, h.personinpower, hs.server_name, hs.game, hs.game_version, hs.mods, hs.online AS serveronline, hs.ip, hs.port FROM hosts h JOIN hosted_servers hs ON h.ipadress = hs.ip WHERE hs.server_name = $1",[servername], async function (dbErrorSelect, dbResponseSelect) {
            if (dbErrorSelect) {
                return console.log("ERROR select all servers")
            }
            if(dbResponseSelect.rows.length === 0){
                title="**There is no server with the name: `"+servername+"`**"
                response = "Please make sure your spelling is correct (spaces included).\n\nTry `$listservers` to find the server you are looking for!"
            }else{
                r=dbResponseSelect.rows[0];
                title = "**More informations about the server: `"+servername+"`!**"
                response = `\`${servername}\` is a ${r.game}-Server ${r.game_version ? "running on version '"+r.game_version+"'": ""}${r.mods ? " with mods '"+r.mods+"'" : ""}.\nIt's running on \`${r.ip}:${r.port}\`\nThe server is currently: **${r.serveronline ? "ONLINE" : "OFFLINE"}**\n\nFor further questions ask: ${r.personinpower}`
            }
            helpF.sendMsg(receivedMessage.channel, response, {
                color: "#2456f2"
                , title: title
                , deleteAfter: 60000
            })
            if (receivedMessage.deletable) {
                receivedMessage.delete().catch(console.error);
            }
        })
    }
}