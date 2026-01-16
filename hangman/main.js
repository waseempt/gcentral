const theWord = words[Math.floor(Math.random() * words.length)].toUpperCase();
console.log(theWord)

const wordArray = theWord.split("");
const guesses = [];
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let gameover = false;

const wordDiv = document.querySelector(".word-display");

const keyboardDiv = document.querySelector(".alphabet-container");

const wrongSpan = document.querySelector('.wrong-count');

let wrongCount = wrongSpan.innerHTML;

const hangMan = document.querySelectorAll('.hangman-part');

const messageDiv = document.querySelector('.game-status');

const button = document.querySelector('.new-game-btn');

const correctWord = document.querySelector('.correct-word');

function renderGuesses(){
    wrongSpan.innerHTML = guesses.filter(guess => !wordArray.includes(guess)).length;
    console.log(`wrongSpan.innerHTML: ${wrongSpan.innerHTML}`);
    wrongCount = wrongSpan.innerHTML;
    console.log(`wrongCount: ${wrongCount}`);
}

function renderHangMan(){
    for(i = 0; i < wrongCount; i++){
        hangMan[i].classList.add('revealed');
        console.log(`hangman part ${i} part class: ${hangMan[i].classList}`);
    }
}

function renderWord(){
    wordDiv.innerHTML = wordArray.map(letter =>
        `<span class="word-letter">${guesses.includes(letter) ? letter : "_"}</span>`
    ).join("");
    console.log(wordArray);
    console.log(`wordDiv: ${wordDiv.innerHTML}`);
}

function renderKeyboard(){
    keyboardDiv.innerHTML = letters.split("").map(letter =>
        `<button class="letter-btn ${guesses.includes(letter) ? "disabled" : ""} ${guesses.includes(letter) ? (!wordArray.includes(letter) ? "incorrect" : "correct") : ""}">${letter}</button>`
    ).join("");
}

renderGuesses();
renderHangMan();
renderWord();
renderKeyboard();
button.addEventListener("click", function(){
    location.reload();
});

keyboardDiv.addEventListener("click", function(e){
    if(e.target.matches("button") && !gameover){
        let letter = e.target.innerHTML;
        guesses.push(letter);
        console.log(guesses);
        renderGuesses();
        renderHangMan();
        renderWord();
        renderKeyboard();

        if(wordArray.every(letter => guesses.includes(letter))){
            gameover = true;
            console.log("game won");
            messageDiv.classList.add("game-won");
        }
        
        if(wrongCount >= 6){
            gameover = true;
            console.log("game lost");
            messageDiv.classList.add("game-lost");
            correctWord.innerHTML = theWord;
        }
    }
    });
