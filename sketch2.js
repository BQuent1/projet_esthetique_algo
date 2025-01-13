let colors = [];
let margin = 60;
let cols = 6;
let rows = 4;
let cellWidth, cellHeight;
let gridColors = []; // Tableau pour stocker les couleurs des cellules
let vitesseArray = []; // Tableau pour stocker la vitesse des cellules
let vitesse2Array = []; // Tableau pour stocker la vitesse2 des cellules

function setup() {
    createCanvas(600, 600, WEBGL); // Mode 3D activé avec WEBGL
    colorMode(RGB);
    background(255);

    // Définition des couleurs
    colors = [
        color(166, 119, 98),
        color(205, 206, 211),
        color(237, 210, 121),
        color(50, 74, 118),
        color(214, 185, 167),
        color(133, 109, 58)
    ];

    // Calcul des tailles des cellules
    cellWidth = (width - 2 * margin) / cols;
    cellHeight = (height - 2 * margin) / rows;

    // Initialisation du tableau des couleurs de la grille et des vitesses
    for (let y = 0; y < rows; y++) {
        gridColors[y] = [];
        vitesseArray[y] = [];
        vitesse2Array[y] = [];
        for (let x = 0; x < cols; x++) {
            // Choisir une couleur aléatoire parmi les couleurs disponibles pour chaque cellule
            let availableColors = colors.slice();

            // Vérifier la cellule au-dessus (si elle existe)
            if (y > 0) {
                let aboveColor = gridColors[y - 1][x];
                availableColors = availableColors.filter(c => c !== aboveColor); // Exclure la couleur du dessus
            }

            // Vérifier la cellule à gauche (si elle existe)
            if (x > 0) {
                let leftColor = gridColors[y][x - 1];
                availableColors = availableColors.filter(c => c !== leftColor); // Exclure la couleur de gauche
            }

            // Choisir une couleur parmi les couleurs restantes
            let chosenColor = random(availableColors);
            gridColors[y][x] = chosenColor; // Stocker la couleur choisie pour cette cellule

            // Assigner une vitesse aléatoire pour chaque cellule
            vitesseArray[y][x] = random(0.01, 0.1); // Vitesse pour l'axe Y
            vitesse2Array[y][x] = random(0.01, 0.1); // Vitesse pour l'axe X
        }
    }
}

function draw() {
    background(255);

    // Calculer les décalages en fonction de la position de la souris
    let mouseOffsetX = map(mouseX, 0, width, -50, 50); // Décalage horizontal
    let mouseOffsetY = map(mouseY, 0, height, -50, 50); // Décalage vertical

    // Décaler l'origine pour centrer la grille
    translate(-width / 2 + margin + mouseOffsetX, -height / 2 + margin + mouseOffsetY);

    // Parcours de la grille et dessin des cellules
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {

            // Récupérer la couleur et la vitesse déjà déterminées pour cette cellule
            let chosenColor = gridColors[y][x];
            let vitesseLocal = vitesseArray[y][x];
            let vitesse2Local = vitesse2Array[y][x];

            // Calcul des coordonnées de la cellule
            let xPos = x * cellWidth;
            let yPos = y * cellHeight;

            // Dessiner et pivoter la tuile
            push(); // Sauvegarder le contexte
            translate(xPos + cellWidth / 2, yPos + cellHeight / 2, 0); // Centrer la tuile
            rotateY((frameCount + random(0, 0.9)) * vitesseLocal); // Rotation autour de l'axe Y avec une vitesse différente pour chaque case
            rotateX(frameCount * vitesse2Local); // Rotation autour de l'axe X avec une vitesse différente pour chaque case
            noStroke();
            fill(chosenColor); // Appliquer la couleur définie
            rectMode(CENTER);
            rect(0, 0, cellWidth - 10, cellHeight - 10); // Taille de la tuile
            pop(); // Restaurer le contexte
        }
    }
}
