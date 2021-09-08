//https://discordjs.guide/additional-info/changes-in-v13.html#client

//*******Message Handling**********
console.log(process.version)
const ALIVE_CHECK_TIME = 1000 * 60 * 16
const ALIVE_TIMER = 1000 * 60 * 15
const {
    DC_TOKEN, DATABASE_URL, TEST_SERVER
} = require("./util/BOTtaerUtil.js");
const fs = require('fs');
const Discord = require('discord.js');
var pg = require("pg");
if (!DATABASE_URL || !DC_TOKEN) {
    console.log(DATABASE_URL + " || " + DC_TOKEN + " || " + TEST_SERVER)
    console.log("Error: Environment variables");
    process.exit(1);
}
pg.defaults.ssl = true;
var dbClient = new pg.Client({
    connectionString: DATABASE_URL
    , ssl: {
        rejectUnauthorized: false
    }
});
dbClient.connect();
const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES", "GUILD_VOICE_STATES", "GUILD_BANS","GUILD_EMOJIS_AND_STICKERS","GUILD_INTEGRATIONS","GUILD_WEBHOOKS","GUILD_INVITES"]
});
client.dbClient = dbClient;
client.guildConfigs = new Discord.Collection(); //{guildID[key],prefix,DJrole,busy[true,wenn music oder monitoring], monitoringAll { start time, users[],currentlyMonitoring},monitoringUsers}
client.commands = new Discord.Collection();
client.musicQueue = new Discord.Collection(); // {playing,songs,connection,loop,volume}
client.cooldowns = new Discord.Collection();
client.serverHosts = new Map();
//const prefix = "$";
const helpF = require("./botJS/lib/helpFunctions.js")
//commands einlesen
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}
const events = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
//init guild configs
initGuildConfigs();
for (const file of events) {
    console.log(`Loading discord.js event ${file}`);
    const event = require(`./events/${file}`);
    client.on(file.split(".")[0], event.bind(null, client));
};
async function initGuildConfigs() {
    try {
        await dbClient.query("SELECT * FROM guildConfigs", async function (dbError, dbResponse) {
            if (dbError) {
                console.log(dbError);
                return;
            }
            else {
                dbResponse.rows.forEach(r => {
                    client.guildConfigs.set(r.guildid, {
                        guildID: r.guildid
                        , prefix: TEST_SERVER ? "T" : r.prefix
                        , DJrole: r.djrole
                        , busy: false
                        , monitoringAll: null
                        , monitoringUsers: new Discord.Collection()
                        , soundboard: r.soundboard
                    })
                })
                //console.log(client.guildConfigs)
            }
        });
    }
    catch (error) {
        return console.log("Init went wrong!\n" + error);
    }
}
if (!TEST_SERVER) { initServerHosts() }
async function initServerHosts() {
    try {
        dbClient.query("UPDATE hosts SET online = $1", [true], async function (dbErrorU, dbResponseU) {
            if (dbErrorU) {
                console.log(dbErrorU);
                return;
            }
            dbClient.query("SELECT host_name, online FROM hosts", async function (dbError, dbResponse) {
                if (dbError) {
                    console.log(dbError);
                    return;
                }
                else {
                    dbResponse.rows.forEach(r => {
                        client.serverHosts.set(r.host_name, {
                            hostname: r.host_name
                            , status: r.online
                            , lastAlivePing: Date.now()
                        })
                    })
                    client.serverHosts.forEach(h => {
                        h.timerID = setInterval(function () {
                            var currentTime = Date.now()
                            if ((currentTime - ALIVE_CHECK_TIME) > h.lastAlivePing) {
                                updateHostStatus(h.hostname, "offline");
                                clearInterval(h.timerID)
                                h.timerID = null;
                            }
                        }, ALIVE_TIMER);
                    })
                }
            });
        })
    }
    catch (error) {
        return console.log("Host Init went wrong!\n" + error);
    }
}
//********** soundboar server *******************/
var express = require("express");
var bodyParser = require("body-parser");
var session = require("express-session");
const { hostname } = require("os");
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});
const PORT = process.env.PORT ? process.env.PORT : 3000;
var app = express();
app.use(express.static('serverLib'));
app.set("views", "./serverLib/views");
app.set("view engine", "pug");
app.get("/", function (req, res) {
    //console.log(clientS);
    res.render("layout")
});

app.get("/soundboard/:guildID", function (req, res) {
    var guildD = client.guilds.cache.get(req.params.guildID);
    if (!guildD) {
        res.render("soundboard", {
            error: "KEINE GUILD"
        })
        return;
    }
    var confG = client.guildConfigs.get(req.params.guildID);
    if (!confG) {
        res.render("soundboard", {
            error: "Keine Configs"
        })
        return;
    }
    if (!confG.soundboard) {
        console.log("DEactivated")
        res.render("soundboard", {
            error: "The soundboard for this guild was DEactivated."
            , guild: guildD
        })
        return;
    }
    res.render("soundboard", {
        guild: {
            id: guildD.id
            , name: guildD.name
        }
    })
});
app.get("/soundboardAPI/getSounds", function (req, res) {
    var folderList = [];
    //console.log("TEST LOG");
    fs.readdirSync('./resources/soundEffects').forEach(folder => {
        var fileList = [];
        fs.readdirSync(`./resources/soundEffects/${folder}`).forEach(file => {
            fileList.push(file)
        })
        folderList.push({
            folderName: folder
            , files: fileList
        });
    })
    //console.log(folderList);
    res.send(folderList);
});
app.get("/soundboardAPI/requestPlay/:guildID/:folder/:file", function (req, res) {
    var guildID = req.params.guildID;
    var folderName = req.params.folder;
    var fileName = req.params.file;
    var guild = client.guilds.cache.get(guildID)
    var errorMSG = "";
    var confG = client.guildConfigs.get(req.params.guildID);
    if (!confG) {
        errorMSG += "Guildconfig Error.\n"
    }
    else {
        if (!confG.soundboard) {
            errorMSG += "**Soundboard is deactivated for this server.**"
        }
        else {
            if (!fileName || fileName === "") {
                errorMSG += "Requires file!\n"
            }
            if (!folderName || folderName === "") {
                errorMSG += "Requires folder!\n"
            }
            if (!guild) {
                errorMSG += "No guild found!\n";
            }
            else {
                if (!guild.me.voice.channelId) {
                    errorMSG += "Not in a channel!\n"
                }
                if (!guild.me.voice.connection) {
                    errorMSG += "No connection to channel!\n"
                }
            }
        }
        var musicQ = client.musicQueue.get(guildID);
        if (musicQ) {
            errorMSG += "Currently playing music!\n";
        }
        if (errorMSG) {
            res.send({
                error: errorMSG
            })
        }
        else {
            var connection = guild.me.voice.connection
            try {
                const dispatcher = connection.play("./resources/soundEffects/" + folderName + "/" + fileName)
            }
            catch (err) {
                console.log(err)
            }
            res.send({
                message: "Playing"
            });
        }
    }
});
app.get("/ping", function (req, res) {
    //console.log(clientS);
    res.send("pong");
});
//************* Server hosting **********/
app.get("/imStillAlive/:hostname", function (req, res) {
    // hostname erst schauen ob in der liste wenn nicht DB anfrage (erg) dann hinzufügen, (sonst) nicht
    // beim hoch fahren alles hosts auf online die in DB + liste hinzufügen dann schauen ob ping
    //console.log("ALIVE")
    var hostname = req.params.hostname;
    var host = client.serverHosts.get(hostname)
    if (!host) {
        res.status(300).send("No host with name: ")
        return
    }
    if (!host.timerID) {
        updateHostStatus(hostname, "online", res);
        host.timerID = setInterval(function () {
            var currentTime = Date.now()
            if ((currentTime - ALIVE_CHECK_TIME) > host.lastAlivePing) {
                updateHostStatus(hostname, "offline", res);
                clearInterval(host.timerID)
                host.timerID = null;
            }
        }, ALIVE_TIMER);
    }
    host.lastAlivePing = Date.now()
    res.send("Alive")
});
app.get("/updateHostStatus/:hostname/:status", function (req, res) {
    var hostname = req.params.hostname;
    var status = req.params.status === "online" ? "online" : "offline";
    var host = client.serverHosts.get(hostname)
    if (!host) {
        res.status(300).send({ error: "No host with name: " + hostname })
        return
    }
    res.send("Updating Host-Status")
    updateHostStatus(hostname, status, res);
});
app.get("/updateServerStatus/:servername/:status", function (req, res) {
    //when online check if host is online
    var servername = req.params.servername;
    var status = req.params.status === "online" ? "online" : "offline";
    dbClient.query("SELECT ip, port, server_name, game, game_version, mods, online FROM hosted_servers WHERE server_name = $1", [servername], function (dbErrorSelect, dbResponseSelect) {
        if (dbErrorSelect) {
            if (res) res.send("ERROR while loading " + servername)
            return console.log("ERROR while loading " + servername);
        }
        setServer(status, servername)
        if (dbResponseSelect.rows.length == 0) {
            if (res) res.send("No server found for: " + servername)
            return console.log("No server found for: " + servername);
        }
        if (res) res.send("Server: " + servername + " is now " + status)
        updateServerStatus(dbResponseSelect.rows[0].ip, dbResponseSelect.rows[0].port, dbResponseSelect.rows[0].server_name, dbResponseSelect.rows[0].game, dbResponseSelect.rows[0].game_version, dbResponseSelect.rows[0].mods, status)

    });
})
async function updateHostStatus(hostname, status) {
    if (status === "online") {
        setHost(status, hostname)
    } else {
        dbClient.query("SELECT h.ipadress AS ip, port, server_name, game, game_version, mods, h.online FROM hosts h JOIN hosted_servers hs ON h.ipadress = hs.ip WHERE h.host_name = $1 AND hs.online = true", [hostname], function (dbErrorSelect, dbResponseSelect) {
            if (dbErrorSelect) {
                return console.log("ERROR while loading " + hostname);
            }
            setHost(status, hostname)
            if (dbResponseSelect.rows.length == 0) {
                return console.log("No running servers on host: " + hostname);
            }
            dbResponseSelect.rows.forEach(r => {
                updateServerStatus(r.ip, r.port, r.server_name, r.game, r.game_version, r.mods, status)
            })

        })
    }
}
function setHost(status, hostname) {
    dbClient.query("UPDATE hosts SET online = $1 WHERE host_name = $2", [status == "online" ? true : false, hostname], function (dbErrorUpdate, dbResponseUpdate) {
        if (dbErrorUpdate) {
            return console.log("ERROR while updating " + hostname);
        }
    })
}
async function updateServerStatus(ipR, portR, server_nameR, gameR, game_versionR, modsR, statusR) {
    setServer(statusR, server_nameR);
    var version_mods_text = "";
    if (game_versionR) version_mods_text += `(**${gameR}** [${game_versionR}])`
    if (modsR) version_mods_text += `with mod/s ${modsR}`
    var msgEmbed = {
        color: statusR === "online" ? "#0CFA08" : "#FF0101"
        , title: `The ${gameR}-Sever: \`${server_nameR}\` is currently **${statusR.toUpperCase()}!**`
        , description: `It runs on \`${ipR}:${portR}\` ${version_mods_text}.`
    }
    dbClient.query("SELECT guildid, channelid, msgid FROM notifylist WHERE server_name = $1", [server_nameR], function (dbErrorSelect, dbResponseSelect) {
        if (dbErrorSelect) {
            return console.log("ERROR while loading " + server_nameR);
        }
        if (dbResponseSelect.rows.length == 0) {
            return console.log("No channels to notify for: " + server_nameR);
        }

        dbResponseSelect.rows.forEach(async function (r) {
            var msgID = r.msgid;
            var channelID = r.channelid;
            var guildID = r.guildid;
            var guild = client.guilds.cache.get(guildID);
            if (!guild) {
                console.log("NO Guild found for : " + guildID);
                return;
            }
            var channel = guild.channels.cache.get(channelID);
            if (!channel) {
                console.log("NO Channel found for : " + guild.name + " with " + channelID);
                return;
            }
            if (msgID) {
                //console.log(channel.messages.cache);
                var Smsg = await channel.messages.fetch(msgID).catch("Smsg ERROR");;
                if (Smsg) {
                    Smsg.delete().catch("Smsg ERROR 2");
                }
            }
            channel.send({
                embeds: [msgEmbed]
            }).then(mssg => {
                dbClient.query("INSERT INTO notifylist (server_name, guildid ,channelid, msgid) VALUES($1,$2,$3,$4) ON CONFLICT (server_name, guildid) DO UPDATE SET channelid = $3 , msgid = $4", [server_nameR, guildID, channelID, mssg.id], function (dbErrorInsert, dbResponseInsert) {
                    if (dbErrorInsert) {
                        console.log(dbErrorInsert);
                        return;
                    }
                })
            }).catch("Unkown Message");

        })

    })
}
function setServer(status, servername) {
    dbClient.query("UPDATE hosted_servers SET online = $1 WHERE server_name = $2", [status == "online" ? true : false, servername], function (dbErrorUpdate, dbResponseUpdate) {
        if (dbErrorUpdate) {
            res.send("ERROR while updating " + servername)
            return console.log("ERROR while updating " + servername);
        }
    })
}
app.listen(PORT, function () {
    console.log(`Web Server for BÖT on port ${PORT}`);
});
client.login(DC_TOKEN);
/* Testen wenn in RGB
var ping = require('web-pingjs')
setInterval(() => checkServer("squad-server.ddns.net"), 6000)
function checkServer(url) {
    var http = require("http");
    http.get({ host: url }, function (res) {
        if (res.statusCode == 200) console.log("Running")
        else console.log("Down")
    })
}

function checkServer(url) {
    ping(url).then(function (delta) {
        console.log('Ping time was ' + String(delta) + ' ms');
    }).catch(function (err) {
        console.error('Could not ping remote URL', err);
    });
} */