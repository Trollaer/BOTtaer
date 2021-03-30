exports.loadRoles = loadRoles;
exports.loadBackup = loadBackup;
//*********loadRoles**************
async function loadRoles(guild, backupData) {
    if (!guild.me.hasPermission("ADMINISTRATOR")) {
        return console.log("Need admin permissions.")
    }
    var backupRoles = backupData;
    //console.log(backupRoles);
    var membB = backupRoles.members;
    //console.log(backupRoles.members);
    //var guild = cl.guilds.fetch(backupRoles.guildName);
    //console.log(guild.name + "#########");
    //console.log(guild.members);
    //console.log("START")
    //####################### alle members von backupData in guild.members.cache.find(backupData.members.userid)=> den dann die für jede rolle guildMemers.roles.find(rolename) und dann die adden
    await guild.members.cache.forEach(async function (memb) {
            //console.log(memb.user.name + "************")
            //console.log(memb.roles)
            for (bm in membB) {
                var i = membB[bm];
                if (i.userID === memb.user.id) {
                    //console.log(memb.user.username)
                    var roleB = i.role;
                    //console.log(roleB)
                    for (br in roleB) {
                        var roleRole = roleB[br];
                        //console.log(roleRole)
                        var foundRole = guild.roles.cache.find(function (r) {
                            return r.name === roleRole;
                        });
                        if (foundRole) {
                            //console.log(foundRole.name)
                            if (foundRole.id !== guild.id) {
                                //console.log(foundRole)
                                await memb.roles.add(foundRole);
                            }
                        }
                    }
                }
            }
        })
        //console.log("END off backup")
}
//*********loadBackup**************
async function loadBackup(guild, backupData) {
    //console.log(backupData);
    await configLoad(guild, backupData);
    await rolesLoad(guild, backupData);
    await channelsLoad(guild, backupData);
    await afkLoad(guild, backupData);
    await emojisLoad(guild, backupData);
    await emojisLoad(guild, backupData);
    await bansLoad(guild, backupData);
    await embedChannelLoad(guild, backupData);
}
//####### config ######
async function configLoad(guild, backupData) {
    if (backupData.name) {
        await guild.setName(backupData.name);
    }
    if (backupData.iconBase64) {
        guild.setIcon(Buffer.from(backupData.iconBase64, 'base64'));
    }
    else if (backupData.iconURL) {
        guild.setIcon(backupData.iconURL);
    }
    if (backupData.splashBase64) {
        await guild.setSplash(Buffer.from(backupData.splashBase64, 'base64'));
    }
    else if (backupData.splashURL) {
        await guild.setSplash(backupData.splashURL);
    }
    if (backupData.bannerBase64) {
        await guild.setBanner(Buffer.from(backupData.bannerBase64, 'base64'));
    }
    else if (backupData.bannerURL) {
        await guild.setBanner(backupData.bannerURL);
    }
    if (backupData.region) {
        await guild.setRegion(backupData.region);
    }
    if (backupData.verificationLevel) {
        await guild.setVerificationLevel(backupData.verificationLevel);
    }
    if (backupData.defaultMessageNotifications) {
        await guild.setDefaultMessageNotifications(backupData.defaultMessageNotifications);
    }
    changeableExplicitLevel = await guild.features.includes('COMMUNITY');
    if (backupData.explicitContentFilter && changeableExplicitLevel) {
        await guild.setExplicitContentFilter(backupData.explicitContentFilter);
    }
    console.log("CONFIG");
    return 1;
}
//####### roles ######
async function rolesLoad(guild, backupData) {
    //console.log(backupData.roles);
    if (backupData.roles) {
        await backupData.roles.forEach(async function (roleData) {
            if (roleData.isEveryone) { //////////EVTL     FEHLER      QUELLE
                await guild.roles.cache.get(guild.id).edit({
                    name: roleData.name
                    , color: roleData.color
                    , permissions: roleData.permissions
                    , mentionable: roleData.mentionable
                });
            }
            else {
                await guild.roles.create({
                    // Create the role
                    data: {
                        name: roleData.name
                        , color: roleData.color
                        , hoist: roleData.hoist
                        , permissions: roleData.permissions
                        , mentionable: roleData.mentionable
                    }
                });
            }
        });
    }
    console.log("ROLEs");
    return 1;
}
//####### channels ######
async function channelsLoad(guild, backupData) {
    /*for (i in backupData.channels.categories) {
        var categoryData=backupData.channels.categories[i];
        categoryData.children.forEach(function (channelData) {
            loadChannel(channelData, guild, loadCategory(categoryData, guild)); ////// FUNKTIPONEN
        });
    }*/
    //console.log(backupData.channels);
    if (backupData.channels) {
        if (backupData.channels.categories) {
            await backupData.channels.categories.forEach(async function (categoryData) {
                //console.log("###Category:" + categoryData.name);
                var category = await loadCategory(categoryData, guild);
            });
        }
        if (backupData.channels.others) {
            await backupData.channels.others.forEach(async function (channelData) {
                //console.log(channelData.name);
                await loadChannel(channelData, guild, null);
            });
        }
    }
    console.log("CHANNELS");
    return 1;
}
async function loadChannel(channelData, guild, category) {
    var createOptions, maxBitrate, bitrate;
    createOptions = {
        type: null
        , parent: category
    };
    if (channelData.type === 'text') {
        createOptions.topic = channelData.topic;
        createOptions.nsfw = channelData.nsfw;
        createOptions.rateLimitPerUser = channelData.rateLimitPerUser;
        createOptions.type = channelData.isNews && guild.features.includes('NEWS') ? 'news' : 'text';
    }
    else if (channelData.type === 'voice') {
        maxBitrate = [64000, 128000, 256000, 384000];
        bitrate = channelData.bitrate;
        while (bitrate > maxBitrate[guild.premiumTier]) {
            bitrate = maxBitrate[maxBitrate.indexOf(guild.premiumTier) - 1];
        }
        createOptions.bitrate = bitrate;
        createOptions.userLimit = channelData.userLimit;
        createOptions.type = 'voice';
    }
    var finalPermissions;
    finalPermissions = [];
    await channelData.permissions.forEach(async function (perm) {
        console.log(perm);
        var role = guild.roles.cache.find(async function (r) {
            return r.name === perm.roleName;
        });
        console.log(role.name + " | " + role.id + " # "+channelData.name);
        if (role) {
            finalPermissions.push({
                id: role
                , allow: perm.allow
                , deny: perm.deny
            });
        }
    });
    createOptions.permissionsOverwrites = finalPermissions;
    await guild.channels.create(channelData.name, createOptions).then(async function (channel) {
        /* Load messages */
        if (channelData.type === 'text' && channelData.messages.length > 0) {
            await channel.createWebhook('MessagesBackup', {
                avatar: channel.client.user.displayAvatarURL()
            }).then(async function (webhook) {
                var messages, _i, messages_1, sentMsg;
                messages = channelData.messages.filter(async function (m) {
                    return m.content.length > 0 || m.embeds.length > 0 || m.files.length > 0;
                }).reverse();
                messages = messages.slice(messages.length - 10);
                await messages.forEach(async function (msg) {
                    await webhook.send(msg.content, {
                        username: msg.username
                        , avatarURL: msg.avatar
                        , embeds: msg.embeds
                        , files: msg.files
                    })
                    if (!(msg.pinned && sentMsg)) {
                        await sentMsg.pin()
                    };
                })
                return channel;
            })
        }
        else {
            return channel; // Return the channel
        }
    })
}
async function loadCategory(categoryData, guild) {
    await guild.channels.create(categoryData.name, {
        type: 'category'
    }).then(async function (category) {
        var finalPermissions;
        finalPermissions = [];
        await categoryData.permissions.forEach(async function (perm) {
            var role = guild.roles.cache.find(async function (r) {
                return r.name === perm.roleName;
            });
            if (role) {
                finalPermissions.push({
                    id: role.id
                    , allow: perm.allow
                    , deny: perm.deny
                });
            }
        });
        await category.overwritePermissions(finalPermissions);
        //children from category
        await categoryData.children.forEach(async function (channelData) {
            //console.log("***channel:" + channelData.name);
            await loadChannel(channelData, guild, category); ////// FUNKTIPONEN
        });
        return category;
    })
}
//####### afk ######
async function afkLoad(guild, backupData) {
    if (backupData.afk) {
        await guild.setAFKChannel(guild.channels.cache.find(async function (ch) {
            return ch.name === backupData.afk.name;
        }));
        await guild.setAFKTimeout(backupData.afk.timeout);
    }
    console.log("AFK");
    return 1;
}
//####### emojis ######
async function emojisLoad(guild, backupData) {
    if (backupData.emojis) {
        await backupData.emojis.forEach(async function (emoji) {
            if (emoji.url) {
                await guild.emojis.create(emoji.url, emoji.name).catch(console.error);
            }
            else if (emoji.base64) {
                await guild.emojis.create(Buffer.from(emoji.base64, 'base64'), emoji.name).catch(console.error);
            }
        });
    }
    console.log("EMOJIs");
    return 1;
}
//####### bans ######
async function bansLoad(guild, backupData) {
    if (backupData.bans) {
        await backupData.bans.forEach(async function (ban) {
            await guild.members.ban(ban.id, {
                reason: ban.reason
            });
        });
    }
    console.log("BANs");
    return 1;
}
//####### embedChannel ######
async function embedChannelLoad(guild, backupData) {
    if (backupData.widget) {
        if (backupData.widget.channel) {
            await guild.setWidget({
                enabled: backupData.widget.enabled
                , channel: guild.channels.cache.find(async function (ch) {
                    return ch.name === backupData.widget.channel;
                })
            })
        }
    }
    console.log("EMBEDED");
    return 1;
}