//*******Message Handling**********
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
    ws: {
        intents: new Discord.Intents(Discord.Intents.ALL)
    }
});
client.dbClient = dbClient;
client.guildConfigs = new Discord.Collection(); //{guildID[key],prefix,DJrole,busy[true,wenn music oder monitoring], monitoringAll { start time, users[],currentlyMonitoring},monitoringUsers}
client.commands = new Discord.Collection();
client.musicQueue = new Discord.Collection(); // {playing,songs,connection,loop,volume}
client.cooldowns = new Discord.Collection();
client.MCstatus = new Map();
client.MCserverstatus = [];
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
//soundboar server
var express = require("express");
var bodyParser = require("body-parser");
var session = require("express-session");
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
    res.send(client);
});
app.get("/soundboard/:guildID", function (req, res) { // error Msg und nur einmal render
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
                if (!guild.me.voice.channelID) {
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
//****************************
//this paths are for my Minecraft server only (maybe i will expend it but for now it will send a MSG into a specific channel from my friends server)
app.get("/minecraftServerStatusUpdate/:servername/:status", function (req, res) {
    var servername = req.params.servername;
    var status = req.params.status;
    notifyMCserverStatusOneServer(servername, status);
    res.send(servername + " is now " + status)
});
async function notifyMCserverStatusOneServer(servername, status) {
    var msgEmbed = {
        color: status === "online" ? "#0CFA08" : "#FF0101"
        , title: "The Minecraft-Sever: `" + servername + "` is currently **" + status.toUpperCase() + "!**"
    }
    dbClient.query("SELECT * FROM mcservernotifylist WHERE mcservername = $1", [servername], function (dbErrorSelect, dbResponseSelect) {
        if (dbErrorSelect) {
            return console.log("ERROR while loading " + servername);
        }
        if (dbResponseSelect.rows.length == 0) {
            return console.log("No server to notify for " + servername);
        }
        dbResponseSelect.rows.forEach(r => {
            var msgID = r.msgid;
            var channelID = r.channelid;
            var guildID = r.guildid;
            var guild = client.guilds.cache.get(guildID);
            if (!guild) {
                //res.send("*****NO GUILD***** " + status);
                return;
            }
            var channel = guild.channels.cache.get(channelID);
            if (!channel) {
                //res.send("*****NO CHANNEL***** " + status);
                return;
            }
            //console.log(client.MCstatus)
            if (msgID) {
                //console.log("DELETE")
                var MCmsg = channel.messages.cache.get(msgID);
                //console.log(MCmsg);
                if (MCmsg) MCmsg.delete().catch(console.error);
            }
            channel.send({
                embed: msgEmbed
            }).then(mssg => {
                dbClient.query("INSERT INTO mcservernotifylist (mcservername, guildid ,channelid, msgid) VALUES($1,$2,$3,$4) ON CONFLICT (mcservername, guildid) DO UPDATE SET channelid = $3 , msgid = $4", [servername, guildID, channelID, mssg.id], function (dbErrorInsert, dbResponseInsert) {
                    if (dbErrorInsert) {
                        console.log(dbErrorInsert);
                        return;
                    }
                })
            }).catch(console.err);
        })
    })
}
app.get("/minecraftServerStatusUpdate/all/:status", async function (req, res) {
    var status = req.params.status;
    dbClient.query("SELECT DISTINCT mcservername FROM mcservernotifylist", function (dbErrorSelect, dbResponseSelect) {
        if (dbErrorSelect) {
            return console.log("ERROR select all servers")
        }
        dbResponseSelect.rows.forEach(r => {
            
            notifyMCserverStatusOneServer(r.mcservername, status)
        });
    })
    res.send("All servers " + status)
});
//**********************test server "824006072314495016") //  test : channel "831162371753902151") //
app.listen(PORT, function () {
    console.log(`Soundboard Server for BÖT on port ${PORT}`);
});
client.login(DC_TOKEN);
///for Web GUI
//*****************************