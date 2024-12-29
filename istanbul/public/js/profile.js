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
            profileImage.src = '/public/image/default-profile.jpg';
        }
        
        profileImage.onerror = function() {
            this.src = '/public/image/default-profile.jpg';
        };

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
            // Media ID'sini data attribute olarak ekle
            mediaItem.dataset.mediaId = item.id;

            if (item.media_type === 'photo') {
                mediaItem.innerHTML = `
                    <img src="http://localhost:8000${item.file_path}" alt="${item.title || ''}">
                    <div class="media-overlay">
                        <h3>${item.title || ''}</h3>
                        <p>${item.caption || ''}</p>
                        <span class="author">Yazar: ${item.author || ''}</span>
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

// Medya modalını aç
function openMediaModal(mediaId) {
    const modal = document.getElementById('mediaModal');
    modal.classList.add('active');
    loadMediaDetails(mediaId);
}

// Medya modalını kapat
function closeMediaModal() {
    const modal = document.getElementById('mediaModal');
    modal.classList.remove('active');
}

// Medya detaylarını yükle
async function loadMediaDetails(mediaId) {
    try {
        console.log('Loading media details for ID:', mediaId); // Debug log
        
        const response = await fetch(`http://localhost:8000/api/media/${mediaId}`, {
            headers: {
                'username': localStorage.getItem('username')
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Medya detayları alınamadı');
        }

        const data = await response.json();
        console.log('Media details:', data); // Debug log

        // Modal içeriğini güncelle
        document.getElementById('modalImage').src = `http://localhost:8000${data.file_path}`;
        document.getElementById('modalUsername').textContent = data.author;
        document.getElementById('modalDate').textContent = new Date(data.created_at).toLocaleDateString();
        
        // Kullanıcı resmini güncelle
        const userImage = document.getElementById('modalUserImage');
        userImage.src = data.user_image ? `http://localhost:8000${data.user_image}` : '/image/default-profile.jpg';

        // Beğeni ve yorum sayılarını güncelle
        document.querySelector('.like-count').textContent = data.like_count || 0;
        document.querySelector('.comment-count').textContent = data.comment_count || 0;

        // Beğeni durumunu kontrol et
        const likeBtn = document.querySelector('.like-btn');
        if (data.is_liked) {
            likeBtn.classList.add('liked');
        } else {
            likeBtn.classList.remove('liked');
        }

        // Yorumları yükle
        loadComments(mediaId);

        // Aktif medya ID'sini sakla
        document.querySelector('.like-btn').dataset.mediaId = mediaId;

    } catch (error) {
        console.error('Medya detayları yüklenirken hata:', error);
        alert('Medya detayları yüklenirken bir hata oluştu: ' + error.message);
    }
}

// Yorumları yükle
async function loadComments(mediaId) {
    try {
        const response = await fetch(`http://localhost:8000/api/media/${mediaId}/comments`);
        const comments = await response.json();

        const commentsSection = document.getElementById('comments');
        commentsSection.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <img src="${comment.user_image || '/image/default-profile.jpg'}" alt="${comment.username}">
                    <span class="comment-user">${comment.username}</span>
                </div>
                <p class="comment-text">${comment.comment}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Yorumlar yüklenirken hata:', error);
    }
}

// Beğeni işlemi
async function likeMedia() {
    const likeBtn = document.querySelector('.like-btn');
    const mediaId = likeBtn.dataset.mediaId;
    const isLiked = likeBtn.classList.contains('liked');

    try {
        const response = await fetch(`http://localhost:8000/api/media/${mediaId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'username': localStorage.getItem('username')
            },
            body: JSON.stringify({
                action: isLiked ? 'unlike' : 'like'
            })
        });

        if (response.ok) {
            const data = await response.json();
            likeBtn.classList.toggle('liked');
            document.querySelector('.like-count').textContent = data.like_count;
            
            // Kullanıcının toplam beğeni sayısını güncelle
            loadUserProfile();
        }
    } catch (error) {
        console.error('Beğeni işlemi sırasında hata:', error);
    }
}

// Yorum gönderme
async function submitComment(event) {
    event.preventDefault();
    const mediaId = document.querySelector('.like-btn').dataset.mediaId;
    const commentInput = document.querySelector('.comment-input');
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
            loadComments(mediaId);
            document.querySelector('.comment-count').textContent = data.comment_count;
        }
    } catch (error) {
        console.error('Yorum gönderilirken hata:', error);
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