module.exports = {
    name: 'moveeveryone'
    , aliases: ["moveall"]
    , description: "Moves everyone from your channel in the other channel."
    , cType: "Basic"
    , args: true
    , usage: "<name of voice channel> _capitalization is not relevant_ "
    , guildOnly: true
    , permissions: "MOVE_MEMBERS"
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
                if (c.name.toLowerCase() === chanName && c.type === "voice") {
                    wantToJoinChannel = c;
                }
            })
            //console.log(wantToJoinChannel.name + "***********")
        if (!wantToJoinChannel) {
            receivedMessage.channel.send("Make sure you spelled the channel name right.");
            return;
        }
        if (!wantToJoinChannel.type === "voice") {
            receivedMessage.channel.send("Only works for voice channels.");
            return;
        }
        if (!wantToJoinChannel.permissionsFor(receivedMessage.member).any("VIEW_CHANNEL") && !wantToJoinChannel.permissionsFor(receivedMessage.member).any("MOVE_MEMBERS")) {
            receivedMessage.channel.send("You can only move all to a channel you can see and move members.");
            return;
        }
        var usersInChannel = {
            basic: []
            , withPerms: []
            , names: []
        };
        //console.log(wantToJoinChannel.members)
        receivedMessage.member.voice.channel.members.forEach(function (member) {
            usersInChannel.basic.push(member.user.id);
            usersInChannel.names.push(member.toString());
        })
        if (!usersInChannel) {
            receivedMessage.channel.send("Channel is empty.");
            return;
        }
        moveAll(receivedMessage, usersInChannel, wantToJoinChannel);
    }
}
const helpFkts = require("../../botJS/lib/helpFunctions");
function moveAll(msg,userInC,joinThis){
    var memb;
    userInC.basic.forEach(uID => {
        memb=msg.guild.members.cache.get(uID);
        helpFkts.moveUserToChannel(memb, joinThis, msg);
    });
}