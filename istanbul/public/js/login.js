let adminPanelShown = false;
let keySequence = '';
const secretCode = 'admin123'; // Gizli kod

document.addEventListener('keydown', (e) => {
    keySequence += e.key;
    if (keySequence.includes(secretCode)) {
        showAdminPanel();
        keySequence = '';
    }
    // Son 10 karakteri tut
    if (keySequence.length > 10) {
        keySequence = keySequence.slice(-10);
    }
});

function showAdminPanel() {
    const adminSection = document.querySelector('.login-section.admin');
    if (!adminPanelShown) {
        adminSection.style.display = 'block';
        adminPanelShown = true;
    }
} 