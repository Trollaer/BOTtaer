module.exports = {
    name: 'test'
    , aliases: ["itt"]
    , description: "test command for adminsBot admins to test stuff"
    , cType: "test"
    , cooldown: 5
    , permissions: "ADMINISTRATOR"
    , async execute(receivedMessage, arguments) {
        const helpF = require("../../botJS/lib/helpFunctions")
        helpF.sendMsg(receivedMessage.channel, "TEST nachricht", {
            color: helpF.getRandomColor()
            , thumbnail: "http://ddragon.leagueoflegends.com/cdn/11.5.1/img/champion/Zed.png"
        })
    }
}