module.exports = (client) => {
    testMode=client.testMode;
    if (!testMode) {
        testMode = false;
        client.user.setPresence({
            status: 'online'
            , activity: {
                name: "'$help' to show all commmands."
                , type: 'WATCHING'
            , }
        })
    }
    else {
        testMode = true;
        client.user.setPresence({
            status: 'dnd'
            , activity: {
                name: "TEST MODE: no commands except from the bots' team."
                , type: 'COMPETING'
            , }
        })
    }
    console.log("Started!");
    try {
        client.commands.forEach(c => {
            if (c.init) {
                c.init(client);
                console.log(c.name + " INIT")
            }
        })
    }
    catch (error) {
        return console.log("Init went wrong!\n" + error);
    }
}