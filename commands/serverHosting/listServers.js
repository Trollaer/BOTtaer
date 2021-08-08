
const helpF = require("../../botJS/lib/helpFunctions");
module.exports = {
    name: 'listservers'
    , aliases: ["ls"]
    , description: "Lists all servers that are currently hosted."
    , cType: "Server Hosting"
    , cooldown: 5
    , args: false
    , guildOnly: true
    , async execute(receivedMessage, arguments) {
        const dbClient = receivedMessage.client.dbClient;
        var response = ""
        var hostMsg = ""
        dbClient.query("SELECT h.host_name, h.personinpower, h.online AS hostonline, hs.server_name, hs.game, hs.game_version, hs.mods, hs.online AS serveronline FROM hosts h JOIN hosted_servers hs ON h.ipadress = hs.ip GROUP BY  h.host_name, h.ipadress, hs.ip, hs.server_name ", async function (dbErrorSelect, dbResponseSelect) {
            if (dbErrorSelect) {
                return console.log("ERROR select all servers")
            }
            var curHost = undefined
            var splitCount = 1
            await dbResponseSelect.rows.forEach(r => {
                if (curHost != r.host_name) {
                    if (response.length + hostMsg.length > 3500) {
                        sendResponse(receivedMessage.channel, response,splitCount);
                        splitCount++;
                        response = hostMsg +"````";
                    } else {
                        if(curHost) response += "\n" + hostMsg +"```"
                    }
                    curHost = r.host_name
                    hostMsg = `__***${r.host_name}*** by ${r.personinpower} (\`${r.hostonline ? "ONLINE" : "OFFLINE"}\`)__\`\`\`bash\n`
                }
                hostMsg += `\n+ "${r.server_name}" : ${r.game}:${r.game_version ? r.game_version : ""}: ${r.mods ? "with Mods" : "no Mods"} ("${r.serveronline ? "ONLINE" : "OFFLINE"}")`
            });
            response += "\n" + hostMsg + "\n```"
            sendResponse(receivedMessage.channel, response)
            if (receivedMessage.deletable) {
                receivedMessage.delete().catch(console.error);
            }
        })
    }
}
function sendResponse(channel, response,part) {
    helpF.sendMsg(channel, response + "\nUse '$infosAboutServer <servername>' for more Infomations about a server!", {
        color: "#2456f2"
        , title: "List of all servers registered"+(part?("(part: "+part+")"):"")+":"
        , deleteAfter: 60000
    })
}
