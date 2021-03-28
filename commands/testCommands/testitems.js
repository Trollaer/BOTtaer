module.exports = {
    name: 'testit'
    , description: "test command for adminsBot admins to test stuff"
    , cType: "test"
    , cooldown: 5
    , permissions: "ADMINISTRATOR"
    , async execute(receivedMessage, arguments) {
        var dbClient=receivedMessage.client.dbClient;
        var jsonData;
        const fs = require('fs');
        fs.readFile("./items.json", (err, data) => {
            if (err) {
                console.error(err)
                return
            }
            jsonData=JSON.parse(data);
        })
        
            console.log(jsonData.data);
    }
}