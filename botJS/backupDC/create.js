exports.createBackup = createBackup;
exports.backupRoles = backupRoles;
//******rolesBackup********
async function backupRoles(guild) {
    var data = {
        guildName: guild.id
        , backupID: null
        , members: []
    }
    var firstM = true;
    await guild.members.cache.forEach(u => {
        var memberData;
        if (!u.user.bot) {
            memberData = {
                userID: u.user.id
                , role: []
            }
            u.roles.cache.forEach(r => {
                if (r.name !== '@everyone'&&r.name !== 'BOTtaer' && r.id!==guild.id) {
                    memberData.role.push(r.name);
                }
            })
            data.members.push(memberData)
        }
    })
    return data;
    //console.log(jsonString);
}
//******serverBackup********
function createBackup(guild) {
    var backupData = {
        backupID: null
        , maxMessagesPerChannel: 10
        , data: {
            name: guild.name
            , region: guild.region
            , verificationLevel: guild.verificationLevel
            , explicitContentFilter: guild.explicitContentFilter
            , defaultMessageNotifications: guild.defaultMessageNotifications
            , afk: guild.afkChannel ? {
                name: guild.afkChannel.name
                , timeout: guild.afkTimeout
            } : null
            , widget: {
                enabled: guild.widgetEnabled
                , channel: guild.widgetChannel ? guild.widgetChannel.name : null
            }
            , channels: {
                categories: []
                , others: []
            }
            , roles: getRoles(guild)
            , bans: getBans(guild)
            , emojis: getEmojis(guild)
            , createdTimestamp: Date.now()
            , guildID: guild.id
        }
    }
    if (guild.iconURL()){
        backupData.iconURL = guild.iconURL();
    }
    var backupChannelData = getChannels(guild);
    backupData.data.channels.categories = backupChannelData.categories;
    backupData.data.channels.others = backupChannelData.others;
    return backupData;
}

function getRoles(guild) {
    var roles;
    roles = [];
    var roleArray = guild.roles.cache.sort(function (a, b) {
        return b.position - a.position;
    }).values();
    roleArray.forEach(function (role) {
        if (role.name !== "BOTtaer") {
            var roleData = {
                name: role.name
                , color: role.hexColor
                , hoist: role.hoist
                , permissions: role.permissions.bitfield
                , mentionable: role.mentionable
                , position: role.position
                , isEveryone: guild.id === role.id
            };
            roles.push(roleData);
        }
    });
    return roles;
}

function getBans(guild) {
    var bans = []
        , cases;
    cases = guild.fetchBans().then(banned => {
            banned.map(user => {
                bans.push({
                    id: user.id
                    , reason: user.reason // Ban reason
                }); //element
            }); //MAP
        }) //fetch
    return bans;
}

function getEmojis(guild, options) {
    var emojis;
    emojis = [];
    guild.emojis.cache.forEach(function (emoji) {
        var eData;
        eData = {
            name: emoji.name
            , url: emoji.url
        };
        emojis.push(eData);
    });
    return emojis;
}
// channels
function fetchChannelPermissions(channel) {
    var permissions = [];
    channel.permissionOverwrites.filter(function (p) {
        return p.type === 'role';
    }).forEach(function (perm) {
        // For each overwrites permission
        var role = channel.guild.roles.cache.get(perm.id);
        if (role) {
            permissions.push({
                roleName: role.name
                , allow: perm.allow.bitfield
                , deny: perm.deny.bitfield
            });
        }
    });
    return permissions;
}

function fetchTextChannelData(channel) {
    var channelData, messageCount, fetchComplete, fetched;
    channelData = {
        type: 'text'
        , name: channel.name
        , nsfwLevel: channel.nsfwLevel
        , rateLimitPerUser: channel.type === 'GUILD_TEXT' ? channel.rateLimitPerUser : undefined
        , parent: channel.parent ? channel.parent.name : null
        , topic: channel.topic
        , permissions: fetchChannelPermissions(channel)
        , messages: []
        , isNews: channel.type === 'GUILD_NEWS'
    };
    fetched = channel.messages.fetch({
        limit: 10
    }).then(msg => {
        if (!msg.author || channelData.messages.length >= messageCount) {
            fetchComplete = true;
            return;
        }
        channelData.messages.push({
            username: msg.author.username
            , avatar: msg.author.displayAvatarURL()
            , content: msg.cleanContent
            , embeds: msg.embeds
            , files: msg.attachments.map(function (a) {
                return {
                    name: a.name
                    , attachment: a.url
                };
            })
            , pinned: msg.pinned
        });
    });
    return channelData;
}

function fetchVoiceChannelData(channel) {
    var channelData;
    channelData = {
        type: 'voice'
        , name: channel.name
        , bitrate: channel.bitrate
        , userLimit: channel.userLimit
        , parent: channel.parent ? channel.parent.name : null
        , permissions: fetchChannelPermissions(channel)
    };
    /* Return channel data */
    return channelData;
}

function getChannels(guild) {
    var channels, categories, _i, categories_1, category, categoryData, children, _a, children_1, channelData, channelData, others, _b, others_1, channel, channelData, channelData;
    channels = {
        categories: []
        , others: []
    };
    //alle categories
    categories = guild.channels.cache.filter(function (ch) {
        return ch.type === 'GUILD_CATEGORY';
    }).values();
    categories.forEach(cat => {
        categoryData = {
            name: cat.name
            , permissions: fetchChannelPermissions(cat)
            , children: [] // The children channels of the category
        };
        children = cat.children.sort(function (a, b) {
            return a.position - b.position;
        }).values();
        children.forEach(child => {
            if ((child.type === 'GUILD_TEXT' || child.type === 'GUILD_NEWS')) {
                categoryData.children.push(fetchTextChannelData(child));
            }
            else if (child.type === 'voice') {
                categoryData.children.push(fetchVoiceChannelData(child));
            }
        })
        channels.categories.push(categoryData);
    });
    others = guild.channels.cache.filter(function (ch) {
        return !ch.parent && ch.type !== 'GUILD_CATEGORY';
    }).sort(function (a, b) {
        return a.position - b.position;
    }).values();
    others.forEach(o => {
        if ((o.type === 'GUILD_TEXT' || o.type === 'GUILD_NEWS')) {
            channels.others.push(fetchTextChannelData(o));
        }
        else if (o.type === 'GUILD_VOICE') {
            channels.others.push(fetchVoiceChannelData(o));
        }
    })
    return channels;
}