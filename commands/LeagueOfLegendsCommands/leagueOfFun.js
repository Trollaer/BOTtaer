var champions, items, buildDirections = []
var helpFkts;
module.exports = {
        name: 'leagueoffun'
        , aliases: ["r", "LeaugeOfRandom", "lor", "lof"]
        , description: "Gives you depending on your arguments a random champion/build, raram build direction or a \'Bronze Bravery\' build for league of legends.\n"
        , cType: "Leaugue Of Legends"
        , usage: "<build/champion/raram/bronzeBravery>"
        , explanation: "\n___Options:___\n```ini\n[champion / c]: Gives you a random champion.\n[build / b]: Gives you a random build.\n[raram / r]: Gives you a random build direction.\n[bronzeBravery / bb]: Gives you a random champion + build.```"
        , args: true
        , guildOnly: false
        , cooldown: 2
        , execute(receivedMessage, arguments) {
            if (arguments[1] && (arguments[1] !== "sr" || arguments[1] !== "aram")) {
                return receivedMessage.reply("Invalid map.\nEither:\n 'sr' or none for Summoner#s rift\n 'aram' for you know what.");
            }
            var returnMsg = "";
            var withC = null;
            switch (arguments[0]) {
            case "bronzebravery":
            case "bb":
                withC = getRandomChampion();
                returnMsg = "**" + withC.name + "**\n\n" + getRandomBuild({
                    ranged: withC.ranged
                    , map: arguments[1]
                });
                break;
            case "build":
            case "b":
                returnMsg = getRandomBuild({
                    map: arguments[1]
                });
                break;
            case "champion":
            case "c":
                withC = getRandomChampion();
                returnMsg = "**" + withC.name + "**"
                break;
            case "raram":
            case "r":
                returnMsg = raramCommand(arguments, receivedMessage);
                break;
            default:
                returnMsg = ("Wrong argument. Try: " + this.usage);
                break;
            }
            var icon = withC ? "http://ddragon.leagueoflegends.com/cdn/11.5.1/img/champion/" + withC.name + ".png" : "attachment://botlolicon.png"
            const exampleEmbed = {
                color: 0x1EAAB0
                , description: receivedMessage.author.toString() + "\n\n" + returnMsg
                , thumbnail: {
                    url: icon
                }
            };
            if (!withC) {
                const Discord = require('discord.js');
                const attachment = new Discord.MessageAttachment('./resources/icons/botlolicon.png', 'botlolicon.png');
                exampleEmbed.files = [
                                    attachment
                                        ]
            }
            if (exampleEmbed.description.length >= 2007) {
                exampleEmbed.description = exampleEmbed.description.substr(0, exampleEmbed.description.indexOf("\n", 2000)) + "\n. . .";
            }
            //console.log(exampleEmbed)
            //data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);
            helpFkts.sendMsgWithDeleteAfter(receivedMessage.channel, "Lof", 3600000, {
                complete: exampleEmbed
            });
            if (receivedMessage.deletable) {
                receivedMessage.delete().catch(console.error);
            }
        }
        , init() {
            helpFkts = require("../../botJS/lib/helpFunctions");
            const request = require('request');
            //get items
            const fs = require('fs');
            const Discord = require('discord.js');
            fs.readFile("resources/data/items.json", function (err, data) {
                if (!err) {
                    var tempI = JSON.parse(data);
                    var tempL = new Discord.Collection(tempI.legendary.map(i => [i.name, i]))
                    var tempM = new Discord.Collection(tempI.mythic.map(i => [i.name, i]))
                    items = {
                        mythic: tempM
                        , legendary: tempL
                    };
                }
            })
            var tempC = [];
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
                        tempC.push({
                            name: champ.name
                            , ranged: ranged
                        });
                    }
                    champions = new Discord.Collection(tempC.map(i => [i.name, i]))
                    console.log(tempC.length + " Champs");
                    fs.writeFile("resources/data/champions.json", JSON.stringify(tempC), function (err) {
                        if (err) console.log(err)
                    })
                }
            });
            buildDirections = ["Fighter", "Marksman", "Mage", "Tank", "Assassin", "Support", "On-Hit", "Critical Strike", "Lifesteal/Vamp", "Only Recommended", "MovementSpeed"];
            //console.log("Init: randomlol");
        }
    }
    //const request = require('request');
    /*request('http://ddragon.leagueoflegends.com/cdn/11.1.1/data/en_US/item.json', function (error, response, body) {
           if (!error && response.statusCode == 200) {
               var importedJSON = JSON.parse(body);
               console.log(importedJSON);
           }
       })*/
function getRandomChampion() {
    return champions.random();
}

function getRandomBuild(options) {
    var mI = items.mythic.random();
    options.unique = mI.unique;
    var lIs = getRandomLegendaries(options);
    return mI.name + " -> " + lIs.join(" -> ");
    getRandomBuild({
        ranged: withC.ranged
        , map: arguments[1]
    })
}

function getRandomLegendaries(options) {
    var legendaries = items.legendary;
    if (options) {
        if (options.map === "sr") {
            legendaries = legendaries.filter(it => it.map.sr)
        }
        if (options.map === "aram") {
            legendaries = legendaries.filter(it => it.map.aram)
        }
        if (!options.ranged) {
            legendaries = legendaries.filter(it => !it.rangedOnly)
        }
    }
    var returnIs = []
    legendaries.random(5).forEach(i => {
        returnIs.push(i.name)
    });
    return returnIs;
}
//raram
function raramCommand(arguments, receivedMessage) {
    var buildText = "";
    var buildDirection = getRandomBuildDirection();
    switch (buildDirection) {
    case "Fighter":
    case "Marksman":
    case "Mage":
    case "Tank":
    case "Assassin":
    case "Support":
        buildText += "Go to the ***" + buildDirection + "***-Tab in the shop and build what ever you want!";
        break;
    case "On-Hit":
    case "Critical Strike":
    case "Lifesteal/Vamp":
    case "MovementSpeed":
        buildText += "Go to all items select ***" + buildDirection + "*** and build what ever you want!";
        break;
    case "Only Recommended":
        var temp = Math.floor(Math.random() * 3);
        buildText += "Lucky! Only Build the ***";
        if (temp == 0) {
            buildText += "left ";
        }
        else if (temp == 1) {
            buildText += "middle ";
        }
        else {
            buildText += "right ";
        }
        buildText += "recommended items***. If they change your build changes, too. (If there is only one recommended build it.)"
        break;
    default:
        buildText += "Something went wrong!";
        break;
    }
    return buildText;
}
//BuildDirections
function getRandomBuildDirection() {
    return buildDirections[Math.floor(Math.random() * buildDirections.length)];
}