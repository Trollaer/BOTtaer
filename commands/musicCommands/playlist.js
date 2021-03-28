const Discord = require("discord.js");
const music = require("../../botJS/lib/music.js");
const YouTubeAPI = require("simple-youtube-api");
const youtube = new YouTubeAPI(process.env.YT_API_KEY);
module.exports = {
    name: "playlist"
    , aliases: ["pl"]
    , description: "Play a YouTube-playlist."
    , cooldown: 5
    , args: true
    , guildOnly: true
    , needsVoiceChannel: true
    , async execute(message, args, fromPlay) {
        playlistF(message, args, fromPlay)
    }
}
async function playlistF(message, args, fromPlay) {
    const channel = message.member.voice;
    const client = message.client;
    const serverQueue = client.musicQueue.get(message.guild.id);
    var channelToJoin = message.member.voice.channel;
    if (channelToJoin.id !== guild.me.voice.channelID && helpF.checkBusy(receivedMessage.client, receivedMessage.guild.id)) { //&& !(monitoring || playing[done])
        helpF.sendMsgWithDeleteAfter(receivedMessage.channel, ("Not in the same channel as böt, who is doing something else. (already playing music or monitoring)"), 20000, {
            embed: true
            , color: "0xFF0000"
            , thumbnail: "botmusicicon.png"
        });
        return;
    }
    const permissions = channelToJoin.permissionsFor(client.user);
    if (!permissions.has("CONNECT")) return message.reply("No connection permission");
    if (!permissions.has("SPEAK")) return message.reply("No speaking permission");
    const search = args.join(" ");
    const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/gi;
    let fullC = message.content.substr(1); // Remove the leading exclamation mark
    let splitC = fullC.split(" ") // Split the message up in to pieces for each space
    const url = fromPlay ? args[0] : splitC[1];
    const urlValid = pattern.test(url);
    const queueConstruct = {
        textChannel: message.channel
        , connection: null
        , songs: []
        , loop: false
        , volume: 100
        , playing: true
    }
    let playlist = null;
    let videos = [];
    if (urlValid) {
        try {
            playlist = await youtube.getPlaylist(url, {
                part: "snippet"
            });
            videos = await playlist.getVideos(100, {
                part: "snippet"
            });
        }
        catch (error) {
            console.error(error);
            return message.reply("Playlist error.").catch(console.error);
        }
    }
    else {
        try {
            const results = await youtube.searchPlaylists(search, 1, {
                part: "snippet"
            });
            playlist = results[0];
            videos = await playlist.getVideos(100, {
                part: "snippet"
            });
        }
        catch (error) {
            console.error(error);
            return message.reply(error.message).catch(console.error);
        }
    }
    const newSongs = videos.filter((video) => video.title != "Private video" && video.title != "Deleted video").map((video) => {
        return (song = {
            title: video.title
            , url: video.url
            , duration: video.durationSeconds
            , addedBy: message.author.username
        });
    });
    serverQueue ? serverQueue.songs.push(...newSongs) : queueConstruct.songs.push(...newSongs);
    var songsText = "";
    newSongs.map((song, index) => {
        songsText += `${index + 1}. ${song.title}\n`
    });
    const playlistEmbed = {
        color: 0xFF0000
        , title: playlist.title
        , url: playlist.url
        , author: {
            name: 'Added playlist:'
        }
        , description: songsText
        , thumbnail: {
            url: "attachment://botmusicicon.png"
        }
        , timestamp: new Date()
        , footer: {
            text: "Added by " + message.author.username
            , icon_url: message.author.avatarURL()
        }
    }
    const Discord = require('discord.js');
    const attachment = new Discord.MessageAttachment('./resources/icons/botmusicicon.png', 'botmusicicon.png');
    exampleEmbed.files = [
                                    attachment
                                        ]
    if (playlistEmbed.description.length >= 500) {
        playlistEmbed.description = playlistEmbed.description.substr(0, playlistEmbed.description.indexOf("\n", 500)) + "\n. . .";
    }
    if (playlistEmbed.title.length >= 256) {
        playlistEmbed.title = playlistEmbed.title.substr(0, 240) + " . . .";
    }
    if (playlistEmbed.footer.text.length >= 2048) {
        playlistEmbed.footer.text = playlistEmbed.footer.text.substr(0, 2007) + " . . .";
    }
    message.channel.send({
        embed: playlistEmbed
    }).catch(console.error);
    if (!serverQueue) {
        client.musicQueue.set(message.guild.id, queueConstruct);
        try {
            queueConstruct.connection = await channelToJoin.join();
            music.play(queueConstruct.songs[0], message);
        }
        catch (error) {
            console.error(error);
            client.musicQueue.delete(message.guild.id);
            await channelToJoin.leave();
            return message.channel.send("Error while playing the playlist.").catch(console.error);
        }
    }
}