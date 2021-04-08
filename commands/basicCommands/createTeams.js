var helpFkts;
module.exports = {
    name: 'createteams'
    , aliases: ["teams"]
    , description: "**$createTeams [number of teams]**\n\tGenerates [number of teams] random teams (Default: 2 teams).\n```You must be in a voice-channel. Members of the teams get picked randomly out of your current voice-channel. (Bots or Users with 'cam' in their name (username not nickname) won't be picked)```"
    , cType: "Basic"
    , usage: '[amount of teams]  \n(default two)'
    , args: false
    , guildOnly: false
    , needsVoiceChannel: true
    , cooldown: 10
    , execute(receivedMessage, arguments) {
        createTeamsCommand(arguments, receivedMessage)
    }
    , init() {
        helpFkts = require("../../botJS/lib/helpFunctions")
    }
}

function createTeamsCommand(arguments, receivedMessage) {
    var client = receivedMessage.client;
    //alle nicht cam user
    var usersChannel = receivedMessage.member.voice.channel;
    if (usersChannel == null) {
        helpFkts.sendMsg(receivedMessage.channel,"You must be in a voice-channel to use this command!");
        return;
    }
    var chan = client.channels.cache.get(`${usersChannel.id}`);
    //console.log(chan.members);
    var UsersNoCams = [];
    chan.members.forEach(function (member) {
        if ((member.roles.cache.some(role => role.name === 'Cam')) || (member.user.bot)) {
            return;
        }
        else {
            UsersNoCams.push(member.user.username);
            //console.log(member.user.username);
        }
    })
    UsersNoCams = helpFkts.shuffle(UsersNoCams);
    var numberOfTeams = 2;
    if (arguments.length == 1) {
        numberOfTeams = parseInt(arguments[0], 10);
    }
    if (numberOfTeams > UsersNoCams.length) {
        helpFkts.sendMsg(receivedMessage.channel,"More Teams then Players!");
        return;
    }
    var TeamsMsg = "";
    for (var n = 0; n < numberOfTeams; n++) {
        TeamsMsg = "**Team " + n + ":**\n"
        for (var i = 0; i < UsersNoCams.length; i++) {
            if ((i % numberOfTeams) == n) {
                TeamsMsg += "- " + UsersNoCams[i] + "\n"
            }
        }
        var randomColor = Math.floor(Math.random()*16777215).toString(16);
        var teamEmbed = {
            color: helpFkts.getRandomColor()
            , description: TeamsMsg
        , };
        if (teamEmbed.description.length >= 2007) {
            teamEmbed.description = teamEmbed.description.substr(0, teamEmbed.description.indexOf("\n", 500)) + "\n. . .";
        }
        //data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);
        helpFkts.sendMsg(receivedMessage.channel,{
            complete: teamEmbed
        });
    }
}