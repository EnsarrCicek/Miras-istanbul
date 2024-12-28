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

// Admin girişi
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('adminUsernameInput').value;
    const password = document.getElementById('adminPasswordInput').value;

    try {
        const response = await fetch('http://localhost:8000/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password,
                email: username === 'Ensar' ? 'admin@example.com' : 'hatice@example.com'
            })
        });

        const data = await response.json();
        console.log('Server response:', data); // Debug için log ekleyelim
        
        if (response.ok) {
            localStorage.setItem('isAdmin', 'true');
            localStorage.setItem('adminUsername', username);
            window.location.href = 'admin/index.html';
        } else {
            alert('Admin bilgileri hatalı: ' + data.detail);
        }
    } catch (error) {
        console.error('Giriş hatası:', error);
        alert('Giriş yapılırken bir hata oluştu!');
    }
}); 