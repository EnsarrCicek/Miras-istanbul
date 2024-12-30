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
        
        // Profil fotoğrafını veritabanından al
        const profileImage = document.getElementById('profileImage');
        if (data.profile_image) {
            profileImage.src = `http://localhost:8000${data.profile_image}`;
        }
        
        // Profil fotoğrafı yüklenemezse tekrar dene
        profileImage.onerror = async function() {
            console.error('Profil fotoğrafı yüklenemedi:', data.profile_image);
        };

        // Diğer profil bilgilerini güncelle
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
            mediaItem.dataset.mediaId = item.id;

            // file_path'den public kısmını kaldır
            const imagePath = item.file_path.replace('/public', '');
            
            mediaItem.innerHTML = `
                <img src="http://localhost:8000${imagePath}" alt="${item.title || ''}">
                <div class="media-stats">
                    <span>
                        <i class="fas fa-heart"></i> ${item.like_count || 0}
                    </span>
                    <span>
                        <i class="fas fa-comment"></i> ${item.comment_count || 0}
                    </span>
                </div>
            `;

            mediaGrid.appendChild(mediaItem);
        });

        // Medya öğelerine tıklama olayı ekle
        document.querySelectorAll('.media-item').forEach(item => {
            item.addEventListener('click', () => {
                openMediaModal(item.dataset.mediaId);
            });
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
    
    const formData = new FormData(e.target);
    const currentUser = localStorage.getItem('username');
    
    try {
        const response = await fetch('http://localhost:8000/api/kullanici/upload-media', {
            method: 'POST',
            headers: {
                'username': currentUser
            },
            body: formData
        });

        if (response.ok) {
            document.getElementById('uploadModal').style.display = 'none';
            // Medya gridini yenile
            loadUserMedia();
            // Formu temizle
            e.target.reset();
            alert('Gönderi başarıyla paylaşıldı!');
        } else {
            const error = await response.json();
            alert('Hata: ' + (error.detail || 'Gönderi paylaşılırken bir hata oluştu'));
        }
    } catch (error) {
        console.error('Medya yüklenirken hata:', error);
        alert('Gönderi paylaşılırken bir hata oluştu!');
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

// Modal açma fonksiyonu
async function openMediaModal(mediaId) {
    try {
        const response = await fetch(`http://localhost:8000/api/media/${mediaId}`);
        const data = await response.json();

        const modal = document.getElementById('mediaModal');
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalAuthor = document.getElementById('modalAuthor');
        const likeBtn = modal.querySelector('.like-btn');
        const likeCount = modal.querySelector('.like-count');
        const commentCount = modal.querySelector('.comment-count');

        // Resim yolunu düzelt
        const imagePath = data.file_path.replace('/public', '');
        modalImage.src = `http://localhost:8000${imagePath}`;
        modalTitle.textContent = data.title;
        modalAuthor.textContent = data.author;
        likeCount.textContent = data.like_count || 0;
        commentCount.textContent = data.comment_count || 0;

        // Like butonuna mediaId'yi ekle
        likeBtn.dataset.mediaId = mediaId;

        // Yorumları yükle
        await loadComments(mediaId);

        modal.classList.add('active');
    } catch (error) {
        console.error('Modal açılırken hata:', error);
    }
}

// Beğeni işlemi
async function likeMedia(mediaId) {
    if (!mediaId) {
        console.error('Media ID bulunamadı');
        return;
    }

    try {
        const response = await fetch(`http://localhost:8000/api/media/${mediaId}/like`, {
            method: 'POST',
            headers: {
                'username': localStorage.getItem('username')
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Modal içindeki like sayısını güncelle
            document.querySelector('.media-modal .like-count').textContent = data.like_count;
            // Grid içindeki like sayısını güncelle
            const gridItem = document.querySelector(`[data-media-id="${mediaId}"] .like-count`);
            if (gridItem) {
                gridItem.textContent = data.like_count;
            }
        }
    } catch (error) {
        console.error('Beğeni işlemi sırasında hata:', error);
    }
}

// Yorum gönderme
async function submitComment(event) {
    event.preventDefault();
    const modal = document.getElementById('mediaModal');
    const mediaId = modal.querySelector('.like-btn').dataset.mediaId;
    const commentInput = modal.querySelector('.comment-input');
    const comment = commentInput.value.trim();

    if (!comment || !mediaId) return;

    try {
        const formData = new FormData();
        formData.append('comment', comment);

        const response = await fetch(`http://localhost:8000/api/media/${mediaId}/comment`, {
            method: 'POST',
            headers: {
                'username': localStorage.getItem('username')
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            commentInput.value = '';
            // Yorumları yeniden yükle
            await loadComments(mediaId);
            // Yorum sayılarını güncelle
            document.querySelector('.media-modal .comment-count').textContent = data.comment_count;
            const gridItem = document.querySelector(`[data-media-id="${mediaId}"] .comment-count`);
            if (gridItem) {
                gridItem.textContent = data.comment_count;
            }
        }
    } catch (error) {
        console.error('Yorum gönderilirken hata:', error);
    }
}

// Yorumları yükle
async function loadComments(mediaId) {
    try {
        const response = await fetch(`http://localhost:8000/api/media/${mediaId}/comments`);
        const comments = await response.json();

        const commentsSection = document.getElementById('comments');
        commentsSection.innerHTML = comments.map(comment => {
            // Profil fotoğrafı yolunu düzelt
            const userImagePath = comment.user_image ? 
                `http://localhost:8000${comment.user_image.replace('/public', '')}` : 
                'http://localhost:8000/static/image/default-profile.jpg';

            return `
                <div class="comment">
                    <div class="comment-header">
                        <img src="${userImagePath}" alt="${comment.username}">
                        <span class="comment-user">${comment.username}</span>
                    </div>
                    <p class="comment-text">${comment.comment}</p>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Yorumlar yüklenirken hata:', error);
    }
}

// Media grid item'larına tıklama olayı ekle
document.querySelector('.media-grid').addEventListener('click', (e) => {
    const mediaItem = e.target.closest('.media-item');
    if (mediaItem) {
        const mediaId = mediaItem.dataset.mediaId;
        if (mediaId) {  // mediaId varsa modalı aç
            openMediaModal(mediaId);
        } else {
            console.error('Media ID bulunamadı');
        }
    }
});

// Modal dışına tıklandığında kapat
document.querySelector('.media-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closeMediaModal();
    }
});

// ESC tuşuna basıldığında modalı kapat
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeMediaModal();
    }
});

// Profil resmi yükleme
function loadProfileImage(userId) {
    fetch(`/api/users/${userId}/profile-image`)
        .then(response => response.json())
        .then(data => {
            const profileImage = document.getElementById('profileImage');
            if (data.profile_image) {
                const imagePath = data.profile_image.startsWith('/') ? data.profile_image : '/' + data.profile_image;
                profileImage.src = imagePath;
            } else {
                profileImage.src = '/static/image/default-profile.jpg'; // Varsayılan profil resmi
            }
        })
        .catch(error => console.error('Profil resmi yükleme hatası:', error));
}

// Modal kapatma fonksiyonu
function closeMediaModal() {
    const modal = document.getElementById('mediaModal');
    modal.classList.remove('active');
} 