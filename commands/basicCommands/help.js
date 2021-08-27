module.exports = {
    name: 'help'
    , description: 'List all of the commands or info about a specific command.'
    , aliases: ['commands', 'c', 'h','böt','bottaer']
    , cType: "Basic"
    , usage: '[command_name]'
    , data: [{
        type: "Basic"
        , commandNames: []
    }]
    , cooldown: 5
    , execute(message, args) {
        const helpF = require("../../botJS/lib/helpFunctions");
        var data = "";
        var titleText;
        const {
            commands
        } = message.client;
        var commandsList = message.client.commands.get("help").data;
        if (!args.length) {
            titleText = '__**List of all commands:**__'
            commandsList.forEach(cL => {
                data += "\n__" + cL.type + ":__```fix\n" + cL.commandNames.join("\n") + "```";
            })
            data += "\nYou can send \`\$help [command name]\` to get info on a specific command!";
        }
        else {
            const name = args[0].toLowerCase();
            const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
            if (!command) {
                data = ('That\'s not a valid command!');
            }
            else {
                titleText = (`**Name:** ${command.name}`);
                if (command.aliases) data += (`\n\n**Aliases:**  ${command.aliases.join(', ')}`);
                if (command.cType) data += (`\n\n**Type:**  ${command.cType}`);
                if (command.description) data += (`\n\n** Description:**  ${command.description}`);
                if (command.usage) data += (`\n\n**Usage:**  \$${command.name} ${command.usage}`);
                if (command.explanation) data += (`\n\n**Explanation:**  ${command.explanation}`);
            }
        }
        const exampleEmbed = {
            color: 0xFFB224
            , title: titleText
            , description: data + "\n____________________________"
            , thumbnail: {
                url: "attachment://bothelpicon.png"
            }
            , fields: [
                {
                    name: 'https://discord.gg/M986FMJ2G3'
                    , value: 'Join the server if you found a bug, want more information, have some ideas/suggestions or just want to talk.'
                , }]
        };
        if (message.channel.guild) {
            var gConf = message.client.guildConfigs.get(message.guild.id);
            if (gConf) {
                var prefix = gConf.prefix;
                if (prefix !== "$") {
                    exampleEmbed.fields.push({
                        name: "⚠️ **The prefix for this server is:   ` " + prefix + " `**⚠️"
                        , value: "(only '$böt' or '$bottaer' works with '$')"
                    })
                }
            }
        }
        const Discord = require('discord.js');
        const attachment = new Discord.MessageAttachment('./resources/icons/bothelpicon.png', 'bothelpicon.png');
        exampleEmbed.files = [
                                    attachment
                                        ]
        if (exampleEmbed.description.length >= 2007) {
            exampleEmbed.description = exampleEmbed.description.substr(0, exampleEmbed.description.indexOf("\n", 500)) + "\n. . .";
        }
        //data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);
        helpF.sendMsg(message.channel, {
            complete: exampleEmbed
            , deleteAfter: 30000
        });
        if (message.deletable) {
            message.delete().catch(console.error);
        }
    }
    , init(client) {
        var data = client.commands.get("help").data;
        var cTL;
        client.commands.forEach(c => {
                if (c.cType == "test") {
                    return;
                }
                if (c.cType) {
                    cTL = data.find(function (dat) { //ist command type schon in der liste?
                        return dat.type === c.cType;
                    });
                }
                else {
                    cTL = data.find(function (dat) { //ist command type schon in der liste?
                        return dat.type === "Basic";
                    });
                }
                if (cTL) {
                    cTL.commandNames.push(c.name);
                }
                else {
                    data.push({
                        type: c.cType
                        , commandNames: [c.name]
                    })
                }
            })
            //console.log(data);
    }
};