const titleScreen = document.getElementById('title-screen');
const cardScreen = document.getElementById('card-screen');
const resultScreen = document.getElementById('result-screen');
const english = document.getElementById('english');
const japanese = document.getElementById('japanese');
const knownButton = document.getElementById('known');
const unknownButton = document.getElementById('unknown');
const prevButton = document.getElementById('prev');
const returnTitleCardButton = document.getElementById("return-title-card");
const retryButton = document.getElementById('retry-button');
const retryIncorrectButton = document.getElementById('retry-incorrect-button');
const correctCountDisplay = document.getElementById('correct-count');
const correctPercentageDisplay = document.getElementById('correct-percentage');
const totalCountDisplay = document.getElementById('total-count');
const englishArea = document.getElementById("english-area");
const japaneseArea = document.getElementById("japanese-area");
const navigation = document.getElementById("navigation");
const progressDisplay = document.getElementById("progress");
const returnTitleButton = document.getElementById("return-title");
const rangeButtons = document.getElementById('range-buttons');
const setButtonContainer = document.getElementById('set-button-container');

let currentWordIndex = 0;
let buttonClicked = false;
let currentWords = [];
let correctCount = 0;
let incorrectWords = [];
let totalCount = 0;

let words = [];

async function loadWords() {
    try {
        const response = await fetch('words.json');
        words = await response.json();
    } catch (error) {
        console.error('単語データの読み込みに失敗しました:', error);
    }
}

loadWords();

rangeButtons.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        let start, end;
        switch (event.target.id) {
            case 'range-1-800':
                start = 0;
                end = 800;
                break;
            case 'range-801-1600':
                start = 800;
                end = 1600;
                break;
            case 'range-1601-2176':
                start = 1600;
                end = words.length;
                break;
        }
        generateSetButtons(start, end);
        rangeButtons.style.display = 'none';
        setButtonContainer.style.display = 'block';
    }
});

function generateSetButtons(startIndex, endIndex) {
    setButtonContainer.innerHTML = '';
    const wordsPerPage = 20;
    const pageCount = Math.ceil((endIndex - startIndex) / wordsPerPage);

    setButtonContainer.classList.add('button-grid');

    for (let i = 0; i < pageCount; i++) {
        const start = startIndex + i * wordsPerPage;
        const end = Math.min(startIndex + (i + 1) * wordsPerPage, endIndex);
        const button = document.createElement("button");
        button.textContent = `${start + 1}-${end}`;
        button.addEventListener('click', () => {
            startLearning(start, end);
        });
        setButtonContainer.appendChild(button);
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startLearning(startIndex, endIndex) {
    titleScreen.style.display = 'none';
    cardScreen.style.display = 'block';
    selectWords(startIndex, endIndex);

    shuffle(currentWords);

    currentWordIndex = 0;
    correctCount = 0;
    incorrectWords = [];
    totalCount = currentWords.length;
    buttonClicked = false;
    showWord();
}

function selectWords(startIndex, endIndex) {
    const selectedWords = words.slice(startIndex, endIndex);
    currentWords = [...selectedWords];
}

function showWord() {
    const word = currentWords[currentWordIndex];
    english.textContent = word.english;
    japanese.textContent = word.japanese;
    japaneseArea.style.display = 'none';
    navigation.style.display = 'none'; // ボタンを非表示にする
    if (currentWordIndex === 0) {
        prevButton.style.display = 'none';
    } else {
        prevButton.style.display = 'inline-block';
    }
    adjustFontSize();
    updateProgress();
    buttonClicked = false;
    setTimeout(showJapanese, 1500); // 2秒後にshowJapaneseを呼び出す
}

function showJapanese() {
    japaneseArea.style.display = 'block';
    navigation.style.display = 'block'; // ボタンを表示する
    buttonClicked = true;
}

function showResult() {
    cardScreen.style.display = 'none';
    resultScreen.style.display = 'block';
    correctCountDisplay.textContent = correctCount;
    totalCountDisplay.textContent = totalCount;
    correctPercentageDisplay.textContent = Math.round((correctCount / totalCount) * 100);
}

function updateProgress() {
    progressDisplay.textContent = `${currentWordIndex + 1}/${currentWords.length}`;
}

function adjustFontSize() {
    const containerWidth = englishArea.clientWidth - 20;

    english.style.fontSize = '4em';

    const wordWidth = english.scrollWidth;

    if (wordWidth > containerWidth) {
        const ratio = containerWidth / wordWidth;
        const newFontSize = Math.max(ratio * 4, 0.8);
        english.style.fontSize = newFontSize + 'em';
    }

    const englishHeight = english.offsetHeight;
    japaneseArea.style.top = (200 + englishHeight + 20) + 'px';

    navigation.style.top = (japaneseArea.offsetTop + japaneseArea.offsetHeight + 20) + 'px';
}

function nextWord(isKnown) { // 知っているか知らないかの情報を引数に追加
    if (isKnown) {
        correctCount++;
    } else {
        incorrectWords.push(currentWords[currentWordIndex]);
    }
    currentWordIndex++;
    if (currentWordIndex < currentWords.length) {
        showWord();
    } else {
        showResult();
    }
}

knownButton.addEventListener('click', () => {
    nextWord(true); // 知っている
});

unknownButton.addEventListener('click', () => {
    nextWord(false); // 知らない
});

prevButton.addEventListener('click', () => {
    currentWordIndex--;
    if (currentWordIndex < 0) {
        currentWordIndex = 0;
    }
    showWord();
    buttonClicked = false;
});

returnTitleButton.addEventListener('click', () => {
    titleScreen.style.display = 'block';
    cardScreen.style.display = 'none';
    resultScreen.style.display = 'none';
    rangeButtons.style.display = 'block';
    setButtonContainer.style.display = 'none';
});

retryButton.addEventListener('click', () => {
    cardScreen.style.display = 'block';
    resultScreen.style.display = 'none';
    currentWordIndex = 0;
    correctCount = 0;
    incorrectWords = [];
    totalCount = currentWords.length;
    showWord();
});

retryIncorrectButton.addEventListener('click', () => {
    if (incorrectWords.length === 0) {
        const message = "不正解の単語はありません。";
        const messageElement = document.createElement("p");
        messageElement.textContent = message;
        resultScreen.appendChild(messageElement);
        setTimeout(() => resultScreen.removeChild(messageElement), 3000);
        return;
    }
    cardScreen.style.display = 'block';
    resultScreen.style.display = 'none';
    currentWords = [...incorrectWords];
    currentWordIndex = 0;
    correctCount = 0;
    totalCount = currentWords.length;
    showWord();
});

returnTitleCardButton.addEventListener('click', () => {
    titleScreen.style.display = 'block';
    cardScreen.style.display = 'none';
    rangeButtons.style.display = 'block';
    setButtonContainer.style.display = 'none';
});