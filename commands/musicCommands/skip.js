module.exports = {
    name: "skip"
    , description: "Skips the currently playing song."
    , cType: "Music"
    , args: false
    , cooldown: 5
    , guildOnly: true
    , needsVoiceChannel: true
    , sameChannelLikeBot: true
    , execute(message, arguments) {
        const helpF = require("../../botJS/lib/helpFunctions.js");
        const queue = message.client.musicQueue.get(message.guild.id);
        const conf = message.client.guildConfigs.get(message.guild);
        if (!queue) {
            helpF.sendMsgWithDeleteAfter(queue.textChannel, "Not playing anything at the moment.", 2000, {
                embed: true
                , color: "0xFF0000"
                , thumbnail: "botmusicicon.png"
            });
        }
        else {
            var rMsg = "Skip";
            var perm = helpF.checkDJrole(message.member,message.guild.id)
            if (perm) {
                queue.playing = true;
                queue.connection.dispatcher.end();
            }else{
                rMsg="You need the DJ-role to skip."
            }
            helpF.sendMsgWithDeleteAfter(queue.textChannel, rMsg, 2000, {
                embed: true
                , color: "0xFF0000"
                , thumbnail: "botmusicicon.png"
            });
        }
        if (message.deletable) {
            message.delete().catch(console.error);
        }
    }
}