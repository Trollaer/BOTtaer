module.exports = {
    name: "soundboard"
    , aliases: ["sb"]
    , description: "Lets you play sounds from a soundboard.\nBöt needs to be in a channel and it"
    , cType: "Soundboard"
    , args: false
    , cooldown: 5
    , guildOnly: true
    , execute(message, arguments) {
        const helpF = require("../../botJS/lib/helpFunctions");
        //schaun ob sb aktiv
        var embed = {
            color: "#82fa9e"
            , title: "You can find the soundboard here."
            , url: "https://bottaer.herokuapp.com/soundboard/" + message.guild.id
        };
        helpF.sendMsgWithDeleteAfter(message.channel, "SB", 30000, {
                complete: embed
            });
        if (message.deletable) {
            message.delete().catch(console.error);
        }
    }
}