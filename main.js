document.body.style.overflow = 'hidden';
const canvas = document.querySelector(".canvas1");
const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight)
const ctx = canvas.getContext("2d");
ctx.textBaseline = "top";
ctx.strokeStyle = "white";
ctx.lineWidth = 1;
ctx.scale(1,1);

const setup=0, inplay=1, totup=2, finish=3,comeback=99;

const vowels= ["A","E","I","O","U"]
const consonants = ["B","C","D","F","G","H","J","K","L","M","N","P","Q","R","S","T","V","W","X","Y","Z"]
const alphabet = vowels.concat(consonants).sort()
import {words} from './dict.js';
import {wl} from './wl.js';
import {day1} from './wl.js';

let state = setup;
let guess = [undefined];
let posx = 0;
let guesses = [];
let letters = [];
let unknown= 0;
let ln = [];
let score = 0;
let scored = false;
let word = "";
let bonus = false;
let writeOnce = false;
let funtext = false;
let mx, my = 0;
let button = false;
let day = 0;
let woffset= 0;
let touchDevice = ('ontouchstart' in document.documentElement);

getLetters();

showHeader();

if (checkCookie()) {
    state = comeback;
} else {
    state = inplay;
    startKbListener();
}

startMmListener();
startMbListener();

requestAnimationFrame(mainLoop);

function clear() {
    ctx.fillStyle = "rgb(0, 35, 45)";
    ctx.fillRect(0, 100, width, height);
}

function mainLoop() {
    clear();
    checkWide();
    checkIfOver();
    if (state === comeback) {
        letters="COMEBACK"
        comeBack(260-woffset,220);
    }
    showLetters(300-woffset, 140, 80);
    if (state === inplay) {
        if (touchDevice) {
            showTouchBoxes(930-woffset, 180);
        }
        showGuess(300-woffset, 260, 80);
        if (guesses.length>2 && guesses.length<5) {
            finished(500-woffset,500);
            }
    }
    showGuessed(300-woffset, 320, 30, 40);
    if (unknown === 1) {
        showUnknown().then(() => {
            unknown = 0;
            startKbListener();
        });
    }
    if (state===totup) {
        if (!writeOnce) {
            writeOnce=true;
            writeCookie();
        }
        showScore(260-woffset, 220);
    }
    requestAnimationFrame(mainLoop);
    button = false;
    guess = guess.filter(function( element ) {
        return element !== undefined;
    });
}

function checkWide() {
    if (width<1500) {
        woffset=200;
    } else {
        woffset=0;
    }
}

function finished(x,y) {
    ctx.save();
    ctx.font = "17px courier";
    ctx.strokeStyle = "rgb(0,110,0)";
    ctx.fillStyle = "rgb(0,90,0)";
    fillStrokeTxt("press @ to end this run", x, y );
    ctx.restore();
}

function getScore() {
    ln[3]=0; ln[4]=0; ln[5]=0;ln[6]=0; ln[7]=0; ln[8]=0;
    for (let f=0; f<guesses.length;f++) {
        ln[guesses[f].length]++;
        if (guesses[f].toLowerCase()===word.toLowerCase()) {
            bonus = true;
            score = score + 20;
        }
    }
    for (let f=3;f<9;f++) {
        score = score + (ln[f]*f);
    }
    scored = true;
}

function showScore(x,y) {
    ctx.save();

    if (!scored) {
        getScore();
    }
    ctx.beginPath();
    ctx.font="40px arial";
    ctx.fillStyle="rgba(255,255,255,.8)";
    ctx.roundRect(x,y,670,400,15);
    ctx.fill();
    ctx.strokeStyle="rgb(0,0,175)";
    ctx.fillStyle="rgb(0,0,150)";
    fillStrokeTxt("Your score today is "+score,x+30,y+30);
    ctx.font="30px arial";
    ctx.strokeStyle="rgb(0,0,175)";
    ctx.fillStyle="rgb(0,0,150)";
    fillStrokeTxt("3 letter words : "+ln[3],x+30,y+90);
    fillStrokeTxt("4 letter words : "+ln[4],x+30,y+130);
    fillStrokeTxt("5 letter words : "+ln[5],x+30,y+170);
    fillStrokeTxt("6 letter words : "+ln[6],x+400,y+90);
    fillStrokeTxt("7 letter words : "+ln[7],x+400,y+130);
    fillStrokeTxt("8 letter words : "+ln[8],x+400,y+170);

    fillStrokeTxt("bonus word : "+word,x+30,y+250);
    if (bonus) {
        fillStrokeTxt("and you found it for bonus points!",x+120,y+290);
    }
    ctx.restore();
}

function comeBack(x,y) {
    ctx.save();
    stopKbListener();
    ctx.font="40px arial";
    ctx.strokeStyle="rgb(150,0,175)";
    ctx.fillStyle="rgb(150,0,150)";
    fillStrokeTxt("Come back tomorrow for another puzzle.",x+30,y+30);
    ctx.restore();
}

function fillStrokeTxt(msg,x,y) {
    ctx.fillText(msg, x, y);
    ctx.strokeText(msg, x, y);
}

function mm(event) {
    const rect = canvas.getBoundingClientRect();
    mx=event.clientX-rect.left;
    my=event.clientY-rect.top;
}

function mb(event) {
    const rect = canvas.getBoundingClientRect();
    mx=event.clientX-rect.left;
    my=event.clientY-rect.top;
    button = true;
}

function dayNum() {
    let one_day = 1000 * 60 * 60 * 24; // one day in milliseconds
    let start_date = day1;
    let today = Date.now();
    let difference = (today - start_date);
    return Math.floor(difference/one_day);
}

function showLetters(x,y,offset) {
    ctx.save();
    ctx.font = "50px courier";
    let tempguess=[...guess];
    for (let letter of letters) {
        let inside = (mx>x-20 && mx<x-20+(offset-10) && my>y && my<y+(offset-10))
        if (state!==inplay) {inside = false;}
        ctx.fillStyle = "rgb(200,200,200)";
        ctx.strokeStyle = "white";
        ctx.strokeRect(x-20,y,offset-10,offset-10);
        if (inside) {
            ctx.fillStyle = "rgb(0,150,0)";
            ctx.strokeStyle = "rgb(0,150,0)";
            if (button) {
                dispatchEvent(new KeyboardEvent('keydown',{'key':letter}));
            }
        }
        if (tempguess.includes(letter)) {
            ctx.fillStyle = "rgb(100,160,230)";
            ctx.strokeStyle = "rgb(100,100,100)";
            let pos = tempguess.indexOf(letter);
            if (pos>-1) {
                tempguess.splice(pos,1);
            }
        }
        ctx.fillText(letter,x, y+10);
        ctx.strokeText(letter,x, y+10);
        x = x + offset;
    }
    ctx.restore();
}

function showGuess(x,y, offsetx) {
    ctx.save();
    ctx.font = "30px courier";
    ctx.strokeStyle = "white";
    let dim=1;
    for (let char = 0; char<8; char ++) {
        if (guess[char]!==undefined) {
            ctx.fillText(guess[char], x + (char * offsetx), y);
            ctx.strokeText(guess[char], x + (char * offsetx), y);
        } else {
            ctx.strokeStyle = "rgb(50,70,120)";
            if (dim===1) {
                ctx.strokeStyle = "white";
                dim=0;
            }
            ctx.fillText("_", x + (char * offsetx), y);
            ctx.strokeText("_", x + (char * offsetx), y);
        }
    }
    ctx.restore();
}

function showGuessed(x,y, offsetx, offsety) {
    ctx.save();
    ctx.font = "30px courier";
    ctx.strokeStyle = "rgb(0,175,245)";
    let y2=0;
    for (let f=0; f<guesses.length; f++){
        if (guesses[f]===guess.join('').toUpperCase()) {
            ctx.strokeStyle = "rgb(0,250,255)";
        } else {
            ctx.strokeStyle = "rgb(0,175,245)";
        }
        for (let char=0; char<guesses[f].length; char++) {
            ctx.fillText(guesses[f][char], x+(char*offsetx), y + (y2 * offsety));
            ctx.strokeText(guesses[f][char], x+(char*offsetx), y + (y2 * offsety));
        }
        if (f===6) {
            y2 =0;
            x = x + 10*offsetx;
        } else {
            y2++;
        }
    }
    ctx.restore();
}

function getLetters() {
    day = dayNum();
    if (day>wl.length|| day<0) {
        word = words[8][Math.floor(Math.random()*words[8].length)];
        day=0;
    } else {
        word = words[8][wl[day]]
    }
    for (let f=0; f<word.length; f++) {
        letters[f]=word[f].toUpperCase();
    }
    shuffle(letters);
    shuffle(letters);
}

function shuffle(object) {
    let len = object.length;
    for (let f=0; f<len; f++) {
        if (Math.floor(Math.random()*2)===1) {
            let swap = Math.floor(Math.random()*len);
            let temp = object[f];
            object[f] = object[swap];
            object[swap] = temp;
        }
    }
}

function showHeader() {
    ctx.save();
    ctx.textBaseline = "top";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.font = "66px arial";
    ctx.strokeText("WordRun", 50, 20);
    ctx.font = "12px arial";
    ctx.strokeStyle = "rgb(0,60,80)";
    ctx.strokeText("puzzle #" + day, 70, 85)
    ctx.restore();
}

async function showUnknown() {
    ctx.save();
    stopKbListener();
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgb(140,120,200)";
    ctx.lineWidth = 1;
    ctx.font = "20px arial";
    ctx.fillText("unknown word", 780, 300);
    await delay(350);
    ctx.restore();
    unknown = 0;
}

function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

function kb(event) {
    if (event.defaultPrevented) {
        return;
    }
    let key= event.key.toUpperCase()
    if (validLetter(key) && validKey(key)) {
        guess[posx]=key;
        if (posx<8) {
            posx++;
        }
    }
    if (key==="BACKSPACE") {
        if (posx>0) {
            posx--;
            guess.fill(undefined,posx);
        }
    }

    if (key==="ENTER") {
        if (validGuess(guess)) {
            posx = 0;
            guess.fill(undefined);
        }
    }

    if (key==="@") {
        stopKbListener();
        state=totup;
    }
    event.preventDefault();
}

function startKbListener() {
    window.addEventListener("keydown", kb,true);
}

function stopKbListener() {
    window.removeEventListener("keydown", kb,true);
}

function startMbListener() {
    canvas.addEventListener("mousedown",mb,true);
}

function startMmListener() {
    canvas.addEventListener("mousemove",mm,true);
}

function checkIfOver() {
    if (guesses.length>=14) {
        state = totup;
        stopKbListener();
    }
}

function validLetter(l) {
    return letters.includes(l);
}

function validGuess(object) {
    let theguess = object.join('').toLowerCase()
    let length = theguess.length;
    if (length<3) {
        return false;
    }
    if (!words[length].includes(theguess)) {
        unknown=1;
        return false;
    }
    if (!guesses.includes(theguess.toUpperCase())) {
        guesses.push(theguess.toUpperCase())
        return true;
    }

    return false;
}

function validKey(l) {
    let timesUsed = countInstances(l,guess);
    let timesAllowed = countInstances(l,letters);
    return timesAllowed > timesUsed;
}

function countInstances(l, object) {
    let inCount=0;
    for (let f=0; f<object.length; f++) {
        if (object[f]===l) {inCount++}
    }
    return inCount;
}

function checkCookie() {
    let cookie = decodeURI(document.cookie)
    let value = cookie.split(";");
    for (let f= 0;f<value.length;f++) {
        if (value[f]==="fin=true") {
            return true;
        }
    }
    return false;
}

function writeCookie() {
    let datetime = new Date();
    datetime.setDate(datetime.getDate() + 1);
    datetime.setHours(0); datetime.setMinutes(0);datetime.setSeconds(1);
    document.cookie = "fin=true;expires="+datetime;
}

function showTouchBoxes(x,y) {
    ctx.save();
    ctx.font="16px arial";
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.strokeStyle = "rgb(0,0,0)";
    let offset = 70;

    ctx.beginPath();
    ctx.roundRect(x,y,76,30,40);
    ctx.stroke();
    if (mx>x && mx<x+76 && my>y && my<y+30 && guess.length>2) {
        ctx.fillStyle = "rgb(0,50,0)";
        ctx.strokeStyle = "rgb(0,150,0)";
        if (button) {
            dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'}));
        }
    }
    fillStrokeTxt("ENTER", x+12, y + 8);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.strokeStyle = "rgb(0,0,0)";

    ctx.beginPath();
    ctx.roundRect(x,y+offset,118,30,40);
    ctx.stroke();
    if (mx>x && mx<x+118 && my>y+offset && my<y+offset+30 && guess.length>0) {
        ctx.fillStyle = "rgb(0,50,0)";
        ctx.strokeStyle = "rgb(0,150,0)";
        if (button) {
            dispatchEvent(new KeyboardEvent('keydown',{'key':'Backspace'}));
        }
    }
    fillStrokeTxt("BACKSPACE", x+12, y + 8 + offset);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.strokeStyle = "rgb(0,0,0)";


    ctx.beginPath();
    ctx.roundRect(x,y+(offset*2),58,30,40);
    ctx.stroke();
    if (mx>x && mx<x+58 && my>y+(offset*2) && my<y+(offset*2)+30 && guesses.length>2) {
        ctx.fillStyle = "rgb(0,50,0)";
        ctx.strokeStyle = "rgb(0,150,0)";
        if (button) {
            dispatchEvent(new KeyboardEvent('keydown',{'key':'@'}));
        }
    }
    fillStrokeTxt("END", x+12, y + 8 + (offset * 2));
    ctx.restore();
}