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
        var response = ""
        dbClient.query("SELECT mcservername , channelid FROM mcservernotifylist WHERE guildid LIKE $1", ["%DUMMY%"], function (dbErrorSelect, dbResponseSelect) {
            if (dbErrorSelect) {
                return console.log("ERROR select all servers")
            }
            dbResponseSelect.rows.forEach(r => {
                response += `\n\`${r.mcservername}\` running on PORT: \`${r.channelid}\``
            });
            receivedMessage.channel.send(response);
        })
    }
}