module.exports = {
    name: "stop"
    , description: "Stops and deletes the current playlist."
    , cType: "Music"
    , args: false
    , cooldown: 5
    , guildOnly: true
    , needsVoiceChannel: true
    , sameChannelLikeBot: true
    , execute(message, arguments) {
        const helpF = require("../../botJS/lib/helpFunctions.js");
        const queue = message.client.musicQueue.get(message.guild.id);
        if (!queue) {
            helpF.sendMsgWithDeleteAfter(queue.textChannel, "Not playing anything at the moment.", 2000, {
                embed: true
                , color: "0xFF0000"
                , thumbnail: "botmusicicon.png"
            });
        }
        else {
            queue.songs = []
            queue.connection.dispatcher.end();
            helpF.sendMsgWithDeleteAfter(queue.textChannel, "Stop", 2000, {
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