module.exports = {
    name: "loop"
    , description: "Pauses the currently playing song."
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
            helpF.sendMsgWithDeleteAfter(queue.textChannel, "Not playing anything at the moment.", 2000);
        }
        else {
            queue.loop = !queue.loop;
            helpF.sendMsgWithDeleteAfter(queue.textChannel, "Loop " + (queue.loop ? "on" : "off"), 2000, {
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