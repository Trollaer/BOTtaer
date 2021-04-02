module.exports = (client) => {
    client.user.setPresence({
        status: 'online'
        , activity: {
            name: "'$help' to show all commmands."
            , type: 'WATCHING'
        , }
    })
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