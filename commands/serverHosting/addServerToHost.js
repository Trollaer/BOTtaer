//list
//remove
module.exports = {
    name: 'addservertohost'
    , description: "Add a server to a host. You need to be the one who added the host!"
    , cType: "Server Hosting"
    , cooldown: 5
    , args: true
    , usage: "<host_name (no spaces)> <server_name (no spaces)> <port> <online/offline> <game> [-v <game_version>] [-m <mods>]"
    , guildOnly: true
    , permissions: "ADMINISTRATOR"
    , argsWithUpper: true
    , async execute(receivedMessage, arguments) {
        const helpF = require("../../botJS/lib/helpFunctions");
        const dbClient = receivedMessage.client.dbClient;
        if (arguments.length <= 1) return receivedMessage.reply(this.usage);
        var hostname = arguments.shift();
        var servername = arguments.shift();
        var port = arguments.shift();
        var status = arguments.shift();
        if (status.toLowerCase() == 'offline' ){
            status=false;
        }else if( status.toLowerCase() == 'online') {
            status= true;
        } else{
            return receivedMessage.reply("You need to specify the current status of the server.\n" + this.usage);
        }
        var rest = arguments.join(" ");
        let gameVersion_and_mods = rest.split(" -m ")
        var mods = gameVersion_and_mods[1];
        let game_and_version = gameVersion_and_mods[0].split(" -v ")
        var game = game_and_version[0];
        var version = game_and_version[1];

        let cancel;
        //console.log("Host: " + hostname + "\nServer: " + servername + "\nPort: " + port + "\nStatus: " + status + "\nGame: " + game + "\nVersion: " + version + "\nMods: " + mods);

        helpF.sendMsg(receivedMessage.channel, `**Game: ** ${game} ${version ? "[" + version + "]" : ""}\n${mods ? `**Mods: ** ${mods}` : ""}\n**Currently:** \`${status}\`\n\nType '-confirm' to confirm!`, {
            color: "#25e9d9"
            , title: `Do you want to add \`${servername}\` to \`${hostname}\` with port: \`${port}\``
            , deleteAfter: 30000
        });
        await receivedMessage.channel.awaitMessages(m => (m.author.id === receivedMessage.author.id) && (m.content === "-confirm"), {
            max: 1
            , time: 20000
            , errors: ["time"]
        }).catch((err) => {
            cancel = true;
            return helpF.sendMsg(receivedMessage.channel, ":x: | Time's up!", {
                color: "#f23636"
                , deleteAfter: 10000
            });
        });
        if (!cancel) {
            dbClient.query("SELECT  * FROM hosts WHERE host_name=$1", [hostname], function (dbErrorSelect, dbResponseSelect) {
                if (dbErrorSelect) {
                    return console.log(dbErrorSelect)
                }

                if (dbResponseSelect.rows.length == 0) {
                    return receivedMessage.reply("No server with this name.")
                }
                if(dbResponseSelect.rows[0].personinpower!==receivedMessage.author.id){
                    return receivedMessage.reply("You are not allowed to edit this host.")
                }
                dbClient.query("INSERT INTO hosted_servers (server_name, ip, port, game, game_version, mods, online) VALUES ($1,$2,$3,$4,$5,$6,$7);", [servername,dbResponseSelect.rows[0].ipadress,port,game,version,mods,dbResponseSelect.rows[0].online?status:false], function (dbErrorInsert, dbResponseInsert) {
                    if (dbErrorInsert) {
                        return console.log(dbErrorInsert)
                    }
                    helpF.sendMsg(receivedMessage.channel, `:white_check_mark: | Added server to host!`, {
                        color: "#28e925"
                        , deleteAfter: 10000
                    });
                })
            })
        }

        if (receivedMessage.deletable) {
            receivedMessage.delete().catch(console.error);
        }
    }
}