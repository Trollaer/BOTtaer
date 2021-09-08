const ytdl = require("ytdl-core-discord");
const helpF = require("./helpFunctions");
module.exports = {
    async play(song, message) {
        const queue = message.client.musicQueue.get(message.guild.id);
        if (!song) {
            helpF.sendMsgWithDeleteAfter(queue.textChannel, "Queue is empty", 10000);
            return message.client.musicQueue.delete(message.guild.id);
        }
        let stream = null;
        let streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus";
        try {
            if (song.url.includes("youtube.com")) {
                stream = await ytdl(song.url, {
                    highWaterMark: 1 << 25
                });
            }
        }
        catch (error) {
            if (queue) {
                queue.songs.shift();
                module.exports.play(queue.songs[0], message);
            }
            console.log("ER")
            return console.error(error);;
        }
        queue.connection.on("disconnect", () => message.client.musicQueue.delete(message.guild.id));
        const dispatcher = queue.connection.play(stream, {
            type: streamType
        }).on("finish", () => {
            if (collector && !collector.ended) collector.stop();
            if (queue.loop) {
                // if loop is on, push the song back at the end of the queue
                // so it can repeat endlessly
                let lastSong = queue.songs.shift();
                queue.songs.push(lastSong);
                module.exports.play(queue.songs[0], message);
            }
            else {
                // Recursively play the next song
                queue.songs.shift();
                module.exports.play(queue.songs[0], message);
            }
        }).on("error", (err) => {
            console.error(err);
            queue.songs.shift();
            module.exports.play(queue.songs[0], message);
        });
        dispatcher.setVolumeLogarithmic(queue.volume / 100);
        try {
            const embed = {
                color: "0xFF0000"
                , thumbnail: {
                    url: "attachment://botmusicicon.png"
                }
                , title: "**Playing:**"
                , description: song.title + "\n\n" + song.url + "\n"
                , footer: {
                    text: "Added by: " + song.addedBy
                }
            }
            const Discord = require('discord.js');
            const attachment = new Discord.MessageAttachment('./resources/icons/botmusicicon.png', 'botmusicicon.png');
            embed.files = [
                                    attachment
                                        ];
            if (embed.description.length >= 500) {
                embed.description = embed.description.substr(0, embed.description.indexOf("\n", 2000)) + "\n. . .";
            }
            var playingMessage = await queue.textChannel.send({
                embeds: [embed]
            });;
            await playingMessage.react("⏭");
            await playingMessage.react("🔇");
            await playingMessage.react("🔉");
            await playingMessage.react("🔊");
            await playingMessage.react("🔁");
            await playingMessage.react("⏹");
        }
        catch (error) {
            console.error(error);
        }
        const filter = (reaction, user) => user.id !== message.client.user.id;
        var collector = playingMessage.createReactionCollector(filter, {
            time: song.duration > 0 ? song.duration * 1000 : 600000
        });
        var sendMsg;
        collector.on("collect", (reaction, user) => {
            if (!queue) return;
            const member = message.guild.members.cache.get(user.id);
            if (!queue.connection.dispatcher) {
                return;
            }
            var perm = helpF.checkDJrole(member, message.guild.id);
            switch (reaction.emoji.name) {
            case "⏭":
                if (perm) {
                    rMsg = "Skip";
                    queue.playing = true;
                    queue.connection.dispatcher.end();
                }
                else {
                    rMsg = "You need the DJ-role to skip."
                }
                reaction.users.remove(user).catch(console.error);
                helpF.sendMsgWithDeleteAfter(queue.textChannel, rMsg, 2000, {
                    embed: true
                    , color: "0xFF0000"
                });
                if (perm) collector.stop();
                break;
                /*case "⏯":
                    reaction.users.remove(user).catch(console.error);
                    if (queue.playing) {
                        queue.playing = false;
                        queue.connection.dispatcher.pause();
                        helpF.sendMsgWithDeleteAfter(queue.textChannel, "Pause", 2000, {
                            embed: true
                            , color: "0xFF0000"
                        });
                    }
                    else {
                        queue.playing = true;
                        queue.connection.dispatcher.resume();
                        helpF.sendMsgWithDeleteAfter(queue.textChannel, "Resume", 2000, {
                            embed: true
                            , color: "0xFF0000"
                        });
                    }
                    break;*/
            case "🔇":
                reaction.users.remove(user).catch(console.error);
                if (queue.volume <= 0) {
                    queue.volume = 100;
                    queue.connection.dispatcher.setVolumeLogarithmic(100 / 100);
                    helpF.sendMsgWithDeleteAfter(queue.textChannel, "Unmuted", 2000, {
                        embed: true
                        , color: "0xFF0000"
                    });
                }
                else {
                    queue.volume = 0;
                    queue.connection.dispatcher.setVolumeLogarithmic(0);
                    helpF.sendMsgWithDeleteAfter(queue.textChannel, "Muted", 2000, {
                        embed: true
                        , color: "0xFF0000"
                    });
                }
                break;
            case "🔉":
                reaction.users.remove(user).catch(console.error);
                if (queue.volume == 0) return;
                if (queue.volume - 10 <= 0) queue.volume = 0;
                else queue.volume = queue.volume - 10;
                queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
                helpF.sendMsgWithDeleteAfter(queue.textChannel, "Decreased volume", 2000, {
                    embed: true
                    , color: "0xFF0000"
                });
                break;
            case "🔊":
                reaction.users.remove(user).catch(console.error);
                if (queue.volume == 100) return;
                if (queue.volume + 10 >= 100) queue.volume = 100;
                else queue.volume = queue.volume + 10;
                queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
                helpF.sendMsgWithDeleteAfter(queue.textChannel, "Increased volume", 2000, {
                    embed: true
                    , color: "0xFF0000"
                });
                break;
            case "🔁":
                reaction.users.remove(user).catch(console.error);
                queue.loop = !queue.loop;
                helpF.sendMsgWithDeleteAfter(queue.textChannel, "Loop " + (queue.loop ? "on" : "off"), 2000, {
                    embed: true
                    , color: "0xFF0000"
                });
                break;
            case "⏹":
                reaction.users.remove(user).catch(console.error);
                queue.songs = [];
                helpF.sendMsgWithDeleteAfter(queue.textChannel, "Stop", 2000, {
                    embed: true
                    , color: "0xFF0000"
                });
                try {
                    queue.connection.dispatcher.end();
                }
                catch (error) {
                    console.error(error);
                    queue.connection.disconnect();
                }
                collector.stop();
                break;
            default:
                reaction.users.remove(user).catch(console.error);
                break;
            }
        });
        collector.on("end", () => {
            playingMessage.reactions.removeAll().catch(console.error);
            if (playingMessage && !playingMessage.deleted) {
                playingMessage.delete({
                    timeout: 3000
                }).catch(console.error);
            }
        });
    }
}