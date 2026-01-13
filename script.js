const WIDTH = window.innerHeight;
const HEIGHT = window.innerHeight;
let waterLayer;
let gridSize = 20;
let colorPalette = [];
let tabColor = [];
// let silentNoisyValue = 0;
// let harshHarmoniousValue = 0;
// let passiveActiveValue = 0;
// let dullBrightValue = 50;
// let sugaryBitterValue = 0;
// let mildAcidValue = 50;
// let coldWarmValue = 0;
// let wetDryValue = 0;
let currentPalette;
const fields = ['silentNoisy', 'harshHarmonious', 'passiveActive', 'dullBright', 'sugaryBitter', 'mildAcid', 'coldWarm', 'wetDry'];
let formData = {};
let visualEffects = {}
let averages = {};
let stepCount = 1;

p5.disableFriendlyErrors = true;

const resetVisualEffects = () => {
    visualEffects = {
        silentNoisy: 50,
        harshHarmonious: 50,
        passiveActive: 50,
        dullBright: 50,
        sugaryBitter: 50,
        mildAcid: 50,
        coldWarm: 50,
        wetDry: 50
    };
}

const resetFormData = () => {
    formData = {
        silentNoisy: 50,
        harshHarmonious: 50,
        passiveActive: 50,
        dullBright: 50,
        sugaryBitter: 50,
        mildAcid: 50,
        coldWarm: 50,
        wetDry: 50
    }
    fields.map(field => {
        document.getElementById(field).value = formData[field];
    });
}

let drops = []; // Tableau pour stocker les gouttes
let palettes = [
    { id: 1, colors: ["eaf4d3", "dbd8ae", "ca907e", "994636"] },
    { id: 2, colors: ["040403", "5b7553", "8eb897", "c3e8bd"] },
    { id: 3, colors: ["bad1cd", "f2d1c9", "e086d3", "8332ac"] },
    { id: 4, colors: ["011627", "ff0022", "41ead4", "fdfffc"] },
    { id: 5, colors: ["8e5572", "f2f7f2", "c2b97f", "bcaa99"] },
    { id: 6, colors: ["fffc31", "5c415d", "f6f7eb", "e94f37"] },
    { id: 7, colors: ["83b692", "f9ada0", "f9627d", "c65b7c"] },
    { id: 8, colors: ["ea526f", "070600", "f7f7ff", "23b5d3"] },
    { id: 9, colors: ["c3a995", "ab947e", "6f5e53", "8a7968"] },
    { id: 10, colors: ["006ba6", "0496ff", "ffbc42", "d81159"] },
    { id: 11, colors: ["fbf2c0", "48392a", "43281c", "c06e52"] },
    { id: 12, colors: ["bcf4f5", "b4ebca", "d9f2b4", "d3fac7"] },
    { id: 13, colors: ["18206f", "17255a", "f5e2c8", "d88373"] },
    { id: 14, colors: ["e5e059", "bdd358", "ffffff", "999799"] },
    { id: 15, colors: ["5f0f40", "9a031e", "fb8b24", "e36414"] },
    { id: 16, colors: ["f05d5e", "0f7173", "e7ecef", "272932"] },
    { id: 17, colors: ["003844", "006c67", "f194b4", "ffb100"] },
    { id: 18, colors: ["ffff82", "f5f7dc", "b5d99c", "0f0326"] },
    { id: 19, colors: ["6e2594", "ecd444", "808080", "000000"] },
    { id: 20, colors: ["561643", "6c0e23", "c42021", "f3ffb9"] }
];
let palettesBackup = palettes;

// shuffle palette
palettes = palettes.sort(() => Math.random() - 0.5);

// Classe pour les gouttes
class Drop {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = width / gridSize; // Taille initiale de la goutte
        this.speed = random(1, 2); // Vitesse de la chute
        this.alpha = 255; // Opacité initiale
        this.gravity = visualEffects['coldWarm'] / 97; // Gravité (peut simuler un effet plus fluide ou lent)
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

    resetVisualEffects();
    resetFormData();

    // Gestion de la taille de la grille
    document.getElementById('gridSize').addEventListener('input', function (e) {
        gridSize = parseInt(e.target.value);
        tabColor = randomColorGrid();
    });

    // Liste des champs à lier dynamiquement
    fields.forEach(field => {
        const slider = document.getElementById(field);
        if (slider) {
            slider.addEventListener('input', function (e) {
                const value = parseInt(e.target.value);
                // 1. On stocke la valeur pour le formulaire (le vote)
                formData[field] = value;
                // 2. On met à jour l'effet visuel immédiatement pour la prévisualisation
                visualEffects[field] = value;
                
                // Cas particulier pour le flou qui dépend de harshHarmonious
                if (field === 'harshHarmonious') {
                    updateBlur();
                }
            });
        }
    });

    document.getElementById('validButton').addEventListener('click', vote);
    document.getElementById('nextButton').addEventListener('click', changeColor);

    document.getElementById('csvButton').addEventListener('click', async () => {
        const data = await fetchFullCollection();
        // push titles
        const table = [];
        table.push("palette,silentNoisy,harshHarmonious,passiveActive,dullBright,sugaryBitter,mildAcid,coldWarm,wetDry,color1,color2,color3,color4".split(','));
        data.map(doc => {
            const palette = palettesBackup.find(palette => palette.id == doc.id);
            if(!palette) return;
            console.log(palettesBackup);
            table.push([doc.id, doc.silentNoisy, doc.harshHarmonious, doc.passiveActive, doc.dullBright, doc.sugaryBitter, doc.mildAcid, doc.coldWarm, doc.wetDry, palette.colors[0], palette.colors[1], palette.colors[2], palette.colors[3]]);
        })

        downloadCsv(table);
    });

    // window.addEventListener('keydown', function (event) {
    //     if (event.code === 'Space') {
    //         changeColor();
    //     }
    // });



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
        id:currentPalette,
        ...formData
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
        // snapshot.forEach(doc => {
        //     console.log(doc.id, '=>', doc.data());
        // });
        // save as csv
        return snapshot.docs.map(doc => doc.data());
    }
    catch (e) {
        console.error("Erreur lors de la récupération des documents :", e);
    }
}

async function getAverageValuesForPalette() {
    const collection = await fetchFullCollection();
    
    const reviews = collection.filter(doc => doc.id == currentPalette);

    const avg = (array, field) => {
        const sum = array.reduce((a, b) => {
            return a + b[field];
        }, 0);
        return Math.round(sum / array.length)
    }

    fields.map(field => {
        averages[field] = avg(reviews, field) 
        console.log(field, 'moyenne :', averages[field]);
        document.getElementById(`${field}Result`).style.left = `${averages[field]}%`;
        document.getElementById(`${field}Result`).innerText = `${averages[field]}%`;
        document.getElementById(`${field}Result`).style.display = `block`;
    });
}

function downloadCsv(data) {
    // download csv
    const csv = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
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
    canvas = createCanvas(WIDTH, HEIGHT, WEBGL);
    // add canvas to the #canvas-wrapper div
    canvas.parent('canvas-wrapper');
    waterLayer = createGraphics(WIDTH, HEIGHT, WEBGL);
    waterLayer.colorMode(RGB);
    waterLayer.background(0);
    waterLayer.noStroke();

    // Call fetch_colors to initiate the color fetching process
    colors = await fetch_colors();
}

async function changeColor() {
    stepCount++;
    document.getElementById('step').innerText = `${stepCount}/20`;
    document.getElementById('voting').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    document.getElementById('validButton').style.display = 'block';
    document.getElementById('nextButton').style.display = 'none';
    fields.map(field => {
        document.getElementById(`${field}Result`).style.display = `none`;
    });

    console.log('changeColor');
    visualEffects['silentNoisy'] = 0;
    visualEffects['harshHarmonious'] = 0;
    visualEffects['passiveActive'] = 0;
    visualEffects['dullBright'] = 50;
    visualEffects['sugaryBitter'] = 0;
    visualEffects['mildAcid'] = 50;
    visualEffects['coldWarm'] = 0;
    visualEffects['wetDry'] = 0;
    updateBlur();
    resetFormData();
    resetVisualEffects();

    tabColor = await fetch_colors();
}

async function vote(){
    document.getElementById('voting').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    
    await saveData();
    await getAverageValuesForPalette();
    
    visualEffects = averages; 
    updateBlur(); 

    document.getElementById('validButton').style.display = 'none';
    document.getElementById('nextButton').style.display = 'block';
}

//choisir 4 couleurs
async function fetch_colors() {
    // tabColor = [];
    // try {
    //     const randomColor = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

    //     // Fetch color information from The Color API
    //     const response = await fetch(`https://www.thecolorapi.com/scheme?hex=${randomColor}&mode=analogic-complement&count=4`);
    //     const data = await response.json();

    //     // Push colors into the array
    //     colorPalette = data.colors.map(color => color.rgb);
    //     data.colors.forEach(color => console.log('%c' + color.hex.value, `color: ${color.hex.value}`));

    //     document.getElementById('controlPart').style.cssText = `--palette-1: ${data.colors[0].hex.value}; --palette-2: ${data.colors[1].hex.value}; --palette-3: ${data.colors[2].hex.value}; --palette-4: ${data.colors[3].hex.value}`;

    //     return randomColorGrid();

    // } catch (error) {
    //     console.error('Error fetching colors:', error);
    // }

    if(palettes.length == 0){
        // console.log("bien ouej t'as tout noté");
        document.getElementById('controlPart').style.display = 'none';
        document.getElementById('endPart').style.display = 'block';
        return;
    }
    const palette = palettes.pop();
    colorPalette = palette.colors.map(color => {
        return {
            r: parseInt(color.substring(0, 2), 16),
            g: parseInt(color.substring(2, 4), 16),
            b: parseInt(color.substring(4, 6), 16)
        };
    });
    document.getElementById('controlPart').style.cssText = `
    --palette-1: #${palette.colors[0]}; 
    --palette-2: #${palette.colors[1]}; 
    --palette-3: #${palette.colors[2]}; 
    --palette-4: #${palette.colors[3]}`;
    currentPalette = palette.id;
    return randomColorGrid();
}

function randomColorGrid() {
    if (gridSize == 2){
        tabColor = [[colorPalette[0], colorPalette[1]], [colorPalette[2], colorPalette[3]]];
        return tabColor;
    }
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
                if (visualEffects['coldWarm'] > 50) {
                    createDrippingEffect(posX + width / 2, posY + height / 2, randomColor); // Créer des gouttes
                }
                // else{
                //     drawFrostedEdges(posX, posY, width, height, visualEffects['coldWarm']);
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
                drawAcidRectangle(posX, posY, width, height, visualEffects['mildAcid']);
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
    const wetDry = Math.max(visualEffects['wetDry'] - 50, 0);
    waterShader.setUniform('u_resolution', [width, height]);
    waterShader.setUniform('u_time', millis() / 1000.0);
    waterShader.setUniform('u_texture', waterLayer);
    waterShader.setUniform('u_modifier', wetDry / 100);
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
    const silentNoisy = Math.max(visualEffects['silentNoisy'] - 50, 0);
    const vibrationStrength = silentNoisy / 95;
    return random(-vibrationStrength, vibrationStrength); // Vibration aléatoire
}

// function pulse(delta) {
//     const passiveActive = Math.max(visualEffects['passiveActive'] - 50, 0);
//     return sin(delta * 0.01) * passiveActive; // Variation de l'échelle
// }

function danse(xPos, yPos, cellWidth, cellHeight) {
    const passiveActive = Math.max(visualEffects['passiveActive'] - 50, 0);
    waterLayer.translate(xPos + cellWidth / 2, yPos + cellHeight / 2, 0); // Centrer la tuile
    waterLayer.rotateY(frameCount * passiveActive / 1000); // Rotation autour de l'axe Y avec une vitesse différente pour chaque case
    waterLayer.rotateX(frameCount * passiveActive / 1000); // Rotation autour de l'axe X avec une vitesse différente pour chaque case
    // waterLayer.scale(1+ Math.sin(passiveActive / 100) * 10); // Échelle différente pour chaque case
    waterLayer.rectMode(CENTER);
}

function particles(x, y, w, h) {
    const sugaryBitter = Math.max(visualEffects['sugaryBitter'] - 50, 0)
    let numParticles = sugaryBitter / 20; // Nombre de particules
    for (let i = 0; i < numParticles; i++) {
        let px = x + random(-w / 2, w / 2) + w / 2; // Position x aléatoire dans le rectangle
        let py = y + random(-h / 2, h / 2) + h / 2; // Position y aléatoire dans le rectangle
        let size = random(1, 4);

        waterLayer.fill(255, random(200, 255), random(200, 255), random(100, 200));
        waterLayer.noStroke();
        waterLayer.rect(px, py, size, size); // Dessiner la particule
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

function updateBlur() {
    document.body.style.cssText = `--blur-amount: ${visualEffects['harshHarmonious'] / 20}px`;
}