let osc;
let colors = [];
let slider; // Slider pour contrôler l'interaction
let margin = 50;
let vibrationStrength = 0;
let soundStarted = false; // Pour gérer l'activation du son
let sliderValue = 0; // Valeur actuelle du slider

function setup() {
    createCanvas(800, 200); // Taille du canevas
    noStroke(); // Pas de contour

    // Palette de couleurs
    colors = [
        color(78, 121, 167),   // Bleu azur
        color(242, 142, 43),   // Orange doux
        color(144, 190, 109),  // Vert menthe
        color(233, 110, 167)   // Rose pastel
    ];

    // Création d'un slider horizontal
    slider = createSlider(0, 1, 0, 0.01); // Slider allant de 0 à 1
    slider.position(margin, height + 20); // Positionner le slider sous le canevas
    slider.size(width - 2 * margin); // Taille du slider

    // Initialisation de l'oscillateur (son)
    osc = new p5.Oscillator('sine'); // Onde sinusoïdale
    osc.start(); // Démarrer l'oscillateur par défaut
    osc.amp(0); // Son éteint au départ
}

function draw() {
    background(255); // Fond blanc

    // Récupérer la valeur du slider
    sliderValue = slider.value(); // Valeur actuelle du slider (de 0 à 1)

    // Dessiner un dégradé fluide entre les couleurs
    drawGradient();

    // Ajuster le son en fonction du slider
    let frequency = map(sliderValue, 0, 1, 100, 1000); // De 100 Hz à 1000 Hz
    let amplitude = map(sliderValue, 0, 1, 0, 1); // Volume de 0 à 1
    osc.freq(frequency); // Mettre à jour la fréquence du son
    osc.amp(amplitude); // Mettre à jour l'amplitude (volume)

    // Appliquer les vibrations
    applyVibrations(sliderValue);
}

// Fonction pour dessiner un dégradé horizontal fluide entre les couleurs
function drawGradient() {
    let gradientWidth = width - 2 * margin; // Largeur totale pour le dégradé
    let numColors = colors.length;
    
    // Si le slider est à zéro, les couleurs ne sont pas mélangées
    if (sliderValue === 0) {
        // Juste dessiner les couleurs sans dégradé
        for (let i = 0; i < numColors; i++) {
            fill(colors[i]);
            noStroke();
            let xPos = map(i, 0, numColors, margin, width - margin); // Position horizontale de chaque couleur
            rect(xPos, margin, gradientWidth / numColors, height - 2 * margin); // Dessiner la couleur
        }
    } else {
        // Si le slider est > 0, dessiner un dégradé fluide
        for (let i = 0; i < numColors - 1; i++) {
            let x1 = map(i, 0, numColors - 1, margin, width - margin); // Position du premier côté du dégradé
            let x2 = map(i + 1, 0, numColors - 1, margin, width - margin); // Position du deuxième côté du dégradé

            // Interpoler les couleurs en fonction du slider
            let c1 = colors[i];
            let c2 = colors[i + 1];
            for (let x = x1; x < x2; x++) {
                let interColor = lerpColor(c1, c2, map(x, x1, x2, 0, sliderValue)); // Interpolation des couleurs
                stroke(interColor);
                line(x, margin, x, height - margin); // Dessiner chaque ligne verticale du dégradé
            }
        }

        // Dessiner la dernière couleur de manière uniforme
        fill(colors[numColors - 1]);
        noStroke();
        let lastXPos = map(numColors - 1, 0, numColors, margin, width - margin); // Position de la dernière couleur
        rect(lastXPos, margin, gradientWidth / numColors, height - 2 * margin); // Dernière couleur
    }
}

// Appliquer des vibrations aux couleurs en fonction de la valeur du slider
function applyVibrations(sliderValue) {
    // Calcul de la force des vibrations
    vibrationStrength = map(sliderValue, 0, 1, 0, 15);

    // Parcours de chaque couleur pour appliquer un décalage
    for (let i = 0; i < colors.length; i++) {
        let xOffset = random(-vibrationStrength, vibrationStrength); // Vibration aléatoire
        let yOffset = random(-vibrationStrength, vibrationStrength); // Vibration aléatoire

        let xPos = map(i, 0, colors.length, margin, width - margin); // Position horizontale de chaque couleur
        let color = colors[i];
        
        // Appliquer la vibration en déplaçant la couleur
        fill(color);
        rect(xPos + xOffset, margin + yOffset, (width - 2 * margin) / colors.length, height - 2 * margin);
    }
}
