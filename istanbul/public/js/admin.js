// Form göster/gizle
function showAddForm() {
    document.getElementById('addForm').style.display = 'block';
}

function hideAddForm() {
    document.getElementById('addForm').style.display = 'none';
}

// API base URL'i
const API_BASE_URL = 'http://localhost:8000';

// Düzenleme formunu göster
function showEditForm(concert) {
    const addForm = document.getElementById('addForm');
    const concertForm = document.getElementById('concertForm');
    
    // Form başlığını güncelle
    addForm.querySelector('h2').textContent = 'Konser Düzenle';
    
    // Form alanlarını doldur
    concertForm.querySelector('[name="title"]').value = concert.title;
    concertForm.querySelector('[name="venue"]').value = concert.venue;
    concertForm.querySelector('[name="date"]').value = concert.date;
    concertForm.querySelector('[name="price"]').value = concert.price;
    concertForm.querySelector('[name="description"]').value = concert.description || '';
    concertForm.querySelector('[name="lineup"]').value = concert.lineup || '';
    
    // Form gönderme işlemini güncelle
    concertForm.dataset.mode = 'edit';
    concertForm.dataset.concertId = concert.id;
    
    // Formu göster
    addForm.style.display = 'block';
}

// Konser düzenleme
async function editConcert(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/concerts/${id}`);
        const concert = await response.json();
        showEditForm(concert);
    } catch (error) {
        console.error('Hata:', error);
        alert('Konser bilgileri alınamadı!');
    }
}

// Form gönderme işlemini güncelle
document.getElementById('concertForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const mode = e.target.dataset.mode;
    const concertId = e.target.dataset.concertId;
    
    try {
        let url = `${API_BASE_URL}/api/admin/concerts/`;
        let method = 'POST';
        
        if (mode === 'edit') {
            url = `${API_BASE_URL}/api/admin/concerts/${concertId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method: method,
            body: formData
        });

        if (response.ok) {
            alert(mode === 'edit' ? 'Konser başarıyla güncellendi!' : 'Konser başarıyla eklendi!');
            hideAddForm();
            loadConcerts();
            // Form modunu sıfırla
            e.target.dataset.mode = '';
            e.target.dataset.concertId = '';
        } else {
            const error = await response.json();
            alert('Bir hata oluştu: ' + error.detail);
        }
    } catch (error) {
        console.error('Hata:', error);
        alert('Bir hata oluştu!');
    }
});

// Konserleri yükle
async function loadConcerts() {
    try {
        const response = await fetch('http://localhost:8000/api/concerts/');
        const concerts = await response.json();
        
        const concertsList = document.getElementById('concertsList');
        concertsList.innerHTML = '';
        
        concerts.forEach(concert => {
            // Backend'den gelen görsel yolunu kullan
            const imagePath = `http://localhost:8000${concert.image_path}`;
            
            const concertCard = `
                <div class="concert-card">
                    <div class="concert-image">
                        <img src="${imagePath}" alt="${concert.title}">
                    </div>
                    <div class="concert-info">
                        <h3>${concert.title}</h3>
                        <p><strong>Mekan:</strong> ${concert.venue}</p>
                        <p><strong>Tarih:</strong> ${concert.date}</p>
                        <p><strong>Fiyat:</strong> ${concert.price} TL</p>
                        <div class="concert-actions">
                            <button onclick="editConcert(${concert.id})">
                                <i class="fas fa-edit"></i> Düzenle
                            </button>
                            <button onclick="deleteConcert(${concert.id})">
                                <i class="fas fa-trash"></i> Sil
                            </button>
                        </div>
                    </div>
                </div>
            `;
            concertsList.innerHTML += concertCard;
        });
    } catch (error) {
        console.error('Konserler yüklenirken hata:', error);
        document.getElementById('concertsList').innerHTML = `
            <div class="error-message">
                <p>Konserler yüklenirken bir hata oluştu: ${error.message}</p>
            </div>
        `;
    }
}

// Konser silme
async function deleteConcert(concertId) {
    if (!confirm('Bu konseri silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:8000/api/admin/concerts/${concertId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Konser silinirken bir hata oluştu');
        }
        
        // Konserleri yeniden yükle
        loadConcerts();
        
    } catch (error) {
        console.error('Hata:', error);
        alert('Konser silinirken bir hata oluştu: ' + error.message);
    }
}

// Kullanıcıları yükle
async function loadUsers() {
    try {
        const response = await fetch('http://localhost:8000/api/admin/users');
        const data = await response.json();
        
        console.log('Gelen veri:', data);

        const users = data.users;
        if (!users || !Array.isArray(users)) {
            throw new Error('Geçersiz veri formatı');
        }

        const usersList = document.getElementById('usersList');
        usersList.innerHTML = users.map(user => {
            // Sadece backend'den gelen profil fotoğrafını kullan
            const profileImage = user.profile_image 
                ? `http://localhost:8000${user.profile_image}`
                : '';

            return `
            <tr>
                <td>${user.id}</td>
                <td>
                    <div class="user-profile">
                        ${profileImage ? `<img src="${profileImage}" 
                             alt="${user.username}"
                             style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">` : ''}
                        <span>${user.username}</span>
                    </div>
                </td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${new Date(user.created_at).toLocaleDateString('tr-TR')}</td>
                <td>
                    <span class="user-status active">Aktif</span>
                </td>
                <td>
                    <div class="user-actions">
                        <button class="edit" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i> Düzenle
                        </button>
                        <button class="delete" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash"></i> Sil
                        </button>
                    </div>
                </td>
            </tr>
        `}).join('');

        // Kullanıcı sayısını göster
        const totalUsers = users.length;
        document.querySelector('.users-section h1').textContent = 
            `Kullanıcı Yönetimi (${totalUsers} kullanıcı)`;

    } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: #e74c3c; padding: 20px;">
                    <i class="fas fa-exclamation-circle"></i>
                    Kullanıcılar yüklenirken bir hata oluştu: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // Admin kontrolü
    const isAdmin = localStorage.getItem('isAdmin');
    const adminUsername = localStorage.getItem('adminUsername');
    
    if (!isAdmin || !adminUsername) {
        window.location.href = '../login.html';
        return;
    }

    // Kullanıcıları yükle
    loadUsers();

    // Event listener'ları ayarla
    setupEventListeners();
});

// Event listener'ları ayarla
function setupEventListeners() {
    // Arama
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterUsers);
    }

    // Filtre
    const filterSelect = document.getElementById('userFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', filterUsers);
    }

    // Çıkış butonu
    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('adminUsername');
            window.location.href = '../index1.html';
        });
    }
}

// Kullanıcıları filtrele
function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const filterValue = document.getElementById('userFilter').value;
    const rows = document.querySelectorAll('#usersList tr');

    rows.forEach(row => {
        const username = row.querySelector('.user-profile span').textContent.toLowerCase();
        const email = row.cells[3].textContent.toLowerCase();
        const status = row.querySelector('.user-status').textContent.toLowerCase();

        const matchesSearch = username.includes(searchTerm) || email.includes(searchTerm);
        const matchesFilter = filterValue === 'all' || 
                            (filterValue === 'active' && status === 'aktif') ||
                            (filterValue === 'inactive' && status === 'inaktif');

        row.style.display = matchesSearch && matchesFilter ? '' : 'none';
    });
}

// Bölüm gösterme fonksiyonu
function showSection(sectionName) {
    // Tüm bölümleri gizle
    document.querySelectorAll('.admin-content > div').forEach(div => {
        div.style.display = 'none';
    });

    // İlgili bölümü göster
    if (sectionName === 'users') {
        document.querySelector('.users-section').style.display = 'block';
        loadUsers(); // Kullanıcıları yükle
    }
    // ... diğer bölümler için kontroller
} 