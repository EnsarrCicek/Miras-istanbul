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
        
        console.log('Gelen veri:', data); // Debug için

        const users = data.users; // users listesini al
        if (!users || !Array.isArray(users)) {
            throw new Error('Geçersiz veri formatı');
        }

        const usersList = document.getElementById('usersList');
        usersList.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>
                    <div class="user-profile">
                        <img src="${user.profile_image ? `/uploads/profiles/${user.profile_image}` : '/public/image/default-profile.jpg'}" 
                             alt="${user.username}"
                             onerror="this.src='/public/image/default-profile.jpg'">
                        <span>${user.username}</span>
                    </div>
                </td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${new Date(user.created_at).toLocaleDateString('tr-TR')}</td>
                <td>
                    <span class="user-status active">
                        Aktif
                    </span>
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
        `).join('');

        // Kullanıcı sayısını göster
        const totalUsers = users.length;
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
        const username = row.querySelector('.user-profile span').textContent.toLowerCase();
        const email = row.cells[3].textContent.toLowerCase();
        const status = row.querySelector('.user-status').textContent.toLowerCase();

        const matchesSearch = username.includes(searchTerm) || email.includes(searchTerm);
        const matchesFilter = filterValue === 'all' || 
                            (filterValue === 'active' && status === 'aktif') ||
                            (filterValue === 'inactive' && status === 'inaktif');

        row.style.display = matchesSearch && matchesFilter ? '' : 'none';
    });

    // Görünen kullanıcı sayısını güncelle
    const visibleUsers = document.querySelectorAll('#usersList tr[style=""]').length;
    document.querySelector('.content-header h1').textContent = 
        `Kullanıcı Yönetimi (${visibleUsers} kullanıcı gösteriliyor)`;
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