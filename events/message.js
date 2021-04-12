const Discord = require('discord.js');
module.exports = (client, receivedMessage) => {
    const {
        TEST_SERVER
    } = require("../util/BOTtaerUtil.js");
    if (TEST_SERVER && !["185773278927781889", "293750296084086785"].includes(receivedMessage.author.id)) return;
    const dbClient = client.dbClient;
    if (receivedMessage.author.bot) return; // Prevent bot from responding to its own messages
    var cooldowns = client.cooldowns;
    var präfix;
    var msgGuildId;
    var guildConfig;
    if (!receivedMessage.channel.guild) {
        präfix = "$";
    }
    else {
        msgGuildId = receivedMessage.guild.id;
        guildConfig = client.guildConfigs.get(msgGuildId);
        if (!guildConfig) {
            client.commands.get("setcurrentguilds").execute(receivedMessage, [], dbClient)
            receivedMessage.reply("Please try again your guild wasn't in the list!");
            return;
        }
        präfix = guildConfig.prefix;
    }
    if (receivedMessage.content.startsWith(präfix) || receivedMessage.content.startsWith("$help")) {
        let fullCommand = receivedMessage.content.substr(1).toLowerCase(); // Remove the leading exclamation mark
        let splitCommand = fullCommand.split(" ") // Split the message up in to pieces for each space
        let commandName = splitCommand[0]; // The first word directly after the exclamation is the command
        let arguments = splitCommand.slice(1);
        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        if (!command) {
            return;
        }
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Discord.Collection());
        }
        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;
        if (timestamps.has(receivedMessage.author.id)) {
            const expirationTime = timestamps.get(receivedMessage.author.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return receivedMessage.reply(`please wait ${timeLeft.toFixed(1)} more seconds before reusing the \'${command.name}\' command.`);
            }
        }
        timestamps.set(receivedMessage.author.id, now);
        setTimeout(() => timestamps.delete(receivedMessage.author.id), cooldownAmount);
        try {
            processCommand(receivedMessage, command, commandName, arguments)
        }
        catch (err) {
            console.log("*************ERROR while running command********************\n" + err)
            throw err;
        }
    }
}

function processCommand(receivedMessage, command, commandName, arguments) {
    // All other words are arguments/parameters/options for the command
    console.log("Command received: " + commandName);
    console.log("Arguments: " + arguments); // There may not be any arguments
    //****
    if (!command) return receivedMessage.channel.send("No valid command. Type '$help' to list all commands.");
    //evtl args überprüfen //IN .js command files [args:true] und usage: "[arg 1] [arg 2]"
    if (receivedMessage.author.id !== "185773278927781889" && command.cType === "test") {
        return receivedMessage.channel.send("You are not on the bot crew.");
    }
    if (command.args && !arguments.length) {
        let reply = `You didn't provide any arguments, ${receivedMessage.author}!`;
        if (command.usage) {
            reply += `\nThe proper usage would be: \`\$${command.name} ${command.usage}\``;
        }
        return receivedMessage.channel.send(reply);
    }
    //guild only 
    if (command.guildOnly && !receivedMessage.channel.guild) {
        return receivedMessage.reply('I can\'t execute that command inside DMs!');
    }
    // evtl https://discordjs.guide/command-handling/adding-features.html#cooldowns
    //permissions
    if (command.permissions) {
        if (receivedMessage.channel.type !== "dm") {
            const authorPerms = receivedMessage.channel.permissionsFor(receivedMessage.author);
            if (!authorPerms || !authorPerms.has(command.permissions)) {
                return receivedMessage.reply('You do not have the permission \'' + command.permissions + '\'');
            }
        }
    }
    if (command.needsVoiceChannel) {
        var channel = receivedMessage.member.voice.channel;
        if (!channel) {
            receivedMessage.channel.send("You must be in a voice channel for this command.");
            return;
        }
        else if (command.sameChannelLikeBot && channel.id !== receivedMessage.guild.me.voice.channelID) {
            receivedMessage.channel.send("You need to be in the same channel as böt.");
            return;
        }
    }
    //user is in voice channel
    try {
        command.execute(receivedMessage, arguments);
    }
    catch (error) {
        console.error(error);
        return receivedMessage.channel.send("An error accurred runnnig the command: $" + commandName);
    }
}