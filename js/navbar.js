const hamburgerIcon = document.getElementById('hamburger-icon');
const navLinks = document.getElementById('nav-links');

hamburgerIcon.addEventListener('click', () => {
    if (navLinks.style.display === 'none' || navLinks.style.display === '') {
        navLinks.style.display = 'flex';
    } else {
        navLinks.style.display = 'none';
    }
});

