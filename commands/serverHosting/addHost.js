const helpF = require("../../botJS/lib/helpFunctions");
module.exports = {
    name: 'addhost'
    , aliases: []
    , description: "Add a host where you want to host servers from.\nRun this script on your server while it's online. (https://github.com/Trollaer/BOTtaer/blob/main/SCRIPTS/pingAlive.bat)"
    , cType: "Server Hosting"
    , cooldown: 5
    , args: true
    , usage: "<ip it runs on> <unique host_name (no spaces)> "
    , guildOnly: true
    , argsWithUpper: true
    , permissions: "ADMINISTRATOR"
    , async execute(receivedMessage, arguments) { /////////////////////////////// Discord tag speichern von dem nutzer auf diesen dann beim server hinzufügen achten

        //************************** client.serverhosts und DB hinzufügen */
        const dbClient = receivedMessage.client.dbClient;

        const helpF = require("../../botJS/lib/helpFunctions");
        if (arguments.length <= 1) return receivedMessage.reply(this.usage);
        var new_ip = arguments[0];
        var new_host_name = arguments[1];
        var new_personinpower = receivedMessage.author.id;
        console.log(new_ip, new_host_name, new_personinpower)
        let cancel;
        helpF.sendMsg(receivedMessage.channel, `Type '-confirm' to confirm!`, {
            color: "#25e9d9"
            , title: `Do you want to add the host \`${new_host_name}\` with IP: \`${new_ip}\``
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
            dbClient.query("insert into hosts ( ipadress, host_name, personinpower, online) VALUES ($1,$2,$3,$4)", [new_ip, new_host_name, new_personinpower, true], function (dbErrorInsert, dbResponseInsert) {
                if (dbErrorInsert) {
                    let errorMsg = "Unknown Error!";
                    if (dbErrorInsert.code == 23505) {
                        if (dbErrorInsert.constraint === 'hosts_host_name_key')
                            errorMsg = ":x: | There is already a host with the name: `" + new_host_name+"`";
                        else if (dbErrorInsert.constraint === 'hosts_pkey')
                            errorMsg = ":x: | There is already a host running on IP: `" + new_ip +"`";
                    }
                    return helpF.sendMsg(receivedMessage.channel,"", {
                        color: "#f23636"
                        , title: errorMsg
                        , deleteAfter: 10000
                    });
                }
                helpF.sendMsg(receivedMessage.channel, `:white_check_mark: | Added host!`, {
                    color: "#28e925"
                    , deleteAfter: 10000
                });
                receivedMessage.client.serverHosts.set(new_host_name, {
                    hostname: new_host_name
                    , status: true
                    , lastAlivePing: Date.now()
                })
            })
        }
        ///////////////////in list + more infos         aus  id den user machen
        if (receivedMessage.deletable) {
            receivedMessage.delete().catch(console.error);
        }
    }
}