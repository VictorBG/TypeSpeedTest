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

var dialog;

var actualLine = 0;
var lastIndexLines = [];

var heightWord = 0;

var lastValue = "";

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
    $.getJSON('https://victorblancogarcia.com/proyectos/typespeedtest/palabras.json', function (data) {
        //generate 500 words randomly
        var resultJson = [];
        for (var i = 0; i < 750; i++) {
            resultJson.push(data[getRandomNumber(8999, 1)]);
        }

        wordsArray = resultJson;

        //Create web

        dialog = document.querySelector("dialog");

        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        //Words container
        var containerDiv = document.createElement("div");
        containerDiv.setAttribute("id", "words_container");

        document.body.appendChild(containerDiv);

        var containerWidth = containerDiv.offsetWidth;
        var lineWidth = 0;

        for (i = 0; i < 750; i++) {
            var spanTag = document.createElement('span');
            spanTag.setAttribute("class", "word");
            spanTag.setAttribute("id", "word_" + i);
            spanTag.innerHTML = resultJson[i] + " ";
            containerDiv.appendChild(spanTag);

            if (heightWord === 0) heightWord = spanTag.offsetHeight;

            var elementWidth = spanTag.offsetWidth;

            if (lineWidth + elementWidth > containerWidth) {
                lineWidth = elementWidth;
                lastIndexLines.push(i);
            } else {
                lineWidth += elementWidth;
            }
        }

        for (i = 0; i < 750; i++) {

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
        document.body.appendChild(dialog);

        var moreInfoBox = document.createElement("div");
        moreInfoBox.setAttribute("class", "moreInfoBox");
        moreInfoBox.innerHTML = "Pulsa espacio para cambiar de palabra<br><br><strong>WPM:</strong> Words per minute<br><strong>CPM:</strong> Chars per minute";

        document.body.appendChild(moreInfoBox);

        if (!dialog.showModal) {
            dialogPolyfill.registerDialog(dialog);
        }

        $("#playlistUrl").keyup(function (event) {
            onKeyUp(event.which);
        });

    });
}

function onKeyUp(letter) {
    if (!isRunning) {
        isRunning = true;

        var span = document.getElementById("word_" + index);
        span.setAttribute("class", "current_word");

        currentWord = wordsArray[0];
        handleKey(letter);

        startTime = time();
        interval();

    } else {
        handleKey(letter);
    }
}

function moveLine() {
    actualLine++;
    $('#words_container').animate({scrollTop: (actualLine - 1) * 66}, 500);
}

function calcLine() {
    if (actualLine === 0 && index <= lastIndexLines[0]) return;
    else if (actualLine === 0 && index > lastIndexLines[0]) actualLine = 1;
    if (index >= lastIndexLines[actualLine]) {
        moveLine();
    }
}

function handleKey(letter) {
    if (letter === 32) {
        //calculate correct chars
        var value = input.value;
        value = value.replace(/ /g, '');

        //Hotfix to prevent the key being erased if the keyboard send the key before the space
        if (value.length - 1 === currentWord.length && value.charAt(value.length - 1) === wordsArray[index + 1].charAt(0)) {
            input.value = value.charAt(value.length - 1);
        } else {
            input.value = '';
        }


        for (var o = 0; o < currentWord.length; o++) {
            if (currentWord.charAt(o) === value.charAt(o)) correctChars++;
        }


        input.removeAttribute("placeholder");
        input.setAttribute("placeholder", '');
        totalChars += currentWord.length;

        var span = document.getElementById("word_" + index);
        span.setAttribute("class", "word");
        index++;
        currentWord = wordsArray[index];

        var currentSpan = document.getElementById("word_" + index);
        currentSpan.setAttribute("class", "current_word");

        calcSpeed();

        calcLine();
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
        timeContainer.innerHTML = "<strong>Tiempo restante:</strong> " + (60 - seconds) + "s";
        if (seconds >= 60) {
            isRunning = false;
            totalChars += currentWord.length;

            calcSpeed();

            dialog.showModal();
            dialog.querySelector('button').addEventListener('click', function () {
                dialog.close();
                generateWords();
            });

            var wpmResult = document.getElementById("wpm_result");
            wpmResult.innerHTML = Math.round(wpm);

            var cpmResult = document.getElementById("cpm_result");
            cpmResult.innerHTML = cpm;

            clearInterval(loopTime);

        } else {
            calcSpeed();
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

    wpmContainer.innerHTML = "<strong>WPM:</strong> " + Math.round(wpm);
    cpmContainer.innerHTML = "<strong>CPM:</strong> " + cpm;


}

function time() {
    return new Date().getTime();
}


