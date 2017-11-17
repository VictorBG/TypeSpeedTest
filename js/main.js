var startTime;
var wordsArray;
var currentWord;
var isRunning = false;
var seconds = 0;
var input;
var index = 0;

var wpmContainer;
var cpmContainer;
var timeContainer;

var lastCharCorrect = false;
var lastCharNull = false;

var correctChars;
var incorrectChars;

var totalChars;

var cpm;
var wpm;

$(document).ready(function () {
    generateWords();
});

function generateWords() {

    //loading bar

    index = 0;
    lastCharNull = false;
    lastCharCorrect = false;
    isRunning = false;
    seconds = 0;
    correctChars = 0;
    incorrectChars = 0;
    totalChars = 0;
    startTime = 0;

    //load json
    $.getJSON('http://api.victorblancogarcia.com/typespeedtest/palabras.json', function (data) {
        //generate 500 words randomly
        var resultJson = [];
        for (var i = 0; i < 500; i++) {
            resultJson.push(data[getRandomNumber(5000, 1)]);
        }

        wordsArray = resultJson;

        //Create web

        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        //Words container
        var containerDiv = document.createElement("div");
        containerDiv.setAttribute("id", "words_container");

        document.body.appendChild(containerDiv);

        for (i = 0; i < 500; i++) {
            var spanTag = document.createElement('span');
            spanTag.setAttribute("class", "word");
            spanTag.setAttribute("id", "word_" + i);
            spanTag.innerHTML = resultJson[i] + " ";
            containerDiv.appendChild(spanTag);
        }

        //Info container
        var infoContainer = document.createElement('div');
        infoContainer.setAttribute("id", "infoContainer");

        wpmContainer = document.createElement("div");
        wpmContainer.setAttribute("class", "infoBox");
        wpmContainer.innerHTML = "WPM: 0";

        cpmContainer = document.createElement("div");
        cpmContainer.setAttribute("class", "infoBox");
        cpmContainer.innerHTML = "CPM: 0";

        timeContainer = document.createElement("div");
        timeContainer.setAttribute("class", "infoBox");
        timeContainer.innerHTML = "Tiempo restante: 60s";

        infoContainer.appendChild(wpmContainer);
        infoContainer.appendChild(cpmContainer);
        infoContainer.appendChild(timeContainer);

        document.body.appendChild(infoContainer);

        //Textedit field

        var containerEdit = document.createElement("div");
        containerEdit.setAttribute("class", "divinput");

        input = document.createElement("input");
        input.setAttribute("id", "playlistUrl");
        input.setAttribute("name", "playlistUrl");
        input.setAttribute("type", "text");
        input.setAttribute("placeholder", "Escribe para empezar el test");

        containerEdit.appendChild(input);
        document.body.appendChild(containerEdit);

        $("#playlistUrl").keyup(function (event) {
            onKeyUp(event.which);
        });

    });
}

function onKeyUp(letter) {
    if (!isRunning) {
        isRunning = true;

        currentWord = wordsArray[0];
        handleKey(letter);

        startTime = time();
        interval();

    } else {
        handleKey(letter);
    }
}

function handleKey(letter) {
    if (letter === 32) {
        //calculate correct chars
        var value = input.value;
        value.replace(" ", "");

        for (var o = 0; o < currentWord.length; o++) {
            if (currentWord.charAt(o) === value.charAt(o)) correctChars++;
        }

        console.log("Correct chars: " + correctChars);

        input.value = '';
        input.removeAttribute("placeholder");
        input.setAttribute("placeholder", '');
        totalChars += currentWord.length;

        index++;
        currentWord = wordsArray[index];

        calcSpeed();
    } else {

        var inputValue = input.value;
        var lengthInput = inputValue.length;

        var spanWord = document.getElementById("word_" + index);
        var wordLength = currentWord.length;


        spanWord.innerHTML = '';
        while (spanWord.firstChild) {
            spanWord.removeChild(spanWord.firstChild);
        }

        if (inputValue > wordLength) {
            lastCharNull = inputValue - wordLength;
        } else {
            lastCharNull = 0;
        }

        for (var i = 0; i < wordLength; i++) {
            var a = document.createElement("span");

            if (i >= lengthInput) {
                a.setAttribute("class", "word");
            } else if (currentWord.charAt(i) === inputValue.charAt(i)) {
                a.setAttribute("class", "correct_word");
                lastCharCorrect = true;
            } else {
                lastCharCorrect = false;
                a.setAttribute("class", "wrong_word");
            }

            a.innerHTML = currentWord.charAt(i) + (i + 1 === wordLength ? " " : "");

            spanWord.appendChild(a);
        }
    }
}

function interval() {
    var loopTime = setInterval(function () {
        timeContainer.innerHTML = "Tiempo restante: " + (60 - seconds) + "s";
        if (seconds >= 60) {
            isRunning = false;
            totalChars += currentWord.length;
            console.log("Time ran out\n\nStats:\nWPM: " + wpm + "\nCPM: " + cpm + "\nCorrect chars: " + correctChars + "\nTotal chars: " + totalChars);
            //calcSpeed();
            clearInterval(loopTime);
            generateWords();
        } else {
            seconds++;
        }
    }, 1000);
}


function getRandomNumber(max, min) {
    return Math.floor((Math.random() * max) + min);
}

function calcSpeed() {
    if (!seconds) return;

    cpm = Math.floor(correctChars / seconds * 60);
    wpm = Math.round(cpm / 5);

    wpmContainer.innerHTML = "WPM: " + Math.round(wpm);
    cpmContainer.innerHTML = "CPM: " + cpm;


}

function time() {
    return new Date().getTime();
}


