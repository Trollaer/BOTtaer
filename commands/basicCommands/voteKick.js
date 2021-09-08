module.exports = {
    name: 'votekick'
    , aliases: ["vk", "kickuser"]
    , description: "Starts a vote to temporarily kick a user from your current channel. For a specified time he can not see/join the channel (default 5 mins).\nOnly people in the channel can vote!"
    , cType: "Basic"
    , args: true
    , usage: "[time_in_minutes] <@username>"
    , guildOnly: true
    , needsVoiceChannel: true
    , cooldown: 20
    , execute(receivedMessage, arguments) {
        var kickFromChannel = receivedMessage.member.voice.channel;
        if (receivedMessage.mentions.members.size > 1) {
            receivedMessage.reply("You can only vote for one at the time.");
            return;
        }
        var memberToKick = receivedMessage.mentions.members.first();
        //console.log(kickFromChannel.name + "***********")
        if (receivedMessage.mentions.users.size === 0) {
            return helpF.sendMsgWithDeleteAfter(receivedMessage.channel, "You need to specify users with @username.", 20000);
        }
        if (!memberToKick) {
            receivedMessage.reply("No user was mentioned.");
            return;
        }
        if (memberToKick.voice.channelID !== kickFromChannel.id) {
            receivedMessage.reply("You need to be in the same channel as the user you want to kick.");
            return;
        }
        var kickTime = 300000;
        if (!arguments[0].includes("<@!") && parseInt(arguments[0])) {
            kickTime = parseInt(arguments[0]) * 60000;
        }
        var usersInChannelNoCams = {
            basic: []
            , admins: []
            , names: []
        };
        //console.log(kickFromChannel.members)
        kickFromChannel.members.forEach(function (member) {
            if ((member.roles.cache.some(role => role.name === 'Cam')) || (member.user.bot) || member.user.id === memberToKick.user.id) {
                return;
            }
            else {
                usersInChannelNoCams.basic.push(member.user.id);
                usersInChannelNoCams.names.push(member.toString());
                if (member.permissions.has("ADMINISTRATOR")) {
                    usersInChannelNoCams.admins.push(member.user.id);
                }
            }
        })
        if (!usersInChannelNoCams) {
            receivedMessage.reply("Channel is empty. Only Cam accounts.");
            return;
        }
        startvote(receivedMessage, usersInChannelNoCams, kickFromChannel, memberToKick, kickTime);
        if (receivedMessage.deletable) {
            receivedMessage.delete().catch(console.error);
        }
    }
}
const helpF = require("../../botJS/lib/helpFunctions");
async function startvote(msg, userInC, kickFrom, kickThis, kickTime) {
    var voteMsg;
    var userNames = "";
    userInC.names.forEach(n => {
        userNames += n + " ";
    });
    await msg.channel.send(userNames + "\n" + msg.member.toString() + " wants to kick " + kickThis.toString() + " from '" + kickFrom.name + "'. Do you want to kick the user?\n:white_check_mark: | Yes __ :no_entry: | No").then(message => {
        voteMsg = message;
        voteMsg.react("✅")
        voteMsg.react("⛔");
        //voteMsg.react("💀");
        //voteMsg.react("❤");
    });
    //console.log(userInC)
    const filter = (reaction, user) => {
        return (((["✅", "⛔"].includes(reaction.emoji.name) && userInC.basic.includes(user.id)) || (["👌", "🖕"].includes(reaction.emoji.name) && userInC.admins.includes(user.id))) && !user.bot);
    }
    var count = 0;
    const collector = voteMsg.createReactionCollector(filter, {
        max: userInC.basic.length * 2
        , time: 20000
    });
    collector.on("collect", (r, user) => {
        //console.log(user.username)
        if (r.emoji.name === "🖕" && userInC.admins.includes(user.id)) {
            count += 500000;
            //console.log(count);
        }
        else if (r.emoji.name === "👌" && userInC.admins.includes(user.id)) {
            count -= 500000;
            //console.log(count);
        }
        else if (r.emoji.name === '✅' && userInC.basic.includes(user.id)) {
            count++;
            //console.log(count);
        }
        else if (r.emoji.name === '⛔' && userInC.basic.includes(user.id)) {
            count--;
            //console.log(count);
        }
    })
    collector.on("end", (collected, reason) => {
        //console.log("END  " + reason);
        var ergText = "";
        var kick = false;
        if (count < 0) {
            ergText += "The vote decided:\n:no_entry: you won't get kicked.";
        }
        else if (count > 0) {
            ergText += "The vote decided:\n:white_check_mark: you got kicked.";
            kick = true;
        }
        else if (count == 0 && collected.size > 0) {
            if (Math.floor(Math.random() * 3) == 1) {
                ergText += "Lucky, the vote was even, but RNG said :no_entry:";
            }
            else {
                ergText += "Meh, unlucky you. The vote was even, but RNG said 🖕";
                kick = true;
            }
        }
        else if (count == 0 && collected.size == 0) {
            ergText += "Nobody voted.";
        }
        helpF.sendMsg(voteMsg.channel, ergText, {
            ats: kickThis.toString()
            , deleteAfter: 20000
        });
        voteMsg.delete();
        if (kick) {
            revokeViewRightsFor(kickThis, kickFrom, kickTime)
            kickThis.voice.setChannel(null);
        }
    })
}

function revokeViewRightsFor(memberOruser, channel, time) {
    channel.permissionOverwrites.edit(memberOruser, {
        VIEW_CHANNEL: false
    });
    setTimeout(function () {
        channel.permissionOverwrites.get(memberOruser.id).delete().catch(console.error);
    }, time)
}