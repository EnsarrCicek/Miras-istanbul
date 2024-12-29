document.addEventListener('DOMContentLoaded', async () => {
    // Kullanıcı kontrolü
    const username = localStorage.getItem('username');
    if (!username) {
        window.location.href = 'login.html';
        return;
    }

    // Kullanıcı bilgilerini yükle
    loadUserProfile();
    loadUserMedia();
    loadMessages();

    // Tab değiştirme işlevi
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchTab(tabName);
        });
    });
});

// Kullanıcı profil bilgilerini yükle
async function loadUserProfile() {
    try {
        const response = await fetch(`http://localhost:8000/api/kullanici/profile`, {
            headers: {
                'username': localStorage.getItem('username')
            }
        });
        const data = await response.json();

        // Profil bilgilerini güncelle
        document.getElementById('username').textContent = data.username;
        
        // Profil fotoğrafı yolunu kontrol et ve güncelle
        const profileImage = document.getElementById('profileImage');
        if (data.profile_image) {
            profileImage.src = `http://localhost:8000${data.profile_image}`;
        } else {
            profileImage.src = '/image/default-profile.jpg';
        }

        document.getElementById('bio').querySelector('p').textContent = data.bio || 'Henüz biyografi eklenmemiş...';
        document.getElementById('postCount').textContent = data.post_count || 0;
        document.getElementById('followerCount').textContent = data.follower_count || 0;
        document.getElementById('followingCount').textContent = data.following_count || 0;

    } catch (error) {
        console.error('Profil yüklenirken hata:', error);
    }
}

// Kullanıcının medya içeriklerini yükle
async function loadUserMedia() {
    try {
        const response = await fetch(`http://localhost:8000/api/kullanici/media`, {
            headers: {
                'username': localStorage.getItem('username')
            }
        });
        const media = await response.json();

        const mediaGrid = document.querySelector('.media-grid');
        mediaGrid.innerHTML = '';

        media.forEach(item => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';

            if (item.media_type === 'photo') {
                mediaItem.innerHTML = `
                    <img src="${item.file_path}" alt="${item.caption || ''}">
                    <div class="media-overlay">
                        <p>${item.caption || ''}</p>
                    </div>
                `;
            } else {
                mediaItem.innerHTML = `
                    <video src="${item.file_path}" controls></video>
                    <div class="media-overlay">
                        <p>${item.caption || ''}</p>
                    </div>
                `;
            }

            mediaGrid.appendChild(mediaItem);
        });

    } catch (error) {
        console.error('Medya yüklenirken hata:', error);
    }
}

// Mesajları yükle
async function loadMessages() {
    try {
        const response = await fetch(`http://localhost:8000/api/kullanici/messages`, {
            headers: {
                'username': localStorage.getItem('username')
            }
        });
        const messages = await response.json();

        const messagesContainer = document.querySelector('.messages-container');
        messagesContainer.innerHTML = messages.map(msg => `
            <div class="message ${msg.sender_id === localStorage.getItem('userId') ? 'sent' : 'received'}">
                <div class="message-header">
                    <span class="message-sender">${msg.sender_username}</span>
                    <span class="message-time">${new Date(msg.created_at).toLocaleString()}</span>
                </div>
                <div class="message-content">${msg.message}</div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Mesajlar yüklenirken hata:', error);
    }
}

// Biyografi düzenleme
function editBio() {
    const bioText = document.querySelector('#bio p').textContent;
    const bioElement = document.querySelector('#bio');
    
    bioElement.innerHTML = `
        <textarea id="bioInput">${bioText}</textarea>
        <div class="bio-buttons">
            <button onclick="saveBio()">Kaydet</button>
            <button onclick="cancelBio()">İptal</button>
        </div>
    `;
}

// Biyografi kaydetme
async function saveBio() {
    const newBio = document.getElementById('bioInput').value;
    
    try {
        const formData = new FormData();
        formData.append('bio', newBio);

        const response = await fetch('http://localhost:8000/api/kullanici/update-bio', {
            method: 'POST',
            headers: {
                'username': localStorage.getItem('username')
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            document.querySelector('#bio').innerHTML = `
                <p>${data.bio}</p>
                <button class="edit-btn" onclick="editBio()">
                    <i class="fas fa-edit"></i> Düzenle
                </button>
            `;
            alert('Biyografi başarıyla güncellendi!');
        } else {
            const errorData = await response.json();
            alert('Hata: ' + (errorData.detail || 'Bilinmeyen bir hata oluştu'));
        }
    } catch (error) {
        console.error('Biyografi güncellenirken hata:', error);
        alert('Biyografi güncellenirken bir hata oluştu!');
    }
}

// Biyografi düzenlemeyi iptal et
function cancelBio() {
    loadUserProfile(); // Profili yeniden yükle
}

// Medya yükleme modalını göster
function showUploadModal() {
    document.getElementById('uploadModal').style.display = 'block';
}

// Modalı kapat
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('uploadModal').style.display = 'none';
});

// Medya yükleme
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    const files = document.getElementById('mediaInput').files;
    const caption = document.querySelector('#uploadForm textarea').value;

    for (let file of files) {
        formData.append('media', file);
    }
    formData.append('caption', caption);

    try {
        const response = await fetch('http://localhost:8000/api/kullanici/upload-media', {
            method: 'POST',
            headers: {
                'username': localStorage.getItem('username')
            },
            body: formData
        });

        if (response.ok) {
            document.getElementById('uploadModal').style.display = 'none';
            loadUserMedia(); // Medya gridini yenile
        }
    } catch (error) {
        console.error('Medya yüklenirken hata:', error);
    }
});

// Tab değiştirme
function switchTab(tabName) {
    // Tüm tab içeriklerini gizle
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });

    // Tüm tab butonlarından active sınıfını kaldır
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Seçili tab'ı göster ve butonunu aktif yap
    document.getElementById(tabName).style.display = 'block';
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// Profil fotoğrafı yükleme işlemleri
document.getElementById('profileImageInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_image', file);

    try {
        const response = await fetch('http://localhost:8000/api/kullanici/update-profile-image', {
            method: 'POST',
            headers: {
                'username': localStorage.getItem('username')
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            // Profil fotoğrafını güncelle
            document.getElementById('profileImage').src = data.profile_image;
            alert('Profil fotoğrafı başarıyla güncellendi!');
        } else {
            const errorData = await response.json();
            alert('Hata: ' + (errorData.detail || 'Bilinmeyen bir hata oluştu'));
        }
    } catch (error) {
        console.error('Profil fotoğrafı yüklenirken hata:', error);
        alert('Profil fotoğrafı yüklenirken bir hata oluştu!');
    }
});

// Profil fotoğrafı yükleme alanını aktifleştir
document.querySelector('.edit-overlay').addEventListener('click', () => {
    document.getElementById('profileImageInput').click();
});

// Takip butonunu kontrol et ve göster/gizle
function checkFollowButton(profileUsername) {
    const currentUser = localStorage.getItem('username');
    const followButton = document.getElementById('followButton');
    
    if (!currentUser || currentUser === profileUsername) {
        // Kendi profiliyse veya giriş yapılmamışsa butonu gizle
        followButton.style.display = 'none';
        return;
    }

    // Takip durumunu kontrol et
    checkFollowStatus(profileUsername);
}

// Takip durumunu kontrol et
async function checkFollowStatus(profileUsername) {
    try {
        const response = await fetch(`http://localhost:8000/api/kullanici/follow-status/${profileUsername}`, {
            headers: {
                'username': localStorage.getItem('username')
            }
        });
        const data = await response.json();
        
        const followButton = document.getElementById('followButton');
        if (data.is_following) {
            followButton.classList.add('following');
            followButton.querySelector('span').textContent = 'Takip Ediliyor';
        } else {
            followButton.classList.remove('following');
            followButton.querySelector('span').textContent = 'Takip Et';
        }
    } catch (error) {
        console.error('Takip durumu kontrol edilirken hata:', error);
    }
}

// Takip et/bırak işlemi
document.getElementById('followButton').addEventListener('click', async () => {
    const profileUsername = document.getElementById('username').textContent;
    const followButton = document.getElementById('followButton');
    const isFollowing = followButton.classList.contains('following');
    
    try {
        const response = await fetch('http://localhost:8000/api/kullanici/follow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'username': localStorage.getItem('username')
            },
            body: JSON.stringify({
                target_username: profileUsername,
                action: isFollowing ? 'unfollow' : 'follow'
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Takipçi sayısını güncelle
            loadUserProfile();
            // Buton durumunu güncelle
            checkFollowStatus(profileUsername);
        } else {
            alert('Hata: ' + (data.detail || 'Bilinmeyen bir hata oluştu'));
        }
    } catch (error) {
        console.error('Takip işlemi sırasında hata:', error);
        alert('İşlem sırasında bir hata oluştu!');
    }
}); 