//*******Message Handling**********
const fs = require('fs');
const Discord = require('discord.js');
var pg = require("pg");
var CON_STRING = process.env.DATABASE_URL;
if (CON_STRING == undefined) {
    console.log("Error: Environment variables");
    process.exit(1);
}
pg.defaults.ssl = true;
var dbClient = new pg.Client({
    connectionString: CON_STRING
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
client.testMode = false;
client.guildConfigs = new Discord.Collection(); //{guildID[key],prefix,DJrole,busy[true,wenn music oder monitoring], monitoringAll { start time, users[],currentlyMonitoring},monitoringUsers}
client.commands = new Discord.Collection();
client.musicQueue = new Discord.Collection(); // {playing,songs,connection,loop,volume}
client.cooldowns = new Discord.Collection();
//const prefix = "$";
const helpFunctions = require("./botJS/lib/helpFunctions.js")
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
                            , prefix: r.prefix
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
        console.log("DEAKTIVATED")
        res.render("soundboard", {
            error: "The soundboard for this guild was DEAKTIVATED."
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
    console.log("TEST LOG");
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
    console.log(folderList);
    res.send(folderList);
});
app.get("/soundboardAPI/requestPlay/:guildID/:folder/:file", function (req, res) {
    var guildID = req.params.guildID;
    var folderName = req.params.folder;
    var fileName = req.params.file;
    var guild = client.guilds.cache.get(guildID)
    var errorMSG = "";
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
});
app.get("/ping", function (req, res) {
    //console.log(clientS);
    res.send("pong");
});
app.listen(PORT, function () {
    console.log(`Soundboard Server for BÖT on port ${PORT}`);
});
client.login(process.env.DC_TOKEN);
///for Web GUI
//*****************************