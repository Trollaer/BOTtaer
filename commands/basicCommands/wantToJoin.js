module.exports = {
    name: 'wanttojoin'
    , aliases: ["wtj", "wanttojoinchannel"]
    , description: "If you can see but can not join a channel, why not just ask."
    , cType: "Basic"
    , args: true
    , usage: "<name of voice channel> _capitalization is not relevant_ "
    , guildOnly: true
    , needsVoiceChannel: true
    , cooldown: 25
    , execute(receivedMessage, arguments) {
        var wantToJoinChannel;
        var chanName;
        if (arguments.length > 1) {
            chanName = arguments.join(" ");
        }
        else {
            chanName = arguments[0];
        }
        //console.log(chanName);
        receivedMessage.guild.channels.cache.forEach(c => {
                if (c.name.toLowerCase() === chanName && c.type === "GUILD_VOICE") {
                    wantToJoinChannel = c;
                }
            })
            //console.log(wantToJoinChannel.name + "***********")
        if (!wantToJoinChannel) {
            receivedMessage.reply("Make sure you spelled the channel name right.");
            return;
        }
        if (!wantToJoinChannel.type === "GUILD_VOICE") {
            receivedMessage.reply("Only works for voice channels.");
            return;
        }
        if (!wantToJoinChannel.permissionsFor(receivedMessage.member).any("VIEW_CHANNEL")) {
            receivedMessage.reply("You can only request a join for channels you can see.");
            return;
        }
        if (wantToJoinChannel.members.size === 0) { /////// hier fkt was nicht
            receivedMessage.reply("Channel is empty.");
            return;
        }
        var usersInChannelNoCams = {
            basic: []
            , withPerms: []
            , names: []
        };
        //console.log(wantToJoinChannel.members)
        wantToJoinChannel.members.forEach(function (member) {
            if ((member.roles.cache.some(role => role.name === 'Cam')) || (member.user.bot)) {
                return;
            }
            else {
                usersInChannelNoCams.basic.push(member.user.id);
                usersInChannelNoCams.names.push(member.toString());
                if (member.permissions.has("MOVE_MEMBERS")) {
                    usersInChannelNoCams.withPerms.push(member.user.id);
                }
            }
        })
        if (!usersInChannelNoCams) {
            receivedMessage.reply("Channel is empty. Just a cam or bot.");
            return;
        }
        startvote(receivedMessage, usersInChannelNoCams, wantToJoinChannel);
        if (receivedMessage.deletable) {
            receivedMessage.delete().catch(console.error);
        }
    }
}
const helpFkts = require("../../botJS/lib/helpFunctions");
async function startvote(msg, userInC, joinThis) {
    var voteMsg;
    var userNames = "";
    userInC.names.forEach(n => {
        userNames += n + " ";
    });
    await msg.channel.send(userNames + "\n" + msg.author.username + " wants to join '" + joinThis.name + "'. Everyone in the channel is allowed to vote.\n:white_check_mark: | Yes\n:no_entry: | No\n:arrow_forward: | Force join\n:raised_hand: | Force no join").then(message => {
        voteMsg = message;
        voteMsg.react("✅")
        voteMsg.react("⛔");
        voteMsg.react("▶");
        voteMsg.react("✋");
    });
    const filter = (reaction, user) => {
        return (
            ((["✅", "⛔"].includes(reaction.emoji.name) && userInC.basic.includes(user.id)) || (["✋", "▶"].includes(reaction.emoji.name) && userInC.withPerms.includes(user.id))) && !user.bot);
    }
    var count = 0;
    const collector = voteMsg.createReactionCollector(filter, {
        max: userInC.basic.length
        , time: 20000
    });
    collector.on("collect", (r, user) => {
        if (r.emoji.name === "▶" && userInC.withPerms.includes(user.id)) {
            count += 500000;
            //console.log(count);
        }
        else if (r.emoji.name === "✋" && userInC.withPerms.includes(user.id)) {
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
        var ergMsg;
        if (reason === "time") {
            console.log("times up")
        }
        var join = false;
        if (count < 0) {
            ergText += "\nThe vote decided:\n:no_entry: you are not allowed to join.";
        }
        else if (count > 0) {
            ergText += "\nThe vote decided:\n:white_check_mark: you are allowed to join.";
            join = true;
        }
        else if (count == 0 && collected.size > 0) {
            if (Math.floor(Math.random() * 3) == 1) {
                ergText += "\nUnlucky, the vote was even, but RNG said :no_entry:";
            }
            else {
                ergText += "\nMeh, lucky you. The vote was even, but RNG said :white_check_mark:";
                join = true;
            }
        }
        else if (count == 0 && collected.size == 0) {
            ergText += "\nNobody voted.";
        }
        voteMsg.channel.send(msg.author.toString() + ergText).then(message => {
            ergMsg = message;
        });
        voteMsg.delete();
        if (join) {
            helpFkts.moveUserToChannel(msg.member, joinThis, msg);
        }
        setTimeout(function () {
            ergMsg.delete();
        }, 5000);
    })
}