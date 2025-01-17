const body = document.querySelector('body');
const btnStart = document.querySelector('.btn-start');

let cursorIsVisible = true; // Suivi de l'état de visibilité du curseur
const hiddenCursorDistance = 0; // Distance à partir de laquelle le curseur disparaît

body.addEventListener('mousemove', (e) => {
    // Calcul de la distance entre le curseur et le bouton
    const distanceX = e.clientX - btnStart.getBoundingClientRect().left - btnStart.offsetWidth / 2;
    const distanceY = e.clientY - btnStart.getBoundingClientRect().top - btnStart.offsetHeight / 2;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if (distance < hiddenCursorDistance && cursorIsVisible) {
        document.body.style.cursor = 'none'; // Cache le curseur
        cursorIsVisible = false;
        btnStart.classList.add('selected');

    } else if (distance >= hiddenCursorDistance) {
        document.body.style.cursor = 'none'; // Cache le curseur
        cursorIsVisible = true;
        btnStart.classList.remove('selected');

        const trail = document.createElement('div');
        trail.classList.add('trail');
        trail.style.left = `${e.clientX}px`;
        trail.style.top = `${e.clientY}px`;
        document.body.appendChild(trail);

        setTimeout(() => {
            trail.remove();
        }, 1000);

    }
});

// Réactiver le curseur lorsque l'on clique sur le bouton
btnStart.addEventListener('click', () => {
    if (!cursorIsVisible) {
        document.body.style.cursor = 'auto'; // Affiche à nouveau le curseur
        cursorIsVisible = true;
    }
});
