module.exports = {
    name: "playlist"
    , aliases: ["pl"]
    , description: "Shows you the next songs in the playlist."
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
        var songsText = "";
        queue.songs.slice(10, queue.songs.length).forEach((song, index) => {
            songsText += `${index + 1}. ${song.title}\n`
        })
        const playlistEmbed = {
            color: 0xFF0000
            , title: "Upcoming songs:"
            , description: songsText
            , thumbnail: {
                url: "attachment://botmusicicon.png"
            }
            , timestamp: new Date()
        };
        const Discord = require('discord.js');
        const attachment = new Discord.MessageAttachment('./resources/icons/botmusicicon.png', 'botmusicicon.png');
        var exampleEmbed;
        exampleEmbed.files = [
                                    attachment
                                        ]
        if (playlistEmbed.description.length >= 500) {
            playlistEmbed.description = playlistEmbed.description.substr(0, playlistEmbed.description.indexOf("\n", 500)) + "\n. . .";
        }
        if (playlistEmbed.title.length >= 256) {
            playlistEmbed.title = playlistEmbed.title.substr(0, 240) + " . . .";
        }
        message.channel.send({
            embed: playlistEmbed
        }).catch(console.error);
        if (message.deletable) {
            message.delete().catch(console.error);
        }
    }
}