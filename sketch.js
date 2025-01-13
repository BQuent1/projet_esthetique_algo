function setup() {
    createCanvas(800, 800);
    noLoop();
    colorMode(RGB);
    background(255);
}

function draw() {
    // Définition des couleurs
    let colors = [
        color(166, 119, 98),
        color(205, 206, 211),
        color(237, 210, 121),
        color(50, 74, 118),
        color(214, 185, 167),
        color(133, 109, 58)
    ];

    let margin = 60; // Marge autour de la grille
    let cols = 6;    // Nombre de colonnes
    let rows = 4;    // Nombre de lignes

    // Taille des cellules en fonction de la marge
    let cellWidth = (width - 2 * margin) / cols;
    let cellHeight = (height - 2 * margin) / rows;

    noStroke();

    // Parcours de la grille
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let randomColor = random(colors); // Choisir une couleur aléatoire

            while (randomColor == colors[y - 1]) { // Si la couleur est la couleur de fond
                randomColor = random(colors); // Choisir une autre couleur

            }
            fill(randomColor);
            // Dessiner le rectangle avec une marge autour
            rect(
                margin + x * cellWidth,
                margin + y * cellHeight,
                cellWidth,
                cellHeight
            );
        }
    }
}
