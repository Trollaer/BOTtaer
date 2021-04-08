module.exports = {
    name: "soundboard"
    , aliases: ["sb"]
    , description: "Lets you play sounds from a soundboard.\n:exclamation:Böt **needs** to be in a channel to use the soundboard. (use {prefix}join for böt to join your channel)"
    , cType: "Soundboard"
    , args: false
    , cooldown: 5
    , guildOnly: true
    , execute(message, arguments) {
        var client = message.client;
        const helpF = require("../../botJS/lib/helpFunctions");
        var confG = client.guildConfigs.get(message.guild.id);
        var embed = {
            color: "#82fa9e"
            , title: "You can find the soundboard here."
            , url: "https://bottaer.herokuapp.com/soundboard/" + message.guild.id
        };
        if (confG) {
            if (!confG.soundboard) {
                embed.title = "The soundboard for this server is deactivated!";
                embed.url = null;
            }
        }
        //schaun ob sb aktiv
        helpF.sendMsgWithDeleteAfter(message.channel, "SB", 30000, {
            complete: embed
        });
        if (message.deletable) {
            message.delete().catch(console.error);
        }
    }
}