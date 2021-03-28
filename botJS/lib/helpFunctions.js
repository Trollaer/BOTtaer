//check DJ role
exports.checkDJrole = function (member, guildID) {
        const conf = member.client.guildConfigs.get(guildID);
        var djRole;
        if (!conf) {
            console.log("Error no conf for guild");
        }
        else {
            djRole = conf.DJrole;
        }
        var perm = false;
        //console.log(djRole)
        if (djRole) {
            if (member.roles.cache.has(djRole) || member.permissions.has("ADMINISTRATOR")) { //||member.permissions.has("ADMINISTRATOR")
                perm = true;
            }
        }
        else{
            perm = true;
        }
        return perm;
    }
    //check busy status
exports.checkBusy = function (client, guildID) {
        var busy = false
        var config = client.guildConfigs.get(guildID);
        if (config) {
            if (config.monitoringAll) {
                if (config.monitoringAll.currentlyMonitoring) {
                    busy = true;
                }
            }
            if (config.busy) {
                busy = true;
            }
        }
        var musicQueue = client.musicQueue.get(guildID);
        if (musicQueue) {
            if (musicQueue.playing) {
                busy = true;
            }
        }
        return busy;
    }
    //random color
exports.getRandomColor = function () {
        var letters = '0123456789ABCDEF';
        var color = '0x';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    //message that gets delete after some time
exports.sendMsgWithDeleteAfter = function (channel, msg, time, options) {
        if (options) {
            var embed;
            if (options.complete) {
                embed = options.complete;
            }
            else
            if (options.embed) {
                embed = {
                    color: options.color ? options.color : "#82fa9e"
                    , description: msg
                };
                if (options.embed.description) {
                    embed.description = options.embed.description;
                }
                if (embed.description.length >= 500) {
                    embed.description = embed.description.substr(0, embed.description.indexOf("\n", 500)) + "\n. . .";
                }
                if (options.title) {
                    embed.setTitle(options.title);
                    if (embed.title.length >= 256) {
                        embed.title = embed.title.substr(0, 240) + " . . .";
                    }
                }
                if (options.thumbnail) {
                    var attachment;
                    const Discord = require('discord.js');
                    if (options.thumbnail === true) {
                        embed.thumbnail = {
                            url: "attachment://botbasicicon.png"
                        };
                        attachment = new Discord.MessageAttachment("./resources/icons/botbasicicon.png", "botbasicicon.png");
                    }
                    else {
                        embed.thumbnail = {
                            url: "attachment://" + options.thumbnail
                        };
                        attachment = new Discord.MessageAttachment(("./resources/icons/" + options.thumbnail), options.thumbnail);
                    }
                    embed.files = [attachment];
                } //add other stuff
                embed = {
                    color: options.color ? options.color : "#82fa9e"
                    , description: msg
                }
            };
            channel.send({
                embed: embed
            }).then(mssg => {
                if (time > 1) {
                    setTimeout(function () {
                        if (mssg && !mssg.deleted) {
                            mssg.delete().catch(console.error);
                        }
                        else {
                            console.log("NO MSSG")
                        }
                    }, time);
                }
            });
        }
        else {
            channel.send(msg).then(mssg => {
                if (time > 1) {
                    setTimeout(function () {
                        if (mssg && !mssg.deleted) {
                            mssg.delete().catch(console.error);
                        }
                        else {
                            console.log("NO MSSG")
                        }
                    }, time);
                }
            });
        }
    }
    //shuffels an Array
exports.shuffle = function (array) {
    var currentIndex = array.length
        , temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}
exports.joinIn = function (channel) {
    if (channel) {
        var conne = channel.join().then(connection => {
            // Yay, it worked!
            console.log("Successfully connected.");
        }).catch(e => {
            // Oh no, it errored! Let's log it to console :)
            console.error(e);
        });
        return conne;
    }
}
//*************monitor user****************
exports.checkMonitoredMember = function (userData, member, speaking) {
    var timeNow = Date.now();
    if (!userData.lastEventValue) {
        userData.lastEventValue = timeNow;
        return;
    }
    var timeDiff = timeNow - userData.lastEventValue;
    userData.lastEventValue = Date.now();
    if (speaking == 1) { //angefange zu sprechen => um timediff länge nichtsgesagt
        userData.timeSpoken -= timeDiff;
        if (userData.timeSpoken < 0) {
            userData.timeSpoken = 0;
        }
    }
    else {
        userData.timeSpoken += timeDiff;
        if (userData.timeoutAfter < userData.timeSpoken) {
            console.log("TIMEOUT " + userData.userID);
            if (member.voice.channel) {
                try {
                    member.voice.setMute(true, "Talked for too long.");
                    setTimeout(function () {
                        if (member.voice.channel) {
                            member.voice.setMute(false, "Your timeout ran out.");
                        }
                        else {
                            console.log("not in voice")
                        }
                        userData.timeSpoken = 0;
                        userData.lastEventValue = undefined;
                    }, userData.timeoutAfter * 2)
                }
                catch (err) {}
            }
            else {
                console.log("not in voice")
            }
        }
        else {
            //console.log("No Timeout");
        }
    }
    //console.log(userData.timeSpoken)
    //console.log(userData);
}
exports.updateTimeSpoken = function (allUserData, member, speaking) {
    var userData = allUserData.get(member.user.id);
    if (!userData) {
        var memberData = {
            userID: member.user.id
            , timeSpoken: 0
            , lastEventValue: Date.now()
        }
        allUserData.set(member.user.id, memberData)
        return;
    }
    var timeNow = Date.now();
    if (!userData.lastEventValue) {
        userData.lastEventValue = timeNow;
        return;
    }
    var timeDiff = timeNow - userData.lastEventValue;
    userData.lastEventValue = Date.now();
    if (speaking == 0) {
        userData.timeSpoken += timeDiff;
    }
    //console.log(userData.timeSpoken)
    //console.log(userData);
}
exports.moveUserToChannel = function (member, channel, msgchannel) {
    if (member.voice) {
        member.voice.setChannel(channel);
    }
    else if (msgchannel) {
        msgchannel.send(member.name + ": You need to be in a voice channel to be moved.")
    }
}
exports.msToTime = function (duration) {
    var milliseconds = parseInt((duration % 1000) / 100)
        , seconds = Math.floor((duration / 1000) % 60)
        , minutes = Math.floor((duration / (1000 * 60)) % 60)
        , hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    return hours + ":" + minutes + ":" + seconds;
}