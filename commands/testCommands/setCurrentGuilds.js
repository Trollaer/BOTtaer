module.exports = {
    name: 'setcurrentguilds'
    , description: "inserts current guilds"
    , cType: "test"
    , cooldown: 5
    , permissions: "ADMINISTRATOR"
    , async execute(receivedMessage, arguments) {
        var dbClient=receivedMessage.client.dbClient;
        const Discord = require('discord.js');
        var client = receivedMessage.client;
        client.guilds.cache.forEach(async function (g) {
            await dbClient.query("INSERT INTO guildConfigs (guildID) VALUES ($1)", [g.id], function (dbError, dbResponse) {
                if (dbError) {
                    if (dbError.code === "23505") {
                        console.log("Already in Database.")
                    }
                    else {
                        console.log(dbError);
                    }
                    return;
                }
                else {
                    receivedMessage.client.guildConfigs.set(receivedMessage.guild.id, {
                        prefix: "$"
                        , DJrole: null
                        , monitoringAll: null
                        , monitoringUsers: null
                    })
                    console.log("Joined the guild: '" + g.name + "' !!!!!!!!!");
                }
            });
        })
    }
}