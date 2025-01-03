document.addEventListener('DOMContentLoaded', async () => {
    // URL'den username parametresini al
    const urlParams = new URLSearchParams(window.location.search);
    const profileUsername = urlParams.get('username');
    const loggedInUsername = localStorage.getItem('username');
    
    console.log('Current URL:', window.location.href);
    console.log('Profile page loaded:', {
        profileUsername,
        loggedInUsername
    });

    if (!loggedInUsername) {
        window.location.href = 'login.html';
        return;
    }

    // Eğer URL'de username yoksa, giriş yapan kullanıcının profilini göster
    const targetUsername = profileUsername || loggedInUsername;
    console.log('Target username:', targetUsername);

    // Profil sahibi mi kontrol et
    const isProfileOwner = targetUsername === loggedInUsername;
    
    // Takip butonunu göster/gizle
    const followButton = document.querySelector('.follow-btn');
    if (followButton) {
        if (isProfileOwner) {
            followButton.style.display = 'none';
        } else {
            followButton.style.display = 'block';
            followButton.dataset.username = targetUsername;
            followButton.onclick = () => toggleFollow(targetUsername);
            await checkFollowStatus(targetUsername);
        }
    }

    // Kullanıcı bilgilerini yükle
    await loadUserProfile(targetUsername);
    await loadUserMedia(targetUsername);
});

// Kullanıcı profil bilgilerini yükle
async function loadUserProfile(username) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/kullanici/profile`, {
            headers: {
                'username': username
            }
        });
        const data = await response.json();

        // Profil bilgilerini güncelle
        const usernameElement = document.getElementById('username');
        usernameElement.textContent = data.username;
        
        // Takip butonuna kullanıcı adını ekle
        const followButton = document.querySelector('.follow-btn');
        if (followButton) {
            followButton.dataset.username = data.username;
        }

        // Profil fotoğrafını doğru yoldan al
        const profileImage = document.getElementById('profileImage');
        if (data.profile_image) {
            // /public kısmını kaldır, sadece /uploads/profiles kullan
            profileImage.src = `http://127.0.0.1:8000/uploads/profiles/${data.profile_image.split('/').pop()}`;
        } else {
            // Varsayılan profil fotoğrafı
            profileImage.src = 'http://127.0.0.1:8000/static/image/default-profile.jpg';
        }

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
async function loadUserMedia(username) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/kullanici/media`, {
            headers: {
                'username': username
            }
        });
        const media = await response.json();

        const mediaGrid = document.querySelector('.media-grid');
        mediaGrid.innerHTML = '';

        media.forEach(item => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.dataset.mediaId = item.id;

            const imagePath = item.file_path.replace('/public', '');
            
            // Kullanıcı kendi profilindeyse silme butonunu göster
            const isCurrentUser = username === localStorage.getItem('username');
            
            mediaItem.innerHTML = `
                <img src="http://127.0.0.1:8000${imagePath}" alt="${item.title || ''}">
                ${isCurrentUser ? `
                    <button class="delete-media-btn" onclick="deleteMedia(event, ${item.id})">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
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
            item.addEventListener('click', (e) => {
                // Silme butonuna tıklandığında modalı açma
                if (!e.target.closest('.delete-media-btn')) {
                    openMediaModal(item.dataset.mediaId);
                }
            });
        });

    } catch (error) {
        console.error('Medya yüklenirken hata:', error);
    }
}

// Medya silme fonksiyonu
async function deleteMedia(event, mediaId) {
    event.stopPropagation(); // Modal açılmasını engelle
    
    if (!confirm('Bu gönderiyi silmek istediğinizden emin misiniz?')) {
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/kullanici/media/${mediaId}`, {
            method: 'DELETE',
            headers: {
                'username': localStorage.getItem('username')
            }
        });

        if (response.ok) {
            // Silinen medyayı DOM'dan kaldır
            const mediaItem = document.querySelector(`[data-media-id="${mediaId}"]`);
            if (mediaItem) {
                mediaItem.remove();
            }
            alert('Gönderi başarıyla silindi!');
            
            // İstatistikleri güncelle
            const postCount = document.getElementById('postCount');
            if (postCount) {
                postCount.textContent = parseInt(postCount.textContent) - 1;
            }
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Gönderi silinirken bir hata oluştu');
        }
    } catch (error) {
        console.error('Medya silinirken hata:', error);
        alert(error.message);
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

// Takip durumunu kontrol et ve butonu güncelle
async function checkFollowStatus(targetUsername) {
    console.log('checkFollowStatus called with:', targetUsername);
    
    if (!targetUsername) {
        console.error('Target username is missing');
        return;
    }
    
    const loggedInUsername = localStorage.getItem('username');
    if (!loggedInUsername || targetUsername === loggedInUsername) {
        console.error('Invalid follow check:', {
            loggedInUsername,
            targetUsername
        });
        return;
    }

    try {
        console.log('Making follow status request:', {
            username: loggedInUsername,
            target_username: targetUsername
        });

        const response = await fetch(`http://127.0.0.1:8000/api/kullanici/follow-status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: loggedInUsername,
                target_username: targetUsername
            })
        });
        
        const data = await response.json();
        console.log('Follow status response:', data);

        if (!response.ok) {
            throw new Error(data.detail || 'Takip durumu kontrol edilemedi');
        }
        
        const followButton = document.querySelector('.follow-btn');
        if (followButton) {
            if (data.is_following) {
                followButton.classList.add('following');
                followButton.textContent = 'Takip Ediliyor';
            } else {
                followButton.classList.remove('following');
                followButton.textContent = 'Takip Et';
            }
        }
    } catch (error) {
        console.error('Takip durumu kontrol edilirken hata:', error);
    }
}

// Takip et/bırak işlemi
async function toggleFollow(targetUsername) {
    if (!targetUsername) {
        console.error('Target username is missing');
        return;
    }

    const loggedInUsername = localStorage.getItem('username');
    if (!loggedInUsername || targetUsername === loggedInUsername) {
        console.error('Invalid follow operation');
        return;
    }

    const followButton = document.querySelector('.follow-btn');
    const isFollowing = followButton.classList.contains('following');
    
    try {
        const response = await fetch('http://127.0.0.1:8000/api/kullanici/follow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: loggedInUsername,
                target_username: targetUsername,
                action: isFollowing ? 'unfollow' : 'follow'
            })
        });

        const data = await response.json();
        console.log('Toggle follow response:', data);

        if (!response.ok) {
            throw new Error(data.detail || 'İşlem başarısız');
        }

        // Takipçi sayısını güncelle
        const followerCount = document.getElementById('followerCount');
        if (followerCount) {
            followerCount.textContent = data.follower_count;
        }
        
        // Buton durumunu güncelle
        if (isFollowing) {
            followButton.classList.remove('following');
            followButton.textContent = 'Takip Et';
        } else {
            followButton.classList.add('following');
            followButton.textContent = 'Takip Ediliyor';
        }
        
    } catch (error) {
        console.error('Takip işlemi sırasında hata:', error);
        alert(error.message);
    }
}

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
            // Profil fotoğrafı yolunu düzelt - /public kısmını kaldır
            const userImagePath = comment.user_image ? 
                `http://localhost:8000/uploads/profiles/${comment.user_image.split('/').pop()}` : 
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