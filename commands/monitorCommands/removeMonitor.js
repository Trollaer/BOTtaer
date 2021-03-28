module.exports = {
    name: 'removemonitor'
    , aliases: ["remove"]
    , description: "Removes the monitors from a user.\nAll users, that you want to remove the monitor from must be listed with @username."
    , cType: "Monitoring"
    , usage: "{<@username>}"
    , args: true
    , guildOnly: true
    , permissions: "MUTE_MEMBERS"
    , execute(receivedMessage, arguments) {
        removeMonitorFromList(receivedMessage, arguments)
    }
}
const helpFkts = require("../../botJS/lib/helpFunctions");

function removeMonitorFromList(receivedMessage, args) {
    var returnMsg = "";
    var monitoredGuild = receivedMessage.client.guildConfigs.get(receivedMessage.guild.id);
    if (!monitoredGuild) {
        receivedMessage.client.commands.get("setcurrentguilds").execute(receivedMessage, [], dbClient)
        receivedMessage.reply("Please try again your guild wasn't in the list!");
        return;
    }
    if (!monitoredGuild.monitoringUsers) {
        monitoredGuild.monitoringUsers = new Discord.Collection();
    }
    if (!monitoredGuild.monitoringUsers.size === 0) {
        return;
    }
    if (args[0] === "all") {
        monitoredGuild.monitoringUsers.clear();
        returnMsg += "All users were removed."
    }
    else {
        receivedMessage.mentions.users.forEach(user => {
            monitoredGuild.monitoringUsers.delete(user.id);
            //console.log(isGettingMonitored)
            console.log(user.id)
        })
        returnMsg += "All mentioned members were removed."
    }
    //console.log(monitorData);
    const exampleEmbed = {
        title: "Removed monitors:"
        , color: 0x69B4C7
        , description: returnMsg
        , thumbnail: {
            url: receivedMessage.client.user.avatarURL()
        }
    };
    helpFkts.sendMsgWithDeleteAfter(receivedMessage.channel, "Remove", 120000, {
        complete: exampleEmbed
    });
    if (receivedMessage.deletable) {
        receivedMessage.delete().catch(console.error);
    }
}