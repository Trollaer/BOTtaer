# TODO:

### BÖT
[prio0]
Server Commands: *serverHosting
- new Host /delete host             (evtl mit password?) bzw dem der in hinzufügt einen code schicken zum wieder löschen
- add/remove server to/from host      (^^ )      vllt online durch string(online,offline,old) wobei old == nicht mehr in gebrauch bzw einfach drinnen lassen
- add/remove to notify list
- list server (nach hosts sortiert)

- !!!!! Alive Ping testen


status Guilds/Channels/lasMSGs in DB (INSERT INTO ... ON DUPLICATE KEY UPDATE
[prio1]
kissKiss command ( category secret) -> play kiss sound + dc

 votekick berechtigung zeitlang nicht joinen lassen
//want to join// vote kick helpf.sendMsg

TEXT in dateien auslagern? (DE/EN) https://github.com/eritislami/evobot/blob/master/locales/en.json
{
in ordner(Language/\[en||de...])https://github.com/eritislami/evobot/blob/master/locales/en.json
dann mit require()
}


[prio2]
* create Teams with split -> create channels (nur die Teams sehen können), wenn command dann wieder alle in channel?

* helpF send umstrukturieren   // nur noch die verwenden (standard als embed) ->entweder complete sonst als description/title/...    //replay -> @ als msg dann embed bzw. als arg ("ats": "@name @n")
->{
time in options;
option.@ -> erwähnungen in MSG nicht in embed;
if msg -> send msg -dann embed (evtl wenn es mit _.startet nicht senden)
}

[prio3]
Beautiful msgs evtl text
backup messages zum großteil done
//IF more than 5 backups with same GUILDID delete älteste
/////args mit 1,2,... statt boolean

//licenses for bot

### Web Server
Web interface :
Owner password schicken -> admins password?  (verschlüsseln)
login dann kann man nur des vom eigenen server sehen
Owner: rolle bei join/ sb / ... einstellen

bei soundboard "zum Server" -> einloggen may be spezielle sounds

execute commands from web (bst commands mit web executable als attr)

//message channel sonst ersten -> id in DB