document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const dropdownContent = document.querySelector('.dropdown-content');
    const dropdownIcon = document.querySelector('.dropdown-icon');

    if (username) {
        // Kullanıcı giriş yapmışsa
        dropdownIcon.className = 'fa-solid fa-user dropdown-icon';
        dropdownIcon.title = `Hoş geldin, ${username}`;
        
        dropdownContent.innerHTML = `
            <a href="profile.html">Profilim</a>
            <a href="add.html">Senin Manzaran</a>
            <a href="gallery.html">Galeri</a>
            <a href="gecmis.html">Tarihte Bugün "İstanbul"</a>
            <a href="#" onclick="logout()">Çıkış Yap</a>
        `;
    } else {
        // Kullanıcı giriş yapmamışsa
        dropdownIcon.className = 'fa-solid fa-layer-group dropdown-icon';
        
        dropdownContent.innerHTML = `
            <a href="register.html">Kayıt Ol</a>
            <a href="login.html">Giriş Yap</a>
            <a href="add.html">Senin Manzaran</a>
            <a href="gallery.html">Galeri</a>
            <a href="gecmis.html">Tarihte Bugün "İstanbul"</a>
        `;
    }
});

// Çıkış yapma fonksiyonu
function logout() {
    localStorage.removeItem('username');
    window.location.href = 'index1.html';
} 