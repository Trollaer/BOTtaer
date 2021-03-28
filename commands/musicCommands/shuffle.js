module.exports = {
    name: "shuffel"
    , description: "Shuffels the current playlist."
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
        var djRole;
        if (!conf) {
            console.log("Error no conf for guild");
        }
        else {
            djRole = conf.DJrole;
        }
        if (!queue) {
            helpF.sendMsgWithDeleteAfter(message.channel, "Not playing anything at the moment.", 2000, {
                embed: true
                , color: "0xFF0000"
                , thumbnail: "botmusicicon.png"
            });
        }
        else {
            var rMsg = "Skip";
            var perm = helpF.checkDJrole(message.member,message.guild.id);
            if (perm) {
                let songs = queue.songs;
                for (let i = songs.length - 1; i > 1; i--) {
                    let j = 1 + Math.floor(Math.random() * i);
                [songs[i], songs[j]] = [songs[j], songs[i]];
                }
            }else{
                rMsg="You need the DJ-role to shuffel."
            }
            helpF.sendMsgWithDeleteAfter(queue.textChannel, "Shuffel", 2000, {
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