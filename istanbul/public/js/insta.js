document.addEventListener('DOMContentLoaded', () => {
    const isAdmin = localStorage.getItem('isAdmin');
    const adminUsername = localStorage.getItem('adminUsername');
    
    if (!isAdmin || !adminUsername) {
        window.location.href = 'login.html';
        return;
    }

    loadUsers();
    setupEventListeners();
});

// Çıkış işlemi
document.querySelector('.logout').addEventListener('click', () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminUsername');
    window.location.href = 'index1.html';
});

// Kullanıcıları yükle
async function loadUsers() {
    try {
        const response = await fetch('http://localhost:8000/api/admin/users');
        const data = await response.json();
        
        if (!data || !data.users) {
            throw new Error('Sunucudan veri alınamadı');
        }

        const usersList = document.getElementById('usersList');
        usersList.innerHTML = data.users.map(user => createUserRow(user)).join('');

        // Kullanıcı sayısını göster
        const totalUsers = data.users.length;
        document.querySelector('.content-header h1').textContent = 
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

// Periyodik olarak kullanıcı listesini güncelle (her 30 saniyede bir)
setInterval(loadUsers, 30000);

// Event listener'ları ayarla
function setupEventListeners() {
    // Arama
    const searchInput = document.getElementById('userSearch');
    searchInput.addEventListener('input', filterUsers);

    // Filtre
    const filterSelect = document.getElementById('userFilter');
    filterSelect.addEventListener('change', filterUsers);

    // Modal kapatma
    const modal = document.getElementById('editUserModal');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('.cancel');

    closeBtn.onclick = () => modal.style.display = "none";
    cancelBtn.onclick = () => modal.style.display = "none";
    
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

// Kullanıcıları filtrele
function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const filterValue = document.getElementById('userFilter').value;
    const rows = document.querySelectorAll('#usersList tr');

    rows.forEach(row => {
        // Hata kontrolü ekleyelim
        const usernameCell = row.querySelector('td:nth-child(3)'); // Username hücresi
        const emailCell = row.querySelector('td:nth-child(4)'); // Email hücresi
        const statusBadge = row.querySelector('.status-badge'); // Status badge

        if (!usernameCell || !emailCell || !statusBadge) return; // Eğer gerekli elementler yoksa, bu satırı atla

        const username = usernameCell.textContent.toLowerCase();
        const email = emailCell.textContent.toLowerCase();
        const status = statusBadge.textContent.toLowerCase();

        const matchesSearch = username.includes(searchTerm) || email.includes(searchTerm);
        const matchesFilter = filterValue === 'all' || 
                            (filterValue === 'active' && status === 'aktif') ||
                            (filterValue === 'inactive' && status === 'inaktif');

        row.style.display = matchesSearch && matchesFilter ? '' : 'none';
    });

    // Görünen kullanıcı sayısını güncelle
    const visibleUsers = Array.from(rows).filter(row => row.style.display !== 'none').length;
    const headerTitle = document.querySelector('.content-header h1');
    if (headerTitle) {
        headerTitle.textContent = `Kullanıcı Yönetimi (${visibleUsers} kullanıcı gösteriliyor)`;
    }
}

// Kullanıcı düzenleme
async function editUser(userId) {
    try {
        const response = await fetch(`http://localhost:8000/api/admin/users/${userId}`);
        const user = await response.json();

        const modal = document.getElementById('editUserModal');
        const form = document.getElementById('editUserForm');

        form.username.value = user.username;
        form.email.value = user.email;
        form.status.value = user.is_active ? 'active' : 'inactive';

        modal.style.display = "block";

        form.onsubmit = async (e) => {
            e.preventDefault();
            try {
                const response = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: form.username.value,
                        email: form.email.value,
                        is_active: form.status.value === 'active'
                    })
                });

                if (response.ok) {
                    modal.style.display = "none";
                    loadUsers();
                }
            } catch (error) {
                console.error('Kullanıcı güncellenirken hata:', error);
            }
        };
    } catch (error) {
        console.error('Kullanıcı bilgileri alınırken hata:', error);
    }
}

// Kullanıcı silme
async function deleteUser(userId) {
    if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
        try {
            const response = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadUsers();
            }
        } catch (error) {
            console.error('Kullanıcı silinirken hata:', error);
        }
    }
}

function createUserRow(user) {
    // Profil fotoğrafı yolunu düzelt
    let profileContent;
    
    if (user.profile_image) {
        // Profil fotoğrafı varsa
        const profileImageUrl = `http://localhost:8000${user.profile_image}`;
        profileContent = `<img src="${profileImageUrl}" alt="${user.username}" onerror="this.onerror=null; this.src='http://localhost:8000/static/image/default-profile.jpg';">`;
    } else {
        // Profil fotoğrafı yoksa varsayılan ikon
        profileContent = `<div class="default-avatar">
            <i class="fas fa-user"></i>
        </div>`;
    }

    return `
        <tr>
            <td>${user.id}</td>
            <td class="user-profile">
                ${profileContent}
            </td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${new Date(user.created_at).toLocaleDateString('tr-TR')}</td>
            <td>
                <span class="status-badge ${user.is_active ? 'active' : 'inactive'}">
                    ${user.is_active ? 'Aktif' : 'İnaktif'}
                </span>
            </td>
            <td class="actions">
                <button onclick="editUser(${user.id})" class="edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteUser(${user.id})" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
} 