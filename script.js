const WIDTH = window.innerWidth - window.innerWidth / 5;
const HEIGHT = window.innerHeight;
const gridSize = 10;
let tabColor = [];
let silentNoisyValue = 50;
let harshHarmoniousValue = 50;
let passiveActiveValue = 50;
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

async function setup() {
    console.log(WIDTH, HEIGHT);
    createCanvas(WIDTH, HEIGHT);
    colorMode(RGB);
    background(255);
    noStroke();

    // Call fetch_colors to initiate the color fetching process
    colors = await fetch_colors();
}

async function changeColor() {
    console.log('changeColor');
    tabColor = await fetch_colors();
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

            let xOffset = 0;
            let yOffset = 0;

            const vibrationStrength = silentNoisyValue;

            if (randomColor.index == 0) {
                xOffset = random(-vibrationStrength, vibrationStrength); // Vibration aléatoire
                yOffset = random(-vibrationStrength, vibrationStrength); // Vibration aléatoire
            }

            fill(randomColor.r, randomColor.g, randomColor.b);
            rect(i * (WIDTH / gridSize) + xOffset, j * (HEIGHT / gridSize) + yOffset, WIDTH / gridSize, HEIGHT / gridSize);
        }
    }

}

function draw() {
    background(255);
    drawMosaic();
}