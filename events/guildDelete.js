module.exports = async(client, guild) => {
    const {
        TEST_SERVER
    } = require("../util/BOTtaerUtil.js");
    if (TEST_SERVER) return;
    console.log("Left the guild: '" + guild.name + "' !!!!!!!!!");
}