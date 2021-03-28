module.exports = {
        name: 'itt'
        , aliases: ["itt"]
        , description: "test command for adminsBot admins to test stuff"
        , cType: "test"
        , cooldown: 5
        , permissions: "ADMINISTRATOR"
        , async execute(receivedMessage, arguments) {
            const request = require('request');
            const fs = require('fs');
            var mythicItems = []
                , legendaryItems = []
            request('http://ddragon.leagueoflegends.com/cdn/11.1.1/data/en_US/item.json', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var importedJSON = JSON.parse(body);
                    var allItems = importedJSON.data;
                    for (item in allItems) {
                        var i = allItems[item];
                        if (i.depth === 3) {
                            if (i.description.includes("Mythic Passive")) {
                                mythicItems.push({
                                    name: i.name
                                    , unique: []
                                    , map: i.maps
                                    , group: i.group
                                });
                            }
                            else {
                                legendaryItems.push({
                                    name: i.name
                                    , unique: []
                                    , map: i.maps
                                    , group: i.group
                                });
                            }
                        }
                    }
                    console.log(mythicItems.length + " Mythic")
                    console.log(legendaryItems.length + " legendary")
                    fs.writeFile("mythic2.json", JSON.stringify(mythicItems), function (err) {
                        if (err) console.log(err)
                    });
                    fs.writeFile("legendary2.json", JSON.stringify(legendaryItems), function (err) {
                        if (err) console.log(err)
                    });
                }
            });
            
        var champions = [];
        request('http://ddragon.leagueoflegends.com/cdn/11.4.1/data/en_US/champion.json', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var importedJSON = JSON.parse(body);
                var allChamps = importedJSON.data;
                var ranged = true;
                for (i in allChamps) {
                    var champ = allChamps[i];
                    if (champ.stats.attackrange <= 200) {
                        //console.log(champ.stats.attackrange)
                        ranged = false;
                    }
                    else {
                        ranged = true;
                    }
                    champions.push({
                        name: champ.name
                        , ranged: ranged
                    });
                }
                console.log(champions.length + " Champs");
                fs.writeFile("champions.json", JSON.stringify(champions), function (err) {
                    if (err) console.log(err)
                })
            }
        });
            
    }
}