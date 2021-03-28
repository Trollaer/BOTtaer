module.exports = (client, error) => {
        var errMsg = Date.now() + "********\n" + error.message
        fs.writeFile("./errors", errMsg, function (error) {
            if (error) {
                return error;
            }
        });
        client.users.get("185773278927781889").send("ERROR");
        console.log(err.message);
}