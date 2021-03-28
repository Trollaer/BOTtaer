module.exports = {
    name: 'play'
    , aliases: ["p"]
    , description: "Plays either the YouTube-link or searches YouTube and plays the first found video."
    , usage: "<YouTube-link/YouTube-playlist>  or  <searchterm>"
    , cType: "Music"
    , args: true
    , cooldown: 5
    , guildOnly: true
    , needsVoiceChannel: true
    , execute(receivedMessage, arguments) {
        playF(receivedMessage, arguments);
    }
}
const music = require("../../botJS/lib/music.js");
const ytdl = require("ytdl-core");
const YouTubeAPI = require("simple-youtube-api");
const https = require("https");
const youtube = new YouTubeAPI(process.env.YT_API_KEY);
const helpF = require("../../botJS/lib/helpFunctions")
async function playF(receivedMessage, args) {
    var client = receivedMessage.client;
    var guild = receivedMessage.guild;
    var channelToJoin = receivedMessage.member.voice.channel;
    var serverQueue = client.musicQueue.get(receivedMessage.guild.id);
    //aus args song herausfinden https://github.com/eritislami/evobot/blob/master/commands/play.js
    if (channelToJoin.id !== guild.me.voice.channelID && helpF.checkBusy(receivedMessage.client, receivedMessage.guild.id)) { //&& !(monitoring || playing[done])
        helpF.sendMsgWithDeleteAfter(receivedMessage.channel, ("Not in the same channel as böt, who is doing something else. (already playing music or monitoring)"), 20000, {
            embed: true
            , color: "0xFF0000"
            , thumbnail: "botmusicicon.png"
        });
        return;
    }
    const permissions = channelToJoin.permissionsFor(client.user);
    if (!permissions.has("CONNECT")) return receivedMessage.reply("No connection permission");
    if (!permissions.has("SPEAK")) return receivedMessage.reply("No speaking permission");
    const search = args.join(" ");
    const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
    let fullC = receivedMessage.content.substr(1); // Remove the leading exclamation mark
    let splitC = fullC.split(" ") // Split the message up in to pieces for each space
    const url = splitC.slice(1);
    const urlValid = videoPattern.test(url);
    // Start the playlist if playlist url was provided
    if (!videoPattern.test(url) && playlistPattern.test(url)) {
        return client.commands.get("playlist").execute(receivedMessage, url, true); // playlist command
    }
    var queueElement = {
        playing: true
        , connection: null
        , songs: []
        , loop: false
        , volume: 100
        , textChannel: receivedMessage.channel
    }
    let songInfo = null;
    let song = null;
    if (ytdl.validateURL(url)) {
        try {
            songInfo = await ytdl.getInfo(url);
            song = {
                title: songInfo.videoDetails.title
                , url: songInfo.videoDetails.video_url
                , duration: songInfo.videoDetails.lengthSeconds
                , addedBy: receivedMessage.author.username
            };
            //console.log(song);
        }
        catch (error) {
            console.error(error + "************");
            return; //receivedMessage.reply(error.receivedMessage).catch(console.error);
        }
    }
    else {
        try {
            const results = await youtube.searchVideos(search, 1, {
                part: "snippet"
            });
            songInfo = await ytdl.getInfo(results[0].url);
            song = {
                title: songInfo.videoDetails.title
                , url: songInfo.videoDetails.video_url
                , duration: songInfo.videoDetails.lengthSeconds
                , addedBy: receivedMessage.author.username
            };
            //console.log(song);
        }
        catch (error) {
            console.error(error + "################");
            return; //receivedMessage.reply(""+error.receivedMessage).catch(console.error);
        }
    }
    if (serverQueue) {
        serverQueue.songs.push(song); //song adden
        //console.log(serverQueue.songs);
        helpF.sendMsgWithDeleteAfter(receivedMessage.channel, ("Added: " + song.title), 20000, {
            embed: true
            , color: "0xFF0000"
            , thumbnail: "botmusicicon.png"
        });
    }
    else {
        queueElement.songs.push(song); //song adden
        client.musicQueue.set(guild.id, queueElement); //neues element in Q
        try {
            queueElement.connection = await channelToJoin.join();
            //console.log(queueElement.songs[0])
            music.play(queueElement.songs[0], receivedMessage);
            //console.log(queueElement.songs);
        }
        catch (error) {
            console.log(error)
        }
    }
    if (receivedMessage.deletable) {
        receivedMessage.delete().catch(console.error);
    }
}