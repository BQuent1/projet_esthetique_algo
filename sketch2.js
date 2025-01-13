let colors = [];
let margin = 60;
let cols = 6;
let rows = 4;
let cellWidth, cellHeight;
let gridColors = []; // Tableau pour stocker les couleurs des cellules

function setup() {
    createCanvas(800, 800, WEBGL); // Mode 3D activé avec WEBGL
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

    // Initialisation du tableau des couleurs de la grille
    for (let y = 0; y < rows; y++) {
        gridColors[y] = [];
        for (let x = 0; x < cols; x++) {
            gridColors[y][x] = null; // Valeur par défaut
        }
    }
}

function draw() {
    background(240);

    // Décaler l'origine pour centrer la grille
    translate(-width / 2 + margin, -height / 2 + margin);

    // Parcours de la grille
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // Obtenir les couleurs possibles pour cette cellule
            let availableColors = colors.slice();

            // Vérifier la cellule au-dessus
            if (y > 0) {
                let aboveColor = gridColors[y - 1][x];
                availableColors = availableColors.filter(c => c !== aboveColor);
            }

            // Vérifier la cellule à gauche
            if (x > 0) {
                let leftColor = gridColors[y][x - 1];
                availableColors = availableColors.filter(c => c !== leftColor);
            }

            // Choisir une couleur aléatoire parmi les disponibles
            let chosenColor = random(availableColors);
            gridColors[y][x] = chosenColor;

            // Calcul des coordonnées de la cellule
            let xPos = x * cellWidth;
            let yPos = y * cellHeight;

            // Dessiner et pivoter la tuile
            push(); // Sauvegarder le contexte
            translate(xPos + cellWidth / 2, yPos + cellHeight / 2, 0); // Centrer la tuile
            rotateY(frameCount * 0.1); // Rotation autour de l'axe Y
            noStroke();
            fill(chosenColor);
            rectMode(CENTER);
            rect(0, 0, cellWidth, cellHeight); // Taille de la tuile (réduite pour espacement)
            pop(); // Restaurer le contexte
        }
    }
}
