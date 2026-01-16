import { stations , lines } from './data.js';

//Data
const rulesBtnMenu = document.querySelector('#rulesbtnm');
const rulesDivMenu = document.querySelector('#rulesdivm');
const rulesDivGame = document.querySelector('#rulesdivg');

rulesBtnMenu.addEventListener('click', () => {
    rulesDivMenu.classList.toggle('hidden');
});

const startBtn = document.querySelector('#startbtn');
const menuDiv = document.querySelector('#menudiv');
const gameDiv = document.querySelector('#gamediv');
const gameplayDiv = document.querySelector('#gameplaydiv');
const gameCanvas = document.querySelector('#mapcanvas');
const ctx = gameCanvas.getContext('2d');
const grid = document.querySelector('#mapgrid');
const cardCount = document.querySelector('#cardcount');
const cardImg = document.querySelector('#cardimg');
const cardBack = document.querySelector('#cardback');
const playerName = document.querySelector('#playername');
const nameField = document.querySelector('#namefield');
const timer = document.querySelector('#timer');
const roundText = document.querySelector('#roundtext');
const railwayProgress = document.querySelector('#railwayprogress');
const railwayScore = document.querySelector('#railwayscore');
const errorMessage = document.querySelector('#errormessage');
const rightPanel = document.querySelector('#rightpanel');
const leftPanel = document.querySelector('#leftpanel');
const liveScoreTable =  document.querySelector('#livescoretable');
const highScoresTableM = document.querySelector('#highscoresm');
const tryAgainBtn = document.querySelector('#tryagainbtn');
const backHomeBtn = document.querySelector('#backbtn')


let gameover = false;

let currentCard = null;
let cardcount = 0;
let cards = ['a', 'b', 'c', 'd', 'j', 'a', 'b', 'c', 'd', 'j'];
let cardIndex = 0;

let lineIndex = 0;
let lineIDs = [0,1,2,3];
let currentLineID = lineIDs[lineIndex];
let currentLine = lines.find(l => l.id === currentLineID);

let crossedCells = [];

let roundcount = 0;

let endpoint1 = null;
let endpoint2 = null;
let allowedToDraw = false;

let segments =[];
const railwayStationScale = [ 0, 1, 2, 4, 6, 8, 11, 14, 17, 21, 25];
let railwayCounter = 0;
let scores = [];
let finalScore = 0;
let highScores = [];

let junctions = [];
for (let i = 0; i < stations.length; i++){
    junctions.push({id: stations[i].id, count: 0});
}

let time = 0;

//Renders invisible grid 
function renderGrid() {
    for (let y = 0; y < 10; y++) {
        const row = document.createElement('tr');
        for (let x = 0; x < 10; x++) {
            const cell = document.createElement('td');
            cell.id = `cell-${x}-${y}`;
            cell.classList.add('grid-cell');
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.dataset.station = false;
            const station = stations.find(s => s.x === x && s.y === y);
            if (station) {
                cell.dataset.station = true;
                cell.dataset.train = station.train;
                cell.dataset.type = station.type;
                cell.dataset.id = station.id;
            }
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
}

//Renders High Scores table on menu screen
function renderHScoresTable() {
    if(localStorage.length > 0){
        for (let i = 0; i < localStorage.length; i++){
            let LSkey = localStorage.key(i);

            if (!LSkey.startsWith('gcentral:SOB:'))
                continue;

            let LSdata = JSON.parse(localStorage.getItem(LSkey));
            highScores.push(LSdata);

        }

        if (highScores.length === 0)
            return;

        highScores.sort((a,b) => b.highscore - a.highscore);

        const hsheader = document.createElement('tr');
        const hsrank = document.createElement('td');
        hsrank.innerText = "Rank";
        hsrank.style.fontWeight = "bold";

        const hsname = document.createElement('td');
        hsname.innerText = "Player Name";
        hsname.style.fontWeight = "bold";

        const hstime = document.createElement('td');
        hstime.innerText = "Time";
        hstime.style.fontWeight = "bold";

        const hsscore = document.createElement('td');
        hsscore.innerText = "Highest Score";
        hsscore.style.fontWeight = "bold";

        hsheader.appendChild(hsrank);
        hsheader.appendChild(hsname);
        hsheader.appendChild(hstime);
        hsheader.appendChild(hsscore);

        highScoresTableM.appendChild(hsheader);

        for (let i = 0; i < highScores.length; i++) {
            const s = highScores[i];
            const tableRow = document.createElement('tr');
            const trank = document.createElement('td');
            const tname = document.createElement('td');
            const ttime = document.createElement('td');
            const tscore = document.createElement('td');


            trank.innerText = i+1;
            tname.innerText = s.name;
            tscore.innerText = s.highscore;
            ttime.innerText = `${String(Math.floor(s.time / 60)).padStart(2, '0')}:${String(s.time % 60).padStart(2, '0')}`;

            tableRow.appendChild(trank);
            tableRow.appendChild(tname);
            tableRow.appendChild(ttime);
            tableRow.appendChild(tscore);

            highScoresTableM.appendChild(tableRow);
        }
    }
}


//Renders live scoring table on game screen
function renderScoreTable() {
    liveScoreTable.innerHTML = '';
    for(let tround = 0; tround < scores.length; tround++){
        let trow = document.createElement('tr');
        let troundNum = document.createElement('td');
        let tscore = document.createElement('td');
        tscore.innerText = scores[tround];
        tscore.classList.add('tablescore');

        troundNum.innerText = `Round ${tround + 1}`;
        troundNum.classList.add('tableround');

        trow.appendChild(troundNum);
        trow.appendChild(tscore);
        liveScoreTable.appendChild(trow);
        console.log(`row ${tround + 1} rendered`);
    }
}

//initialize
renderGrid();
renderHScoresTable();

//Start button hides the menu and shows the game screen
startBtn.addEventListener('click', () => {
    menuDiv.classList.add('hidden');
    gameDiv.classList.remove('hidden');
    gameplayDiv.classList.remove('hidden');
    rulesDivGame.classList.remove('hidden');
    gameplayDiv.classList.add('flexrow');
    gameDiv.classList.add('flexcol');
    setInterval(() => {
        if (!gameover){
            time++;
            timer.innerText = `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`;
        }
    }, 1000);
    startGame();
});

//Back button reloads to go back home
backHomeBtn.addEventListener('click', () => {
    location.reload();
});

//Try again button restarts game with same username
tryAgainBtn.addEventListener('click', () => {
    ctx.clearRect(0,0,2000,2000);
    gameover = false;
    currentCard = null;
    cardIndex = 0;
    crossedCells = []
    roundcount = 0;
    lineIDs = [0,1,2,3];
    endpoint1 = null;
    endpoint2 = null;
    allowedToDraw = false;
    segments = [];
    railwayCounter = 0;
    railwayProgress.value = 0;
    railwayScore.innerText = '0 Points'
    scores = [];
    finalScore = 0;
    highScores = 0;
    cardImg.src = `media/drawcard.png`;

    junctions = [];
    for (let i = 0; i < stations.length; i++){
        junctions.push({id: stations[i].id, count: 0});
    }

    renderScoreTable();

    time = 0;
    selectedStation = null;

    startGame();
});

//Display name, or Player 1 if no name is entered
function startGame() {
    playerName.innerText = nameField.value || "Player 1";

    newRound();
}

//Called every new round, restacks the cards, random new line, selects starting station.
function newRound() {
    roundcount++;
    segments.push([]);
    cardcount = 0;
    if (roundcount > 1){
        cardcount++;
    }
    cards = ['a', 'b', 'c', 'd', 'j', 'a', 'b', 'c', 'd', 'j'];

    selectedStation = null;
    let selectedCell = document.querySelector('.selected-station');
    selectedCell?.classList.remove('selected-station');


    lineIndex = Math.floor(Math.random() * lineIDs.length);
    currentLineID = lineIDs[lineIndex];
    lineIDs.splice(lineIndex, 1);
    currentLine = lines.find(l => l.id === currentLineID);
    rightPanel.style.backgroundColor = currentLine.color;
    leftPanel.style.backgroundColor = currentLine.color;
    endpoint1 = stations.find(s => s.id === currentLine.start);
    junctions.find(s => s.id == endpoint1.id).count += 1;
    endpoint2 = null;
    roundText.innerText = `Round ${roundcount}: ${currentLine.name}`;

    selectedStation = endpoint1;
    selectedCell = document.querySelector(`#cell-${selectedStation.x}-${selectedStation.y}`);
    selectedCell.classList.add('selected-station');
}

//Allows user to draw on canvas after calling, removes drawn card from deck
function drawCard() {
    cardcount++;
    if (cardcount >8) {
        calculateScoreForRound();
        if (roundcount === 4) {
            calculateFinalScore();
            return;
        }
        newRound();
    }
    allowedToDraw = true;
    cardIndex = Math.floor(Math.random() * cards.length);
    cardImg.src = `media/card${cards[cardIndex]}.png`;
    cardCount.innerText = `${cardcount}/8`;
    currentCard = cards[cardIndex];
    cards.splice(cardIndex, 1);
    console.log(`Drew card: ${currentCard} cardcount: ${cardcount}`);
    console.log(cards);
}

//Event listener on the back of card deck
cardBack.addEventListener('click', () => {
    if (gameover)
        return;
    drawCard();
});

let selectedStation = null;

//Main event listener on the grid, responsible for handling any type of click on the grid and drawing on the canvas.
grid.addEventListener('click', (e) => {
    if (gameover)
        return;
    
    const cell = e.target;
    errorMessage.innerHTML = '';
    if (cell.dataset.station === 'false') {
        selectedStation = null;
        const selectedCell = document.querySelector('.selected-station');
        selectedCell?.classList.remove('selected-station');
        return;
    }
    if (currentCard === null || allowedToDraw === false) {
        errorMessage.innerHTML = "Please draw a new card first!";
        return;
    }
    if ((endpoint1.id === parseInt(cell.dataset.id) || (endpoint2 && endpoint2.id === parseInt(cell.dataset.id)))) {
        const prevSelectedCell = document.querySelector('.selected-station');
        prevSelectedCell?.classList.remove('selected-station');

        selectedStation = stations.find(s => s.id === parseInt(cell.dataset.id));
        cell.classList.add('selected-station');
        return;
    }
    if ((currentCard === cell.dataset.type.toLowerCase() || currentCard === 'j'|| cell.dataset.type === '?') && validMove(selectedStation, stations.find(s => s.id === parseInt(cell.dataset.id)))) {

        const station1 = selectedStation;
        const station2 = stations.find(s => s.id === parseInt(cell.dataset.id));
        ctx.strokeStyle = currentLine.color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.8;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(station1.x * 78 + 39, station1.y * 78 + 39);
        ctx.lineTo(station2.x * 78 + 39, station2.y * 78 + 39);
        ctx.stroke();

        updateCrossedCells(station1, station2);

        junctions.find(s => s.id == station2.id).count += 1;

        segments[roundcount - 1].push({lineID: currentLineID, from: station1, to: station2});
        console.log(segments);

        if (roundcount === 4 && cardCount.innerText === '8/8') {
            calculateScoreForRound();
            calculateFinalScore();
        }

        if (station2.train) {
            railwayCounter++;
            railwayProgress.value = railwayStationScale[railwayCounter];
            railwayScore.innerText = `${railwayStationScale[railwayCounter]} Points`;
            console.log(`Touched railway station! Total touched: ${railwayCounter}`);
        }

        if ((endpoint1 === selectedStation && endpoint2 === null) || endpoint2 && endpoint2 === selectedStation) {
            endpoint2 = station2;
            console.log(`Endpoint2 set to station ID: ${station2.id}`);
        } else {
            endpoint1 = station2;
            console.log(`Endpoint1 set to station ID: ${station2.id}`);
        }

        selectedStation = null;
        const selectedCell = document.querySelector('.selected-station');
        selectedCell?.classList.remove('selected-station');
        allowedToDraw = false;
        console.log('selectedStation reset to null');
    }
});

//Checks if a move is valid according to rules stated.
function validMove(station1, station2) {
    if (segments[roundcount - 1].find(s => s.from.id === station2.id || s.to.id === station2.id)) {
        errorMessage.innerHTML = "You have already connected to this station in this round!";
        return false;
    }

    const sameSegment = segments.find(l => l.find(seg => (seg.from.id === station1.id && seg.to.id === station2.id) || (seg.from.id === station2.id && seg.to.id === station1.id)));
    if (sameSegment) {
        errorMessage.innerHTML = "These two stations are already connected!";
        return false;
    }
    const dx = Math.abs(station1.x - station2.x);
    const dy = Math.abs(station1.y - station2.y);

    return (dx === dy || dx === 0 || dy === 0) && (dx > 0 || dy > 0) && canBeDrawn(station1, station2);
}

//Checks if any cells in the path requested is crossed
function canBeDrawn(station1, station2) {
    const x1 = station1.x;
    const y1 = station1.y;
    const x2 = station2.x;
    const y2 = station2.y;
    const dx = Math.sign(x2 - x1);
    const dy = Math.sign(y2 - y1);

    let x = x1 + dx;
    let y = y1 + dy;

    while (x !== x2 || y !== y2) {
        const station = stations.find(s => s.x === x && s.y === y);
        if (station || crossedCells.includes(`cell-${x}-${y}`)) {
            errorMessage.innerHTML = "You cannot draw through another station or previously crossed cell!";
            return false;
        }
        x += dx;
        y += dy;
    }
    return true;
}

//Calculates total score for this round, adds to scores array
function calculateScoreForRound() {
    const lineSegments = segments[roundcount - 1];
    if (lineSegments.length == 0){
        scores.push(0);
        console.log('score calculated as 0');
        renderScoreTable();
        return;
    }
    let districts = [];
    let districtsForAllStations = [lineSegments[0].from.district];
    let PD = 0;

    lineSegments.forEach(segment => {
        if (!districts.includes(segment.from.district)) {
            districts.push(segment.from.district);
        }
        if (!districts.includes(segment.to.district)) {
            districts.push(segment.to.district);
        }
        districtsForAllStations.push(segment.to.district);
        if (segment.from.district !== segment.to.district) {
            PD++;
        }
    });

    const PK = districts.length;
    let max = 0;
    let PM = districts.forEach(d => districtsForAllStations.filter(x => x === d).length > max ? districtsForAllStations.filter(x => x === d).length : max);
    PM = max;

    scores.push((PK * PM) + PD);
    console.log('score calculated');
    renderScoreTable();
}

//Only called once all rounds are done, finds final score and displays it
function calculateFinalScore() {
    gameover = true;

    const railwayScore = railwayCounter == 0? railwayStationScale[0] : (railwayCounter > railwayStationScale.length - 1 ? railwayStationScale[railwayStationScale.length - 1] : railwayStationScale[railwayCounter]) ;
    const roundScores = scores.reduce((a, b) => a + b, 0);

    const J2 = junctions.filter(s => s.count == 2).length;
    const J3 = junctions.filter(s => s.count == 3).length;
    const J4 = junctions.filter(s => s.count == 4).length;

    const juncTotal = (2*J2) + (5*J3) + (9*J4);


    finalScore = railwayScore + roundScores + juncTotal;

    let railRow = document.createElement('tr');
    let railTitle = document.createElement('td');
    let railScore = document.createElement('td');
    railScore.innerText = railwayScore;
    railScore.classList.add('tablescore');
    railScore.style.fontWeight = 'bold';

    railTitle.innerText = `Railway Score`;
    railTitle.style.fontWeight = 'bold';
    railTitle.classList.add('tableround');

    railRow.appendChild(railTitle);
    railRow.appendChild(railScore);
    liveScoreTable.appendChild(railRow);

    let juncRow = document.createElement('tr');
    let juncTitle = document.createElement('td');
    let juncScore = document.createElement('td');
    juncScore.innerText = juncTotal;
    juncScore.classList.add('tablescore');
    juncScore.style.fontWeight = 'bold';

    juncTitle.innerText = `Junctions Score`;
    juncTitle.style.fontWeight = 'bold';
    juncTitle.classList.add('tableround');

    juncRow.appendChild(juncTitle);
    juncRow.appendChild(juncScore);
    liveScoreTable.appendChild(juncRow);

    let totRow = document.createElement('tr');
    let totTitle = document.createElement('td');
    let totScore = document.createElement('td');
    totScore.innerText = finalScore;
    totScore.classList.add('tablescore');
    totScore.style.fontWeight = 'bold';

    totTitle.innerText = `Total`;
    totTitle.style.fontWeight = 'bold';
    totTitle.classList.add('tableround');

    totRow.appendChild(totTitle);
    totRow.appendChild(totScore);
    liveScoreTable.appendChild(totRow);

    let timeRow = document.createElement('tr');
    let timeTitle = document.createElement('td');
    let timeScore = document.createElement('td');
    timeScore.innerText = `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`;
    timeScore.classList.add('tablescore');
    timeScore.style.fontWeight = 'bold';

    timeTitle.innerText = `Time`;
    timeTitle.style.fontWeight = 'bold';
    timeTitle.classList.add('tableround');

    timeRow.appendChild(timeTitle);
    timeRow.appendChild(timeScore);
    liveScoreTable.appendChild(timeRow);

    
    storeData();


    return finalScore;
}

//adds all cells between 2 connected stations to crossedcells array
function updateCrossedCells(station1, station2) {
    const x1 = station1.x;
    const y1 = station1.y;
    const x2 = station2.x;
    const y2 = station2.y;
    const dx = Math.sign(x2 - x1);
    const dy = Math.sign(y2 - y1);

    let x = x1;
    let y = y1;
    while (x !== x2 || y !== y2) {
        const cellId = `cell-${x}-${y}`;
        if (!crossedCells.includes(cellId)) {
            crossedCells.push(cellId);
        }
        x += dx;
        y += dy;
    }
}

//Stores data in local storage.
function storeData() {
    if (nameField.value) {
        let alreadyExisting = localStorage.getItem(`gcentral:SOB:${nameField.value}`);

        if (alreadyExisting){
            let prevData = JSON.parse(alreadyExisting);
            if(prevData.highscore > finalScore){
                return;
            }
        }

        let finalData = {name: playerName.innerText, highscore: finalScore, time: time};
        localStorage.setItem(`gcentral:SOB:${playerName.innerText}`, JSON.stringify(finalData));
        console.log('stored in local storage');
        console.log(localStorage);
    }
}


/*
* Notes:
A railway station and a normal station had the 'train' property swapped in the data in comparison to the image provided, so I switched them back in the data (IDs 9 and 15).
The table displaying high scores will not be displayed unless at least one player finishes the game once.
If a player does not enter his/her name before starting, Player 1 is displayed and the results will NOT be saved (as no name was given).
If a player enters the same name twice and finished twice, only the highest scoring game will be saved in local storage.
*/