module.exports = {
    name: 'aramsaufen'
    , description: "Gives you the rules for \'AramSaufen\'."
    , cType: "Leaugue Of Legends"
    , args: false
    , guildOnly: false
    , cooldown: 10
    , execute(receivedMessage, arguments) {
        const Discord = require('discord.js');
        const attachment = new Discord.MessageAttachment('./resources/icons/botlolicon.png', 'botlolicon.png');
        const exampleEmbed = {
            color: 0x1EAAB0
            , title: "Aram saufen regeln:"
            , description: "```1. tod = 1 schluck\n2. Team leader tod = ganzes team\n3. penta = alle 1 schluck außer penta\n4. penta steal = 5 schlücke verteilen\n5. nexus anhitten = exen und founten dive\n6. pro summoner spell der nicht schneeball ist = 1 schluck pro use\n7. schneeball = hinterher sonst ex\n8. ace = 3 schlücke\n9. Schneeballkill = 3 schluck verteilen\n10. Loadingscreen 1 shot```"
            , files: [
                      attachment
                 ]
            , thumbnail: {
                url: "attachment://botlolicon.png"
            }
        }
        if (exampleEmbed.description.length >= 2007) {
            exampleEmbed.description = exampleEmbed.description.substr(0, exampleEmbed.description.indexOf("\n", 2000)) + "\n. . .";
        }
        //data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);
        helpFkts.sendMsgWithDeleteAfter(receivedMessage.channel, "Aramsaufen", 3600000, {
                complete: exampleEmbed
            });
    }
}