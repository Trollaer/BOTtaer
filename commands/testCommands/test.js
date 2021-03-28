module.exports = {
        name: 'test'
        , aliases: ["itt"]
        , description: "test command for adminsBot admins to test stuff"
        , cType: "test"
        , cooldown: 5
        , permissions: "ADMINISTRATOR"
        , async execute(receivedMessage, arguments) {
            const request = require('request');
            const fs = require('fs');
            var l;
            fs.readFile("legendary.json",function(err,data){
                if(!err){
                    l=JSON.parse(data);
                }
            })
            var m;
            fs.readFile("mythic.json",function(err,data){
                if(!err){
                    m=JSON.parse(data);
                }
            })
            fs.writeFile("resources/data/items.json", JSON.stringify(l)+JSON.stringify(m), function (err) {
                        if (err) console.log(err)
                    });
            
    }
}