module.exports = {
        name: 'test'
        , aliases: ["itt"]
        , description: "test command for adminsBot admins to test stuff"
        , cType: "test"
        , cooldown: 5
        , permissions: "ADMINISTRATOR"
        , async execute(receivedMessage, arguments) {
            receivedMessage.client.guilds.cache.forEach(
            g=>{
                receivedMessage.channel.send(g.name+" | "+g.id)
            })
    }
}