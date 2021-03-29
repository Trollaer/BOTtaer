var timeOut = false;
//image , footer
//struktur um bauen eine lib mit bildern sounds , server stuff(viewsjs) , bot Js (backup,helpf,music) 
// events
// app paths => eigenen dateien https://github.com/ZerioDev/Music-bot/blob/master/index.js
function init() {
    if (localStorage.getItem("MODE") === "light") {
        setLight();
        $("#modeSwitch").prop("checked", false);
    }
    else {
        setDark();
    }
    //const fs = require("fs");
    loadSounds();
    // sounds hin zu fügen
}

function switchMode() {
    if (localStorage.getItem("MODE") === "light") {
        setDark();
    }
    else if (localStorage.getItem("MODE") === "dark") {
        localStorage.setItem("MODE", "light");
        $(".main").addClass("bg-light text-dark").removeClass("bg-dark text-light");
    }
}

function setDark() {
    localStorage.setItem("MODE", "dark");
    $(".main").addClass("bg-dark text-light").removeClass("bg-light text-dark");
}

function setLight() {
    localStorage.setItem("MODE", "light");
    $(".main").addClass("bg-light text-dark").removeClass("bg-dark text-light");
}
async function loadSounds() {
    $.ajax({
        url: "/soundboard/getSounds"
        , dataType: "json"
        , success: setSounds
        , error: errorLoading
    });
    //für jeden sound
    ///sound hinzufügen (button mit random color)
    //add click method click("datei path of sound", postFKt)
}

function setSounds(data) {
    console.log(data)
    var soundList = [];
    var i = 0;
    data.forEach(folder => {
        i++;
        var name = folder.folderName.split("_")[1];
        if (!name) name = folder.folderName;
        soundList.push("<div class='container mt-3'>")
        soundList.push("<button class='btn btn-block text-light' style='background-color:#144584' data-toggle='collapse' data-target='#collapseBtns" + i + "'>" + name + "</button>");
        soundList.push("<div class='collapse mt-2 row justify-content-center' id='collapseBtns" + i + "'>");
        folder.files.forEach(sound => {
            var s = sound.split(".");
            s = s[0];
            soundList.push(`<button class="btn btn-outline-dark btn-sm rColor" onClick="playSound(this)" data-value="${folder.folderName}/${sound}"> ${s} </button>`)
        })
        soundList.push("</div>");
        soundList.push("</div>");
    })
    $("#sounds").append(soundList.join(""))
    $('.rColor').each(function () {
        var hue = 'rgb(' + (Math.floor((257 - 70) * Math.random()) + 71) + ',' + (Math.floor((257 - 70) * Math.random()) + 71) + ',' + (Math.floor((257 - 70) * Math.random()) + 71) + ')';
        $(this).css("background-color", hue);
    });
}
//post
function playSound(button) {
    if (timeOut) {
        alert("Time out!\nDon't spam.")
        return;
    }
    timeOut = true;
    var guildID = $("#idfield").text();
    console.log(guildID + "hallo")
    console.log("playing " + button.dataset.value)
    $.ajax({
        url: "/soundboard/requestPlay/" + guildID + "/" + button.dataset.value
        , dataType: "json"
        , success: function (data) {
            timeOut = false;
            if (data.error) {
                alert(data.error);
            }
            console.log(data);
        }
        , error: function (request, status, error) {
            timeOut = false;
            if (error) {
                alert(error)
            }
            else {
                alert("AHHHHHHHH")
            }
        }
    });
}

function timeOutFkt() {
    setTimeout(function () {
        timeOut = false;
    }, 10000)
}

function errorLoading() {
    alert("Failed to load data!")
}