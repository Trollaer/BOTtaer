module.exports = {
    name: 'test'
    , aliases: ["u"]
    , description: "test command for adminsBot admins to test stuff"
    , cType: "test"
    , cooldown: 5
    , permissions: "ADMINISTRATOR"
    , async execute(receivedMessage, arguments) {
        //console.log(receivedMessage.client.voice)
        // receivedMessage.client.voice.adapters.get('824006072314495016').onVoiceStateUpdate(function (data){
        //     console.log(data)
        // })
        // receivedMessage.client.voice.adapters.get('824006072314495016').onVoiceServerUpdate(function (data){
        //     console.log(data)
        // })
        const { getVoiceConnection } = require('@discordjs/voice');
        const { getVoiceConnections } = require('@discordjs/voice');

        const connection = getVoiceConnections();

        console.log(connection.get('824006072314495016').packets);
        console.log("RE\n\n")
        console.log(connection.get('824006072314495016').receiver.packets);
        //console.log(receivedMessage.client.voice.adapters.get('824006072314495016'))
         
    }


}