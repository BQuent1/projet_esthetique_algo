const WIDTH = window.innerWidth - window.innerWidth / 4;
const HEIGHT = window.innerHeight;
let waterLayer;
const gridSize = 20;
let tabColor = [];
let silentNoisyValue = 0;
let harshHarmoniousValue = 0;
let passiveActiveValue = 0;
let dullBrightValue = 50;
let sugaryBitterValue = 0;
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
        document.body.style.cssText = `--blur-amount: ${harshHarmoniousValue/5}px`;
    });

    document.getElementById('passiveActive').addEventListener('change', function (e) {
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

function preload() {
    // Charger l'image et le shader
    // img = loadImage('image.png'); // Remplace par ton image
    waterShader = loadShader('water.vert', 'water.frag');
}

async function setup() {
    createCanvas(WIDTH, HEIGHT, WEBGL);
    waterLayer = createGraphics(WIDTH, HEIGHT, WEBGL);
    waterLayer.colorMode(RGB);
    waterLayer.background(0);
    waterLayer.noStroke();

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
            waterLayer.push();

            if (randomColor.index == 0) {
                posX += vibration();
                posY += vibration();
                waterLayer.fill(randomColor.r, randomColor.g, randomColor.b);
                waterLayer.rect(posX, posY, width, height);
            }

            else if (randomColor.index == 1) {
                danse(posX, posY, width, height);
                posX = 0;
                posY = 0;
                waterLayer.fill(randomColor.r, randomColor.g, randomColor.b);
                waterLayer.rect(posX, posY, width, height);
            }

            else if (randomColor.index == 3) {
                waterLayer.fill(randomColor.r, randomColor.g, randomColor.b);
                drawAcidRectangle(posX, posY, width, height, mildAcidValue);
            }

            else if (randomColor.index == 2) {
                waterLayer.fill(randomColor.r, randomColor.g, randomColor.b);
                waterLayer.rect(posX, posY, width, height);
                particles(posX, posY, width, height);
                
            }

            else{
                waterLayer.fill(randomColor.r, randomColor.g, randomColor.b);
                waterLayer.rect(posX, posY, width, height);
            }
            waterLayer.pop();

        }
    }
}

function draw() {
    waterLayer.background(0);
    drawMosaic();
    shader(waterShader);
    waterShader.setUniform('u_resolution', [width, height]);
    waterShader.setUniform('u_time', millis() / 1000.0);
    waterShader.setUniform('u_texture', waterLayer);
    waterShader.setUniform('u_modifier', wetDryValue/100);
    
    // plane(WIDTH, HEIGHT);
    beginShape();
    // Chaque sommet (vertex) a des coordonnées (x, y) et (u, v)
    vertex(-1, -1, 0, 0); // Coin haut-gauche de l'image
    vertex(1, -1, 1, 0); // Étend horizontalement (1.5 = 150% de largeur)
    vertex(1, 1, 1, 1); // Coin bas-droit
    vertex(-1, 1, 0, 1); // Étend verticalement
    endShape(CLOSE);
    // rect(-WIDTH / 2, -HEIGHT / 2, WIDTH/2, HEIGHT/2);

}


// effets couleurs

function vibration() {
    const vibrationStrength = silentNoisyValue / 97;
    return random(-vibrationStrength, vibrationStrength); // Vibration aléatoire
}

function danse(xPos, yPos, cellWidth, cellHeight) {
    waterLayer.translate(xPos + cellWidth / 2, yPos + cellHeight / 2, 0); // Centrer la tuile
    waterLayer.rotateY(frameCount * passiveActiveValue/1000); // Rotation autour de l'axe Y avec une vitesse différente pour chaque case
    waterLayer.rotateX(frameCount * passiveActiveValue/1000); // Rotation autour de l'axe X avec une vitesse différente pour chaque case
    waterLayer.rectMode(CENTER);
}

function particles(x, y, w, h) {
    let numParticles = sugaryBitterValue / 20; // Nombre de particules
    for (let i = 0; i < numParticles; i++) {
        let px = x + random(-w / 2, w / 2) + w / 2; // Position x aléatoire dans le rectangle
        let py = y + random(-h / 2, h / 2) + h / 2; // Position y aléatoire dans le rectangle
        let size = random(1, 2);

        waterLayer.fill(255, random(200, 255), random(200, 255), random(100, 200));
        waterLayer.noStroke();
        waterLayer.ellipse(px, py, size, size); // Dessiner la particule
    }
}

function drawAcidRectangle(x, y, w, h, acidValue) {
    let cornerRadius = map(acidValue, 0, 100, w / 4, 0); // Plus acidValue est élevé, moins le rayon est grand

    if (acidValue > 80) {
        waterLayer.beginShape();
        waterLayer.vertex((x+w/2) - w / 2, (y+h/2) - h / 2); // Haut gauche
        waterLayer.vertex((x+w/2), (y+h/2) - h / 2 - map(acidValue, 80, 100, 0, h / 4)); // Pic haut
        waterLayer.vertex((x+w/2) + w / 2, (y+h/2) - h / 2); // Haut droit
        waterLayer.vertex((x+w/2) + w / 2 + map(acidValue, 80, 100, 0, w / 4), (y+h/2)); // Pic droit
        waterLayer.vertex((x+w/2) + w / 2, (y+h/2) + h / 2); // Bas droit
        waterLayer.vertex((x+w/2), (y+h/2) + h / 2 + map(acidValue, 80, 100, 0, h / 4)); // Pic bas
        waterLayer.vertex((x+w/2) - w / 2, (y+h/2) + h / 2); // Bas gauche
        waterLayer.vertex((x+w/2) - w / 2 - map(acidValue, 80, 100, 0, w / 4), (y+h/2)); // Pic gauche
        waterLayer.endShape(CLOSE);
    } else {
        // Si acidValue est faible, dessiner des coins arrondis
        waterLayer.rect(x, y, w, h, cornerRadius);
    }
}

