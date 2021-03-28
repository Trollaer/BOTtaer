module.exports = async (client, guild) => {
    const dbClient=client.dbClient;
    await dbClient.query("INSERT INTO guildConfigs (guildID, DJRole) VALUES ($1 , $2)", [guild.id , guild.roles.everyone.id], function (dbError, dbResponse) {
        if (dbError) {
            console.log(dbError);
            return;
        }
        else {
            console.log("Joined the guild: '" + guild.name + "' !!!!!!!!!");
        }
    });
}