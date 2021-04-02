module.exports = (client, oldState, newState) => {
    const {
        TEST_SERVER
    } = require("../util/BOTtaerUtil.js");
    if (TEST_SERVER) return;
    checkAlone(client, newState);
    if (oldState.channelID === null || typeof oldState.channelID == 'undefined') return;
    if (newState.id !== client.user.id) return;
    var voiceState = newState.guild.me.voice;
    var guildID = newState.guild.id;
    setTimeout(function () {
        //console.log(client.guilds.cache.get(newState.guild.id).me.voice.channelID)
        if (client.guilds.cache.get(newState.guild.id).me.voice.channelID) return
        client.musicQueue.delete(guildID);
        var conf = client.guildConfigs.get(guildID);
        if (conf) {
            conf.monitoringUsers.clear();
            conf.monitoringAll = null;
            conf.busy = false;
        }
    }, 180000)
}

function checkAlone(client, newMember) {
    var voiceState = newMember.guild.me.voice;
    var guildID = newMember.guild.id;
    if (!voiceState.channelID) {
        //console.log("Not in Voice");
        return;
    }
    var chan = voiceState.channel;
    if (chan) {
        if (chan.members.size === 1) {
            console.log("Disconnect nach 3 mins") //lösche monitoringUsers , music queue / monitorAll
            setTimeout(function () {
                if (chan.members.size === 1) {
                    voiceState.setChannel(null);
                    client.musicQueue.delete(guildID);
                    var conf = client.guildConfigs.get(guildID);
                    if (conf) {
                        conf.monitoringUsers.clear();
                        conf.monitoringAll = null;
                        conf.busy = false;
                    }
                }
            }, 180000)
        }
    }
}