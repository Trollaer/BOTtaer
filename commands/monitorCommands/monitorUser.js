module.exports = {
    name: 'monitoruser'
    , aliases: ["monitor"]
    , description: "Monitors a user and when the user talks too much, mutes him.\nTime_Allowed_To_Speak in seconds.\nAll users, that should be monitored must be listed with @username.\nWith 'list' lists all members currently monitored."
    , cType: "Monitoring"
    , usage: "[time_Allowed_To_Speak] {<@username>}  or  'list'"
    , args: true
    , guildOnly: true
    , permissions: "MUTE_MEMBERS"
    , execute(receivedMessage, arguments) {
        var monitoredGuild = receivedMessage.client.guildConfigs.get(receivedMessage.guild.id);
        if (!monitoredGuild) {
            receivedMessage.client.commands.get("setcurrentguilds").execute(receivedMessage, [], dbClient)
            receivedMessage.reply("Please try again your guild wasn't in the list!");
            return;
        }
        if (!monitoredGuild.monitoringUsers) {
            monitoredGuild.monitoringUsers = new Discord.Collection();
        }
        if (arguments[0] === "list") {
            listAllMonitoredMembers(receivedMessage, monitoredGuild);
        }
        else
        if (receivedMessage.mentions.users.size === 0) {
            return helpFkts.sendMsgWithDeleteAfter(receivedMessage.channel, "You need to specify users with @username.", 20000);
        }
        else {
            addToMonitorList(receivedMessage, arguments, monitoredGuild);
        }
        if (receivedMessage.deletable) {
            receivedMessage.delete().catch(console.error);
        }
    }
}
const helpFkts = require("../../botJS/lib/helpFunctions");

function addToMonitorList(receivedMessage, args, monitoredGuild) {
    var allowedTalkingTime = 10000;
    var returnMsg = [];
    if (!args[0].includes("<@!") && parseInt(args[0])) {
        allowedTalkingTime = parseInt(args[0]) * 1000;
    }
    else {
        returnMsg.push("You didn't specify an allowed-speaking-time. It was set to 10 seconds by default.\n");
    }
    var alreadyMonitored;
    receivedMessage.mentions.users.forEach(user => {
        alreadyMonitored = monitoredGuild.monitoringUsers.get(user.id);
        if (alreadyMonitored) {
            alreadyMonitored.timeoutAfter = allowedTalkingTime;
        }
        else if (!user.bot) {
            var memberData = {
                    userID: user.id
                    , userName: user.username
                    , timeoutAfter: allowedTalkingTime
                    , timeSpoken: 0
                    , lastEventValue: undefined
                } //TODO:times abhängig von args setzen
                //console.log(user.id);
            monitoredGuild.monitoringUsers.set(user.id, memberData);
        }
    })
    if (!receivedMessage.guild.me.voice.channelID || receivedMessage.member.hasPermission("ADMINISTRATOR") || !helpFkts.checkBusy(receivedMessage.client, receivedMessage.guild.id)) {
        //oder nicht beschäftigt;
        if (helpFkts.joinIn(receivedMessage.member.voice.channel)) {
            returnMsg.push("Joined your channel to monitor the user[s].\n")
        }
    }
    else {
        returnMsg.push("Users will be monitored, when böt is in their channels. Currently böt is doing something else. (music or monitoring)\n");
    }
    const exampleEmbed = {
        color: 0x69B4C7
        , description: returnMsg.join("\n")
        , thumbnail: {
            url: "attachment://botbasicicon.png"
        }
    };
    const Discord = require('discord.js');
    const attachment = new Discord.MessageAttachment('./resources/icons/botbasicicon.png', 'botbasicicon.png');
    exampleEmbed.files = [
                                    attachment
                                        ];
    if (exampleEmbed.description.length >= 2007) {
        exampleEmbed.description = exampleEmbed.description.substr(0, exampleEmbed.description.indexOf("\n", 2000)) + "\n. . .";
    }
    //data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);
    helpFkts.sendMsgWithDeleteAfter(receivedMessage.channel, "Added monitor", 120000, {
        complete: exampleEmbed
    });
    if (receivedMessage.deletable) {
        receivedMessage.delete().catch(console.error);
    }
}

function listAllMonitoredMembers(msg, guildM) {
    var membList = "";
    if (guildM.monitoringUsers.size === 0) {
        membList += "\*\*No members\*\*\n"
    }
    else {
        guildM.monitoringUsers.forEach(m => {
            membList += "+ <@" + m.userID + "> ( " + (m.timeoutAfter / 1000) + " s )\n"
        })
    }
    //console.log(membList);
    const exampleEmbed = {
        title: "All members currently monitored on this server:"
        , color: 0x69B4C7
        , description: membList
        , thumbnail: {
            url: msg.client.user.avatarURL()
        }
    };
    if (exampleEmbed.description.length >= 2007) {
        exampleEmbed.description = exampleEmbed.description.substr(0, exampleEmbed.description.indexOf("\n", 500)) + "\n. . .";
    }
    //data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);
    helpFkts.sendMsgWithDeleteAfter(msg.channel, "List Monitor", 120000, {
        complete: exampleEmbed
    });
}