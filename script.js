const WIDTH = window.innerWidth - window.innerWidth / 4;
const HEIGHT = window.innerHeight;
const gridSize = 50;
let calque;
let tabColor = [];
let silentNoisyValue = 0;
let harshHarmoniousValue = 50;
let passiveActiveValue = 0;
let dullBrightValue = 50;
let sugaryBitterValue = 50;
let mildAcidValue = 50;
let coldWarmValue = 50;
let wetDryValue = 50;

document.addEventListener('DOMContentLoaded', function () {

    // controls

    document.getElementById('silentNoisy').addEventListener('input', function (e) {
        silentNoisyValue = e.target.value;

    });

    document.getElementById('harshHarmonious').addEventListener('input', function (e) {
        harshHarmoniousValue = e.target.value;

    });

    document.getElementById('passiveActive').addEventListener('input', function (e) {
        passiveActiveValue = e.target.value;

    });

    document.getElementById('dullBright').addEventListener('input', function (e) {
        dullBrightValue = e.target.value;

    });

    document.getElementById('sugaryBitter').addEventListener('input', function (e) {
        sugaryBitterValue = e.target.value;

    });

    document.getElementById('mildAcid').addEventListener('input', function (e) {
        mildAcidValue = e.target.value;

    });

    document.getElementById('coldWarm').addEventListener('input', function (e) {
        coldWarmValue = e.target.value;

    });

    document.getElementById('wetDry').addEventListener('input', function (e) {
        wetDryValue = e.target.value;

    });

    document.getElementById('nextButton').addEventListener('click', changeColor);

});

const firebaseConfig = {
    apiKey: "AIzaSyAZHLuqxB9hJEkvtIt4j0iDruEt6aBleK8",
    authDomain: "palette-ba1cc.firebaseapp.com",
    projectId: "palette-ba1cc",
    storageBucket: "palette-ba1cc.firebasestorage.app",
    messagingSenderId: "313774795669",
    appId: "1:313774795669:web:fbae4c1d4c82c4a21de49c",
    measurementId: "G-5LPD228XNQ"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Get a reference to the Firestore database
const db = firebase.firestore();

async function setup() {
    console.log(WIDTH, HEIGHT);
    createCanvas(WIDTH, HEIGHT, WEBGL);
    calque = createGraphics(WIDTH, HEIGHT);
    colorMode(RGB);
    background(0);
    noStroke();

    // Call fetch_colors to initiate the color fetching process
    colors = await fetch_colors();
}

async function changeColor() {
    console.log('changeColor');
    tabColor = await fetch_colors();
    await saveData();
}

async function saveData() {
    // Créer un objet avec des données
    const doc = {
        silentNoisyValue,
        harshHarmoniousValue,
        passiveActiveValue,
        dullBrightValue,
        sugaryBitterValue,
        mildAcidValue,
        coldWarmValue,
        wetDryValue
    };
    
    // Créer un document dans Firestore
    try {
        await db.collection('palette-reviews').add(doc);
        // await setDoc(docRef, user);
        console.log("Document écrit avec succès !");
    }
    catch (e) {
        console.error("Erreur lors de l'écriture du document :", e);
    }
}

//choisir 4 couleurs
async function fetch_colors() {
    tabColor = [];
    try {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

        // Fetch color information from The Color API
        const response = await fetch(`https://www.thecolorapi.com/scheme?hex=${randomColor}&mode=analogic-complement&count=4`);
        const data = await response.json();

        // Push colors into the array
        colors = data.colors.map(color => color.rgb);
        data.colors.forEach(color => console.log('%c' + color.hex.value, `color: ${color.hex.value}`));

        for (let j = 0; j < gridSize; j++) {
            tabColor[j] = [];
            for (let i = 0; i < gridSize; i++) {
                const colorIndex = Math.floor(Math.random() * colors.length);
                let color = colors[colorIndex];
                color.index = colorIndex;
                tabColor[j][i] = color;
            }
        }

        return tabColor;

    } catch (error) {
        console.error('Error fetching colors:', error);
    }
}

async function drawMosaic() {
    // Only run this code once colors are available
    for (let j = 0; j < gridSize; j++) {
        for (let i = 0; i < gridSize; i++) {
            let randomColor;
            try {
                randomColor = tabColor[j][i];
            }
            catch {
                return;
            }

            let posX = i * (WIDTH / gridSize) - WIDTH / 2;
            let posY = j * (HEIGHT / gridSize) - HEIGHT / 2;
            let width = WIDTH / gridSize;
            let height = HEIGHT / gridSize;
            push();


            if (randomColor.index == 0) {
                posX += vibration();
                posY += vibration();
            }

            if(randomColor.index == 1) {
                danse(posX, posY, width, height);
                posX = 0;
                posY = 0;
            }

            fill(randomColor.r, randomColor.g, randomColor.b);
            rect(posX, posY, width, height);
            pop();

        }
    }

}

function draw() {
    background(0);
    drawMosaic();
    //image(calque, -WIDTH / 2, -HEIGHT / 2);
    //rect(-WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT);
}


// effets couleurs

function vibration() {
    const vibrationStrength = silentNoisyValue/98;
    return random(-vibrationStrength, vibrationStrength); // Vibration aléatoire
}

function danse(xPos, yPos, cellWidth, cellHeight) {
    translate(xPos + cellWidth / 2, yPos + cellHeight / 2, 0); // Centrer la tuile
    rotateY(frameCount * passiveActiveValue/1000); // Rotation autour de l'axe Y avec une vitesse différente pour chaque case
    rotateX(frameCount * passiveActiveValue/1000); // Rotation autour de l'axe X avec une vitesse différente pour chaque case
    rectMode(CENTER);
}