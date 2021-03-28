module.exports = {
    name: 'backup'
    , aliases: ["backupserver"]
    , description: "Creates a backup of the server and sends you the backupID via DM."
    , cType: "Backup"
    , permissions: "ADMINISTRATOR"
    , args: false
    , guildOnly: true
    , cooldown: 10
    , execute(receivedMessage, arguments) {
        receivedMessage.channel.send(':white_check_mark: | Backup create! You receive the backupID via DM.');
        backupfn(receivedMessage, arguments);
    }
}
const fs = require('fs');
const backup = require("../../botJS/backupDC/backupmain.js");

function backupfn(receivedMessage, args) {
    //evtl options
    var dbClient=receivedMessage.client.dbClient;
    backup.create(receivedMessage.guild, receivedMessage.author, dbClient);
}