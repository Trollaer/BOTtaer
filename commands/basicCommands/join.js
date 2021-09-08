module.exports = {
    name: 'join'
    , description: "Joins your current voice channels."
    , cType: "Basic"
    , guildOnly: true
    , needsVoiceChannel: true
    , args: false
    , cooldown: 5
    , execute(receivedMessage, arguments) {
        joinfn(receivedMessage, arguments);
    }
}
const helpF = require("../../botJS/lib/helpFunctions")

function joinfn(receivedMessage, args) {
    if (receivedMessage.member.permissions.has("ADMINISTRATOR") || !helpF.checkBusy(receivedMessage.client, receivedMessage.guild.id)) {
        var channelToJoin = receivedMessage.member.voice.channel;
        helpF.joinIn(receivedMessage);
    }
    else {
        receivedMessage.reply("Böt is busy doing something in an other channel.");
    }
    if (receivedMessage.deletable) {
        receivedMessage.delete().catch(console.error);
    }
}