module.exports = {
    name: 'loadbackup'
    , aliases: ["loadserverbackup"]
    , description: "Loads the channels/roles of a server-backup based on backupID, that you get when using '$backup'. With 'list' you can see all the backups for this server.\nYou can also reset the server an delete all channels/roles with 'reset'.\nWhen loading a backup you may sometimes see channels but can't join or type in them. Just quit Discord (not just the X). These are visual bugs."
    , cType: "Backup"
    , permissions: "ADMINISTRATOR"
    , args: true
    , guildOnly: true
    , cooldown: 60
    , usage: "<backupID> [roles/noreset]  or  'reset'/'list'"
    , explanation: "Give the single operations some time, when the server is huge the minute from the cooldown for this command might not be enough.\n**__Options:__**\n```ini\n['reset']: Resets the whole server by deleting all channels/roles.\n['list']: Shows you a list of all the backups for this server.\n[<backupID>]: Loads all channels/roles of the server-backup with the backupID. The server gets reseted first.\n[<backupID> roles]: Gives every user back the roles he previously had.\n [<backupID> noreset] Loads the server-backup without reseting first. Which means every role/channel gets added additionaly to the existing ones.```"
    , execute(receivedMessage, arguments) {
        //receivedMessage.channel.send('test');
        loadFn(receivedMessage, arguments);
    }
}
const fs = require('fs');
const backup = require("../../botJS/backupDC/backupmain.js");
async function loadFn(receivedMessage, args) { //
    var dbClient = receivedMessage.client.dbClient;
    if (args[0] === 'reset') {
        receivedMessage.channel.send(":exclamation: Make sure that BOTtaer is the role at the top of the list. Otherwise it may not delete all roles.\n:warning: | The server will be reseted.\n All channels, roles etc. will be deleted. You can save a backup with '$backup'.\n Type `-confirm` to confirm!");
        await receivedMessage.channel.awaitMessages(m => (m.author.id === receivedMessage.author.id) && (m.content === "-confirm"), {
            max: 1
            , time: 20000
            , errors: ["time"]
        }).catch((err) => {
            // if the author of the commands does not confirm the backup loading
            return receivedMessage.channel.send(":x: | Time's up! Cancelled reset!");
        });
        backup.reset(receivedMessage.guild, receivedMessage.author, false);
    }
    else
    if (args[0] === "list") {
        backup.list(receivedMessage.guild, receivedMessage.author, dbClient);
        if (receivedMessage.deletable) {
            receivedMessage.delete().catch(console.error);
        }
    } // => query such nach guild.id => print (for this guild: TIMESTAMP  ;  ID) oder für this guild no backups
    else
    if (args[1] === 'roles') {
        receivedMessage.channel.send(":warning: | Gives every user back his roles, that he had when the backup was created.\nLoad the backup with the same ID first.\n Type `-confirm` to confirm!");
        await receivedMessage.channel.awaitMessages(m => (m.author.id === receivedMessage.author.id) && (m.content === "-confirm"), {
            max: 1
            , time: 20000
            , errors: ["time"]
        }).catch((err) => {
            // if the author of the commands does not confirm the backup loading
            return receivedMessage.channel.send(":x: | Time's up! Cancelled backup loading!");
        });
        backup.loadRoles(receivedMessage.guild, receivedMessage.author, args[0], dbClient);
    }
    else if (args[1] === "noreset") {
        receivedMessage.channel.send(":warning: | The server will not be reseted first. All channels/roles etc. get added and the others are keeped!\n Type `-confirm` to confirm!");
        await receivedMessage.channel.awaitMessages(m => (m.author.id === receivedMessage.author.id) && (m.content === "-confirm"), {
            max: 1
            , time: 20000
            , errors: ["time"]
        }).catch((err) => {
            // if the author of the commands does not confirm the backup loading
            return receivedMessage.channel.send(":x: | Time's up! Cancelled backup loading!");
        });
        backup.loadServer(receivedMessage.guild, receivedMessage.author, args[0], dbClient, false);
    }
    else if (!args[1]) {
        receivedMessage.channel.send(":exclamation: Make sure that BOTtaer is the role at the top of the list. Otherwise it may not delete all roles.\n:warning: | The server will be reseted first. All channels/roles etc. get deleted and then recreated form the backup!\n Type `-confirm` to confirm!");
        await receivedMessage.channel.awaitMessages(m => (m.author.id === receivedMessage.author.id) && (m.content === "-confirm"), {
            max: 1
            , time: 20000
            , errors: ["time"]
        }).catch((err) => {
            // if the author of the commands does not confirm the backup loading
            return receivedMessage.channel.send(":x: | Time's up! Cancelled backup loading!");
        });
        backup.loadServer(receivedMessage.guild, receivedMessage.author, args[0], dbClient, true);
    }
    else {
        receivedMessage.channel.send("Classic misstake you maybe copied the *space* when copying the backupID.\nOr type '$help loadbackup' for more infomation.")
    }
}