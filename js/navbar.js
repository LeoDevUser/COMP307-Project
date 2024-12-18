/* Alexandros Contomichalos 261039376*/


const hamburgerIcon = document.getElementById('hamburger-icon');
const navLinks = document.getElementById('nav-links');

hamburgerIcon.addEventListener('click', () => {
    if (navLinks.style.display === 'none' || navLinks.style.display === '') {
        navLinks.style.display = 'flex';
    } else {
        navLinks.style.display = 'none';
    }
});

function adjustNavLinksDisplay() {
    const navLinks = document.querySelector('.nav-links');
    const mediaQuery = window.matchMedia('(min-width: 650px)');
    navLinks.style.display = mediaQuery.matches ? 'flex' : '';
}

window.addEventListener('resize', adjustNavLinksDisplay);


