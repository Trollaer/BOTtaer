const fs = require("fs");
const createMaster = require("./create");
const loadMaster = require("./load");
//****************CREATE*********************
exports.create = create;
async function create(guild, author, dbClient) {
    var gN = guild.name;
    var backupID = "" + guild.id + Date.now();
    var dataB = await createMaster.createBackup(guild);
    var timeMillis = Date.now() / 1000 + 3600;
    await dbClient.query("INSERT INTO backups (backupID, guildID, creationDate, data) VALUES ($1, $2, TO_TIMESTAMP($3), $4)", [backupID, guild.id, timeMillis, dataB], function (dbError, dbResponse) {
        if (dbError) {
            author.send("Something went wrong while saving the backup for '" + gN + "'");
            console.log(dbError);
            return;
        }
    });
    var dataR = await createMaster.backupRoles(guild);
    await dbClient.query("INSERT INTO rolesbackups (backupID, guildID, creationDate, data) VALUES ($1, $2, TO_TIMESTAMP($3), $4)", [backupID, guild.id, timeMillis, dataR], function (dbError, dbResponse) {
        if (dbError) {
            author.send("Something went wrong while saving the roles for '" + gN + "'");
            console.log(dbError);
            return;
        }
    });
    var embed = {
        color: "#09fc81"
        , description: "Backup and Rolebackup for '" + gN + "' successful with backupID: `" + backupID + "`"
    };
    author.send({
        embed: embed
    });
}
//***************LOAD*********************
/// UMSTRUKTURIEREN
///2 fkt loadR und loadS -> DB query -> parsen  master.load
exports.loadServer = loadServer;
exports.loadRoles = loadRoles;
exports.reset = reset;
exports.list = list;
// load und load role eigenen commands 
async function loadServer(guild, author, backupID, client, resetBol) {
    const dbClient = client.dbClient;
    dbClient.query("SELECT * FROM backups WHERE backupID = $1", [backupID], async function (dbError, dbResponse) {
        if (dbError) {
            author.send("Something went wrong while getting the backup data for `" + backupID + "`");
            console.log(dbError);
            return;
        }
        else if (dbResponse.rows.length === 0) {
            author.send("There is no backup with the backupID: `" + backupID + "`");
        }
        else {
            var cDate = "" + dbResponse.rows[0].creationdate;
            cDate = cDate.split(" GMT");
            author.send({
                embed: {
                    color: "#09fc81"
                    , title: "The backup with the backupID: `" + backupID + "` is getting loaded."
                    , description: "It was created on " + cDate[0] + ".\n If you see channels, that shouln't be there (you can't join or write in them), these are just visual bugs from Discord. To fix them, just quit Discord. Not just close it but quit."
                }
            });
            if (resetBol) {
                await reset(guild, author, true);
            }
            //console.log(dbResponse.rows[0].data);
            await loadMaster.loadBackup(guild, dbResponse.rows[0].data.data, client);
        }
    });
}
async function loadRoles(guild, author, backupID, dbClient) {
    dbClient.query("SELECT * FROM rolesbackups WHERE backupID = $1", [backupID], async function (dbError, dbResponse) {
        if (dbError) {
            author.send("Something went wrong while getting the roles-backup data for `" + backupID + "`");
            console.log(dbError);
            return;
        }
        else if (dbResponse.rows.length === 0) {
            author.send("There is no backup with the backupID: `" + backupID + "`");
        }
        else {
            var cDate = "" + dbResponse.rows[0].creationdate;
            cDate = cDate.split(" GMT");
            author.send({
                embed: {
                    color: "#09fc81"
                    , title: "The roles from the backup with the backupID: `" + backupID + "` are getting loaded."
                    , description: "It was created on " + cDate[0] + "."
                }
            });
            //log Data
            await loadMaster.loadRoles(guild, dbResponse.rows[0].data);
        }
    });
}
//*****************LIST**************
async function list(guild, author, dbClient) {
    dbClient.query("SELECT * FROM backups WHERE guildID = $1 ORDER BY creationDate DESC LIMIT 8", [guild.id], function (dbError, dbResponse) {
        if (dbError) {
            author.send("Something went wrong while getting a list of backups for '" + guild.name + "'.");
            console.log(dbError);
            return;
        }
        else if (dbResponse.rows.length === 0) {
            author.send("There are no backups for '" + guild.name + "'.");
        }
        else {
            var backupList = "";
            var cDate;
            dbResponse.rows.forEach(row => {
                cDate = "" + row.creationdate;
                cDate = cDate.split(" GMT");
                backupList += "\n+ " + cDate[0] + ": '" + row.backupid + "'"
            });
            author.send("Recent backups for '" + guild.name + "': ```diff" + backupList + "```\n");
        }
    });
}
//*****************RESET*************
async function reset(guild, author, loadBol) {
    await guild.emojis.cache.forEach(async function (emoji) {
        await emoji.delete();
    });
    await guild.roles.cache.forEach(await async function (role) {
        try {
            if (role.editable && role.name != '@everyone' && role.name != 'BOTtaer') await role.delete().catch(function (err) {
                console.log(err)
            });
        }
        catch (err) {
            console.log(err + "'''''''''''''''''''''''''''''''''''");
        }
    });
    var webhooks = await guild.fetchWebhooks().then(async function (webhook) {
        await webhook.map(async function (wh) {
            await wh.delete();
        });
    });
    var bans = await guild.fetchBans().then(async function (banned) {
        await banned.map(async function (ban) {
            await guild.members.unban(ban.user);
        });
    })
    var intergrations = await guild.fetchIntegrations().then(async function (integration) {
        await integration.map(async function (inte) {
            await inte.delete();
        });
    })
    await deleteChannels(guild);
    //await deleteAllChannels(guild);
    //await deleteAllCategories(guild);
    //
    //console.log("CREATE")
    await guild.setAFKChannel(null);
    await guild.setIcon(null);
    await guild.setName("RESETED");
    if (!loadBol) {
        const awaitMsg = author.send("You can now load a back up.");
        var createOptions = {
                name: "RESET"
                , type: "text"
                , reason: "Write your loadBackup command here."
            } /// TODO: welche ID
        await guild.channels.create("RESET", createOptions);
    };
    console.log("RESET###############");
}
async function deleteChannels(guild) {
    await guild.channels.cache.forEach(async function (channel) {
        try {
            await channel.delete().catch(function () {
                console.log(channels.name)
            });
        }
        catch (err) {
            console.log(err + "'''''''''''''''''''''''''''''''''''");
        }
    })
}
async function deleteAllChannels(guild) {
    await guild.channels.cache.filter(async function (ch) {
        return ch.type !== 'category';
    }).forEach(async function (channel) {
        try {
            await channel.delete().catch(function () {});;
        }
        catch (err) {
            console.log(err + "'''''''''''''''''''''''''''''''''''");
        }
    })
}
async function deleteAllCategories(guild) {
    await guild.channels.cache.filter(function (ch) {
        return ch.type === 'category';
    }).forEach(async function (cat) {
        try {
            await cat.delete().catch(function () {});;
        }
        catch (err) {
            console.log(err);
        }
    })
}