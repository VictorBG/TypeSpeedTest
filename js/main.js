var randomWords = $("#random_words");

$(document).ready(function () {
    generateWords();
});

function generateWords() {

    //loading bar

    //load json
    $.getJSON('http://api.victorblancogarcia.com/typespeedtest/palabras.json', function (data) {
        //generate 500 words randomly
        var randomWords = $("#random_words");

        var resultJson = "";
        for (var i = 0; i < 500; i++) {
            resultJson += (i === 0 ? "" : " ") + (data[getRandomNumber(5000, 1)])
        }

        console.log(resultJson);
        //show result words
        randomWords.text(resultJson);

    });
}

function getRandomNumber(max, min) {
    return Math.floor((Math.random() * max) + min);
}


