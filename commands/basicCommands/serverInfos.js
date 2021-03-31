module.exports = {
    name: 'serverinfos'
    , aliases: ["infos"]
    , description: "Shows you infos about the server."
    , cType: "Basic"
    , args: false
    , guildOnly: true
    , cooldown: 20
    , execute(receivedMessage, arguments) {
        var guild = receivedMessage.guild
        var conf = receivedMessage.client.guildConfigs.get(guild.id)
        if (!conf) return receivedMessage.reply("Error conf")
        var returnMsg = "\n**Prefix:** '" + conf.prefix + "'";
        returnMsg += "\n**Owner: ** " + guild.owner.user.username;
        var cDate = Date(guild.createdTimestamp + 3600).toString()
        cDate = cDate.split(" GMT");
        returnMsg += "\n**Creation Date: ** " + cDate[0];
        returnMsg += "\n**Region: ** " + guild.region;
        returnMsg += "\n**Member count: ** " + guild.memberCount;
        var voiceCount = 0;
        var catCount = 0;
        var textCount = 0;
        var totalCount = 0;
        guild.channels.cache.forEach(c => {
            if (c.type === "text") {
                textCount++;
            }
            else if (c.type === "category") {
                catCount++;
            }
            else if (c.type === "voice") {
                voiceCount++;
            }
            totalCount++;
        })
        returnMsg += "\n**Channel count: ** " + totalCount + "\n    - Categories: " + catCount + "\n    - Text: " + textCount + "\n    - Voice: " + voiceCount;
        if (guild.afkChannel) {
            returnMsg += "\n**AFK channel: ** " + guild.afkChannel.name;
        }
        returnMsg += "\n**Roles count: ** " + guild.roles.cache.array().length;
        if (conf.DJrole) {
            var dj = guild.roles.cache.get(conf.DJrole)
            if (dj) returnMsg += "\n**DJ-role: ** <@&" + conf.DJrole + ">";
        }
        returnMsg += "\n**Soundboard: **" + (conf.soundboard ? "activated" : "deactivated")
        const exampleEmbed = {
            title: "__**Infos about '" + guild.name + "':**__"
            , color: 0x06C436
            , description: returnMsg
            , thumbnail: {
                url: "attachment://botinfosicon.png"
            }
        };
        const Discord = require('discord.js');
        const attachment = new Discord.MessageAttachment('./resources/icons/botinfosicon.png', 'botinfosicon.png');
        exampleEmbed.files = [
                                    attachment
                                        ]
        if (exampleEmbed.description.length >= 2007) {
            exampleEmbed.description = exampleEmbed.description.substr(0, exampleEmbed.description.indexOf("\n", 500)) + "\n. . .";
        }
        //data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);
        receivedMessage.channel.send({
            embed: exampleEmbed
        });
    }
}