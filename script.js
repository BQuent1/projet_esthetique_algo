const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
let waterLayer;
let gridSize = 20;
let colorPalette = [];
let tabColor = [];
let silentNoisyValue = 0;
let harshHarmoniousValue = 0;
let passiveActiveValue = 0;
let dullBrightValue = 50;
let sugaryBitterValue = 0;
let mildAcidValue = 50;
let coldWarmValue = 0;
let wetDryValue = 0;

let drops = []; // Tableau pour stocker les gouttes

// Classe pour les gouttes
class Drop {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = width / gridSize; // Taille initiale de la goutte
        this.speed = random(1, 2); // Vitesse de la chute
        this.alpha = 255; // Opacité initiale
        this.gravity = coldWarmValue / 97; // Gravité (peut simuler un effet plus fluide ou lent)
    }

    // Mettre à jour la position de la goutte (l'effet de chute)
    update() {
        this.y -= this.speed + this.gravity; // La goutte tombe plus vite avec un peu de gravité
        this.alpha -= 3; // Réduction de la transparence pour l'effet de fusion
        this.size *= 0.99; // Réduction progressive de la taille de la goutte pour simuler un écoulement fluide

        if (this.alpha < 0) {
            this.alpha = 0; // S'arrête à une opacité nulle
        }
    }

    // Dessiner la goutte
    draw() {
        waterLayer.push();
        waterLayer.noStroke();
        waterLayer.fill(this.color.r, this.color.g, this.color.b, this.alpha); // Couleur avec transparence
        waterLayer.ellipse(this.x, this.y, this.size, this.size);
        waterLayer.pop();
    }
}




///////////////////
// HTML EVENTS ///
/////////////////

document.addEventListener('DOMContentLoaded', function () {

    // controls

    document.getElementById('gridSize').addEventListener('input', function (e) {
        gridSize = e.target.value;
        tabColor = randomColorGrid();
    });


    document.getElementById('silentNoisy').addEventListener('input', function (e) {
        silentNoisyValue = e.target.value;

    });

    document.getElementById('harshHarmonious').addEventListener('input', function (e) {
        harshHarmoniousValue = e.target.value;
        document.body.style.cssText = `--blur-amount: ${harshHarmoniousValue / 5}px`;
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

    document.getElementById('wetDry').addEventListener('change', function (e) {
        wetDryValue = e.target.value;

    });

    document.getElementById('nextButton').addEventListener('click', changeColor);

    document.getElementById('csvButton').addEventListener('click', async () => {
        const data = await fetchFullCollection();
        downloadCsv(data);
    });

    window.addEventListener('keydown', function (event) {
        if (event.code === 'Space') {
            changeColor();
        }
    });



});


////////////////
// FIREBASE ///
//////////////

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

async function fetchFullCollection() {
    // Récupérer tous les documents de la collection
    try {
        const snapshot = await db.collection('palette-reviews').get();
        snapshot.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
        });
        // save as csv
        const data = snapshot.docs.map(doc => doc.data());
        const csv = data.map(row => Object.values(row).join(',')).join('\n');
    }
    catch (e) {
        console.error("Erreur lors de la récupération des documents :", e);
    }
}

function downloadCsv(data) {
    // download csv
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'palette-reviews.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


///////////////////
// CANVAS P5.JS //
/////////////////

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
    silentNoisyValue = 0;
    harshHarmoniousValue = 0;
    passiveActiveValue = 0;
    dullBrightValue = 50;
    sugaryBitterValue = 0;
    mildAcidValue = 50;
    coldWarmValue = 0;
    wetDryValue = 0;
    tabColor = await fetch_colors();
    await saveData();
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
        colorPalette = data.colors.map(color => color.rgb);
        data.colors.forEach(color => console.log('%c' + color.hex.value, `color: ${color.hex.value}`));

        document.getElementById('controlPart').style.cssText = `--palette-1: ${data.colors[0].hex.value}; --palette-2: ${data.colors[1].hex.value}; --palette-3: ${data.colors[2].hex.value}; --palette-4: ${data.colors[3].hex.value}`;

        return randomColorGrid();

    } catch (error) {
        console.error('Error fetching colors:', error);
    }
}

function randomColorGrid() {
    for (let j = 0; j < gridSize; j++) {
        tabColor[j] = [];
        for (let i = 0; i < gridSize; i++) {
            const colorIndex = Math.floor(Math.random() * colorPalette.length);
            let color = colorPalette[colorIndex];
            color.index = colorIndex;
            tabColor[j][i] = color;
        }
    }

    return tabColor;
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
                if (coldWarmValue > 50) {
                    createDrippingEffect(posX + width / 2, posY + height / 2, randomColor); // Créer des gouttes
                }
                // else{
                //     drawFrostedEdges(posX, posY, width, height, coldWarmValue);
                // }

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

            else {
                waterLayer.fill(randomColor.r, randomColor.g, randomColor.b);
                waterLayer.rect(posX, posY, width, height);
            }
            waterLayer.pop();

        }
    }

    for (let i = drops.length - 1; i >= 0; i--) {
        let drop = drops[i];
        drop.update(); // Met à jour la position de la goutte
        drop.draw(); // Dessine la goutte

        // Si la goutte est complètement transparente, on la retire
        if (drop.alpha <= 0) {
            drops.splice(i, 1); // Retirer la goutte du tableau
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
    waterShader.setUniform('u_modifier', wetDryValue / 100);
    texture(waterShader);
    beginShape();
    // Chaque sommet (vertex) a des coordonnées (x, y) et (u, v)
    vertex(-1, -1, 0, 0); // Coin haut-gauche de l'image
    vertex(1, -1, 1, 0); // Étend horizontalement (1.5 = 150% de largeur)
    vertex(1, 1, 1, 1); // Coin bas-droit
    vertex(-1, 1, 0, 1); // Étend verticalement
    endShape(CLOSE);
    // rect(-WIDTH / 2, -HEIGHT / 2, WIDTH/2, HEIGHT/2);

}


/////////////////////
// EFFETS VISUELS //
///////////////////

function vibration() {
    const vibrationStrength = silentNoisyValue / 97;
    return random(-vibrationStrength, vibrationStrength); // Vibration aléatoire
}

function danse(xPos, yPos, cellWidth, cellHeight) {
    waterLayer.translate(xPos + cellWidth / 2, yPos + cellHeight / 2, 0); // Centrer la tuile
    waterLayer.rotateY(frameCount * passiveActiveValue / 1000); // Rotation autour de l'axe Y avec une vitesse différente pour chaque case
    waterLayer.rotateX(frameCount * passiveActiveValue / 1000); // Rotation autour de l'axe X avec une vitesse différente pour chaque case
    waterLayer.rectMode(CENTER);
}

function particles(x, y, w, h) {
    let numParticles = sugaryBitterValue / 20; // Nombre de particules
    for (let i = 0; i < numParticles; i++) {
        let px = x + random(-w / 2, w / 2) + w / 2; // Position x aléatoire dans le rectangle
        let py = y + random(-h / 2, h / 2) + h / 2; // Position y aléatoire dans le rectangle
        let size = random(1, 4);

        waterLayer.fill(255, random(200, 255), random(200, 255), random(100, 200));
        waterLayer.noStroke();
        waterLayer.ellipse(px, py, size, size); // Dessiner la particule
    }
}

function drawAcidRectangle(x, y, w, h, acidValue) {
    let cornerRadius = map(acidValue, 0, 50, max(w, h) / 2, 0); // Plus acidValue est faible, plus le rayon est grand
    let scaleValue = map(acidValue, 0, 50, max(w, h) / 4, 0); // La forme grossit proportionnellement à la diminution de l'acidité

    waterLayer.push();
    waterLayer.translate(0, 0, 0.1);

    if (acidValue > 50) {
        waterLayer.beginShape();

        const numPointsTopBottom = 20; // Nombre de points pour le haut et le bas
        const numPointsSides = 12; // Nombre de points pour les côtés gauche et droit
        const spikeLength = map(acidValue, 50, 100, h * 0.05, h * 0.2); // Longueur des pics, en fonction de acidValue

        // Haut du rectangle
        for (let i = 0; i < numPointsTopBottom; i++) {
            const xPos = x + (i / (numPointsTopBottom - 1)) * w; // Position horizontale
            if (i % 2 === 0) {
                // Point "normal"
                waterLayer.vertex(xPos, y);
            } else {
                // Pic vers le haut
                waterLayer.vertex(xPos, y - spikeLength);
            }
        }

        // Côté droit du rectangle
        for (let i = 0; i < numPointsSides; i++) {
            const yPos = y + (i / (numPointsSides - 1)) * h; // Position verticale
            if (i % 2 === 0) {
                // Point "normal"
                waterLayer.vertex(x + w, yPos);
            } else {
                // Pic vers l'extérieur
                waterLayer.vertex(x + w + spikeLength, yPos);
            }
        }

        // Bas du rectangle
        for (let i = 0; i < numPointsTopBottom; i++) {
            const xPos = x + w - (i / (numPointsTopBottom - 1)) * w; // Position horizontale inversée
            if (i % 2 === 0) {
                // Point "normal"
                waterLayer.vertex(xPos, y + h);
            } else {
                // Pic vers le bas
                waterLayer.vertex(xPos, y + h + spikeLength);
            }
        }

        // Côté gauche du rectangle
        for (let i = 0; i < numPointsSides; i++) {
            const yPos = y + h - (i / (numPointsSides - 1)) * h; // Position verticale inversée
            if (i % 2 === 0) {
                // Point "normal"
                waterLayer.vertex(x, yPos);
            } else {
                // Pic vers l'intérieur
                waterLayer.vertex(x - spikeLength, yPos);
            }
        }

        waterLayer.endShape(CLOSE);
    }
    else {
        // Acidité faible : Dessiner une forme arrondie et plus grande
        waterLayer.rectMode(CENTER);
        waterLayer.noStroke();
        waterLayer.rect(
            x + w / 2,
            y + h / 2,
            w + scaleValue, // Largeur augmentée
            h + scaleValue, // Hauteur augmentée
            cornerRadius    // Coins arrondis
        );
    }

    waterLayer.pop();
}

// Fonction pour générer l'effet de dégoulinade à partir d'une position de cellule
function createDrippingEffect(x, y, color) {
    // Créer plusieurs gouttes pour simuler l'écoulement
    for (let i = 0; i < 1; i++) {
        drops.push(new Drop(x, y, color)); // Ajouter une nouvelle goutte
    }
}

function drawFrostedEdges(x, y, w, h, frostFactor) {
    waterLayer.push();
    
    // Calcul de l'épaisseur de la bordure en fonction du facteur de givre
    const borderThickness = map(frostFactor, 0, 100, 2, 15); // Variation de l'épaisseur de la bordure

    // Dégradé de blanc à transparent (simule le givre)
    for (let i = borderThickness; i > 0; i--) {
        let alpha = map(i, borderThickness, 0, 255, 0); // Dégradé d'alpha (opacité)
        waterLayer.stroke(255, 255, 255, alpha);
        waterLayer.noFill();
        waterLayer.rect(x - i / 2, y - i / 2, w + i, h + i); // Dessiner des rectangles concentriques
    }

    waterLayer.pop();
}