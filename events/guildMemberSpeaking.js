module.exports = (client, member, speaking) => {
    //console.log(member.user.username.toString() + "  eventtriggered " + speaking);
    const {
        TEST_SERVER
    } = require("../util/BOTtaerUtil.js");
    if (TEST_SERVER) return;
    const helpF = require("../botJS/lib/helpFunctions");
    var monitoredGuild = client.guildConfigs.get(member.guild.id);
    if (!monitoredGuild) {
        return;
    }
    //console.log(receivedMessage.mentions.users)
    var getsMonitored = monitoredGuild.monitoringUsers.get(member.user.id); //data about the one who gets monitored.
    if (getsMonitored) {
        //console.log("MONITORed " + speaking)
        helpF.checkMonitoredMember(getsMonitored, member, speaking);
    }
    var monitorDataAll = monitoredGuild.monitoringAll;
    if (monitorDataAll) {
        if (monitorDataAll.currentlyMonitoring) {
            helpF.updateTimeSpoken(monitorDataAll.users, member, speaking);
        }
    }
}