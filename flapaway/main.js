//Data
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const startButton = document.querySelector('.start-btn');
startButton.addEventListener('click', () => {

    lost = false;
    score = 0;
    highscore = localStorage.getItem('gcentral:flapaway:highscore') || 0;
    bird.x = 50;
    bird.y = 0;
    bird.vy = 0;
    columns = [];
    COLUMN_VELOCITY = -200;
    ctx.reset();
    addColumnPair();
    prevTime = performance.now();
    gameLoop();
    startButton.classList.add('disabled');
    startButton.disabled = true;
});

let lost = false;
let score = 0;
let highscore = localStorage.getItem('gcentral:flapaway:highscore') || 0;

const bird = {
    x: 50,
    y: 0,
    width: 60,
    height: 33,
    vy: 0, // px per s
    ay: 1000 //px per s^2
}

const topColumnImg = new Image();
topColumnImg.src = 'media/topcolumn.png';

const bottomColumnImg = new Image();
bottomColumnImg.src = 'media/bottomcolumn.png';

const birdImg = new Image();
birdImg.src = 'media/flappybird.png';

const skyImg = new Image();
skyImg.src = 'media/sky.jpg';

const gameoverImg = new Image();
gameoverImg.src = 'media/gameover.png';

const Thumbnail = new Image();
Thumbnail.src = 'media/thumbnail.png';
Thumbnail.addEventListener('load', () => {
    ctx.drawImage(Thumbnail, 0, 0, canvas.width, canvas.height);
});

let columns = [];
let COLUMN_GAP = 100;
const COLUMN_WIDTH = 50;
const COLUMN_HEIGHT = 350;
let COLUMN_VELOCITY = -200;
const COLUMN_DISTANCE = 400;

function addColumnPair() {
    const offset = random(50, 270);
    columns.push({
        x: canvas.width,
        y: 0 - offset - COLUMN_GAP,
        width: COLUMN_WIDTH,
        height : COLUMN_HEIGHT
    },
    {
        x: canvas.width,
        y: 400 - offset,
        width: COLUMN_WIDTH,
        height: COLUMN_HEIGHT
    });
}

 //Utility function
 function random(a,b) {
    return Math.floor(Math.random() * (b - a + 1));
 }


//Game Loop
let prevTime = performance.now();
function gameLoop(now = performance.now()){
    const dt = (now - prevTime) /1000; //difference in time in seconds
    prevTime = now;
    
    update(dt);
    render();

    if (!lost) window.requestAnimationFrame(gameLoop); //call as frequently as possible
}

function update(dt) {
    // v = ds / dt -> dv = a * dt
    // a = dv / dt -> ds = v * dt

    //Move Bird
    bird.vy += bird.ay * dt;
    bird.y += bird.vy * dt;

    if (bird.y > canvas.height || bird.y + bird.height < 0) {
        lost = true;
        return;
    }

    //Move Columns, Check Collision
    for (const column of columns) {
        column.x += COLUMN_VELOCITY * dt;
        if (isCollision(column, bird)) {
            lost = true;
            return;
        }
    }

    //Add Column
    const lastColumn = columns.at(-1);
    if (canvas.width - lastColumn.x > COLUMN_DISTANCE) addColumnPair();

    //Remove Column
    const firstColumn = columns.at(0);
    if (firstColumn.x < -COLUMN_WIDTH) {
        score++;
        columns.shift();
        columns.shift();
        if (score % 5 === 0 && score <= 100) {
            COLUMN_VELOCITY -= 10;
        }

        if (score % 15 === 0 && score <= 100) {
            COLUMN_GAP -= 15;
        }
    }
}

function isCollision(a,b){
      return !((a.x + a.width - 5 < b.x && a.y != b.y) ||
             (a.x > b.x + b.width - 10 && a.y != b.y) ||
             (a.y + a.height - 5 < b.y && a.x != b.x) ||
             (a.y > b.y + b.height - 5 && a.x != b.x));
}

function render() {
    if (!lost) {
        const cwidth = canvas.width;
        const cheight = canvas.height;

        //Sky
        ctx.drawImage(skyImg, 0, 0, cwidth, cheight);

        //Bird
        ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

        //Columns
        for (const column of columns){
            if (column.y <= 0) {
                ctx.drawImage(topColumnImg, column.x, column.y, column.width, column.height);
                continue;
            }
            ctx.drawImage(bottomColumnImg, column.x, column.y, column.width, column.height);
        }

        //Score
        ctx.fillStyle = "black";
        ctx.font = "20px Lucida Console";
        ctx.fillText (`Score: ${score}`, 10, 30);
        ctx.fillText (`High Score: ${highscore}`, 10, 60);
    }
    else {
        if (score > highscore) {
            localStorage.setItem('gcentral:flapaway:highscore', score);
        }

        COLUMN_VELOCITY = 0;
        ctx.reset();
        ctx.drawImage(gameoverImg, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.font = "70px Lucida Console";
        ctx.fillText ("Game Over", 20, 80);
        ctx.font = "50px Lucida Console";
        if (score > highscore) {
            ctx.fillText (`New Highscore!`, 50, 130);
            highscore = score;
        }
        ctx.font = "20px Lucida Console";
        ctx.fillText (`Score: ${score}`, 50, 160);
        ctx.fillText (`Highscore: ${highscore}`, 50, 190);

        startButton.classList.remove('disabled');
        startButton.disabled = false;
    }
}

document.addEventListener('keydown', function(e) {
    if(e.key === " ") {
        bird.vy = -300;
    }
});

// addColumnPair();
// gameLoop();
