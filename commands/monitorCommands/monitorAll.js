module.exports = {
    name: 'monitorallusers'
    , aliases: ["monitorall"]
    , description: "Monitors all users and how much they have talked. You can start/end the monitoring or get the current status with '$monitorall status'"
    , cType: "Monitoring"
    , usage: "<start/end> or 'status'"
    , args: true
    , cooldown: 10
    , guildOnly: true
    , needsVoiceChannel: true
    , async execute(receivedMessage, arguments) {
        const Discord = require('discord.js');
        /*const {
            commands
        } = receivedMessage.client;
        var theCommandData = commands.get("monitorallusers").data;*/
        //check if there already are people from a guild who get monitored
        /*var monitoredGuild = theCommandData.find(function (dat) {
            return dat.guildID === receivedMessage.guild.id;
        });*/
        var monitoredGuild = receivedMessage.client.guildConfigs.get(receivedMessage.guild.id);
        if (!monitoredGuild) {
            receivedMessage.client.commands.get("setcurrentguilds").execute(receivedMessage, [], dbClient)
            receivedMessage.reply("Please try again your guild wasn't in the list!");
            return;
        }
        if (!monitoredGuild.monitoringAll) {
            receivedMessage.client.guildConfigs.get(receivedMessage.guild.id).monitoringAll = {
                users: new Discord.Collection()
                , currentlyMonitoring: false
                , startTime: Date.now()
            }
        }
        if (arguments[0] === "start") {
            if (monitoredGuild.monitoringAll.currentlyMonitoring) {
                helpF.sendMsgWithDeleteAfter(receivedMessage.channel, "**Alreay monitoring!**", 2000, {
                    embed: true
                    , color: "0x69B4C7"
                    , thumbnail: true
                });
            }
            else {
                monitoredGuild.monitoringAll.startTime = Date.now();
                helpF.sendMsgWithDeleteAfter(receivedMessage.channel, "**Monitoring started!**", 2000, {
                    embed: true
                    , color: "0x69B4C7"
                    , thumbnail: true
                });
                startMonitoring(receivedMessage, monitoredGuild.monitoringAll);
            }
        }
        else if (arguments[0] === "end") {
            endMonitoring(receivedMessage, monitoredGuild.monitoringAll);
        }
        else if (arguments[0] === "status") {
            if (monitoredGuild.monitoringAll.currentlyMonitoring) {
                sendStatus(receivedMessage, monitoredGuild.monitoringAll);
            }
            else {
                helpF.sendMsgWithDeleteAfter(receivedMessage.channel, "**Not monitoring right now!**", 2000, {
                    embed: true
                    , color: "0x69B4C7"
                    , thumbnail: true
                });
            }
        }
        else if (arguments[0] === "reset") {
            reset(receivedMessage, monitoredGuild.monitoringAll);
        }
        if (receivedMessage.deletable) {
            receivedMessage.delete().catch(console.error);
        }
    }
}
const helpF = require("../../botJS/lib/helpFunctions");

function startMonitoring(receivedMessage, monitorData) {
    //console.log(receivedMessage.mentions.users)
    var returnMsg = [];
    if (!receivedMessage.guild.me.voice.channelID || receivedMessage.member.permissions.has("ADMINISTRATOR") || !helpF.checkBusy(receivedMessage.client, receivedMessage.guild.id)) {
        if (helpF.joinIn(receivedMessage)) {
            returnMsg.push("Joined in your channel to monitor.")
        }
        monitorData.currentlyMonitoring = true;
        receivedMessage.member.voice.channel.members.forEach(memb => {
            /*var alreadyMonitored = monitorData.find(function (dat) {
                return dat.userID == memb.user.id;
            });*/
            var alreadyMonitored = monitorData.users.get(memb.user.id);
            //console.log(alreadyMonitored)
            if (!alreadyMonitored && !memb.user.bot) {
                var memberData = {
                        userID: memb.user.id
                        , timeSpoken: 0
                        , lastEventValue: undefined
                    } //TODO:times abhängig von args setzen
                    //console.log(user.id);
                monitorData.users.set(memberData.userID, memberData)
                    //console.log(monitorData)
            }
        })
    }
    else { //&& !(monitoring || playing[done])
        // prüfen ob er was mach sonst trotzdem joinen
        returnMsg.push("Already in a channel and doing somthing else. \nThis channel is **not** getting monitored.")
    }
    const exampleEmbed = {
        color: 0x69B4C7
        , description: returnMsg.join("\n")
        , thumbnail: {
            url: receivedMessage.client.user.avatarURL()
        }
    };
    if (exampleEmbed.description.length >= 2007) {
        exampleEmbed.description = exampleEmbed.description.substr(0, exampleEmbed.description.indexOf("\n", 2000)) + "\n. . .";
    }
    helpF.sendMsgWithDeleteAfter(receivedMessage.channel, "Added monitor", 120000, {
        complete: exampleEmbed
    });
}

function endMonitoring(msg, monitorData) {
    sendStatus(msg, monitorData);
    setTimeout(function () {
        monitorData.users.clear();
        monitorData.currentlyMonitoring = false
    }, 1000);
}

function sendStatus(msg, monitorData) {
    var runningTime = Date.now() - monitorData.startTime;
    var membList = "Every member spoke:\n```diff\n";
    var sortedUsers = monitorData.users.sort(function (a, b) {
            return b.timeSpoken - a.timeSpoken;
        })
        //console.log(sortedUsers)
        /*var membersWithData = msg.guild.members.cache.filter(function (member) {
            return data.find(function (dat) {
                return dat.userID == member.user.id;
            });
        });
        membersWithData =*/
    var spokenTotal = 0;
    //console.log(membersWithData);
    if (sortedUsers.size === 0) {
        membList += "**No members spoke, yet**\n```"
    }
    else {
        sortedUsers.forEach(u => {
            var membr = msg.guild.members.cache.get(u.userID)
            if (membr) {
                spokenTotal += u.timeSpoken;
                membList += "+ " + membr.user.username + ": [" + helpF.msToTime(u.timeSpoken) + "] (" + Math.round(((u.timeSpoken / runningTime) + Number.EPSILON) * 1000) / 10 + "% since the monitoring started)\n";
            }
        })
        membList += "```\nIn total " + Math.round(((spokenTotal / runningTime) + Number.EPSILON) * 1000) / 10 + "% of the time someone spoke."
    }
    //console.log(membList);
    const exampleEmbed = {
        title: "The commands was running for `" + helpF.msToTime(runningTime) + "`"
        , color: 0x69B4C7
        , description: membList
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
        exampleEmbed.description = exampleEmbed.description.substr(0, exampleEmbed.description.indexOf("\n", 500)) + "\n. . .";
    }
    helpF.sendMsgWithDeleteAfter(msg.channel, "Status monitor", 360000, {
        complete: exampleEmbed
    });
}

function reset(msg, monitorData) {
    sendStatus(msg, monitorData);
    var time = Date.now();
    monitorData.startTime = time;
    monitorData.users.forEach(m => {
        m.lastEventValue = time;
        m.timeSpoken = 0;
    })
}