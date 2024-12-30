document.addEventListener('DOMContentLoaded', () => {
    // Kullanıcı kontrolü
    const username = localStorage.getItem('username');
    if (!username) {
        window.location.href = 'login.html';
        return;
    }

    loadAllMedia();
});

// Tüm medyaları yükle
async function loadAllMedia() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/discover/media');
        const allMediaItems = await response.json();
        
        // Her sayfada 6 öğe göster
        const itemsPerPage = 6;
        const mediaItems = allMediaItems.slice(0, itemsPerPage);

        const mediaGrid = document.getElementById('mediaGrid');
        mediaGrid.innerHTML = mediaItems.map(item => {
            const imagePath = item.file_path.replace('/public', '');
            return `
                <div class="media-item" onclick="openMediaModal(${item.id})">
                    <img src="http://127.0.0.1:8000${imagePath}" 
                         alt="${item.title || ''}"
                         loading="lazy">
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Medya yüklenirken hata:', error);
    }
}

// Modal açma
async function openMediaModal(mediaId) {
    try {
        const response = await fetch(`http://localhost:8000/api/media/${mediaId}`);
        const media = await response.json();

        const modal = document.getElementById('mediaModal');
        modal.dataset.mediaId = mediaId;

        const mediaView = modal.querySelector('.media-view');
        const userInfo = modal.querySelector('.user-info');
        const likeBtn = modal.querySelector('.like-btn');
        const likeCount = modal.querySelector('.like-count');
        const commentCount = modal.querySelector('.comment-count span');

        // Medya görüntüsünü ayarla
        mediaView.innerHTML = `
            <img src="http://localhost:8000${media.file_path.replace('/public', '')}" 
                 alt="${media.title || ''}"
                 onclick="window.location.href='profile.html?username=${media.username}'">
        `;

        // Kullanıcı bilgilerini ayarla
        const userProfileLink = modal.querySelector('.user-profile-link');
        userProfileLink.href = `profile.html?username=${media.username}`;
        
        // Profil fotoğrafını ayarla
        const userAvatar = userProfileLink.querySelector('.user-avatar');
        if (media.user_image) {
            userAvatar.src = `http://localhost:8000${media.user_image.replace('/public', '')}`;
            userAvatar.onerror = function() {
                this.src = 'http://localhost:8000/static/image/default-profile.jpg';
            };
        } else {
            userAvatar.src = 'http://localhost:8000/static/image/default-profile.jpg';
        }
        
        userProfileLink.querySelector('.username').textContent = media.username;

        // Beğeni ve yorum sayılarını güncelle
        likeCount.textContent = media.like_count || 0;
        commentCount.textContent = media.comment_count || 0;

        // Beğeni durumunu kontrol et
        const isLiked = await checkIfLiked(mediaId);
        updateLikeButton(likeBtn, isLiked);

        // Yorumları yükle
        await loadComments(mediaId);

        modal.classList.add('active');
    } catch (error) {
        console.error('Modal açılırken hata:', error);
    }
}

// Modal kapatma
function closeMediaModal() {
    const modal = document.getElementById('mediaModal');
    modal.classList.remove('active');
}

// Yorumları yükle
async function loadComments(mediaId) {
    try {
        const response = await fetch(`http://localhost:8000/api/media/${mediaId}/comments`);
        const comments = await response.json();

        const commentsSection = document.querySelector('.comments-section');
        commentsSection.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <img src="http://localhost:8000${comment.user_image?.replace('/public', '')}" 
                         alt="${comment.username}" 
                         class="user-avatar">
                    <span class="comment-user">${comment.username}</span>
                </div>
                <p class="comment-text">${comment.comment}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Yorumlar yüklenirken hata:', error);
    }
}

// Beğeni durumu kontrolü
async function checkIfLiked(mediaId) {
    try {
        const response = await fetch(`http://localhost:8000/api/media/${mediaId}/like-status`, {
            headers: {
                'username': localStorage.getItem('username')
            }
        });
        const data = await response.json();
        return data.is_liked;
    } catch (error) {
        console.error('Beğeni durumu kontrol edilirken hata:', error);
        return false;
    }
}

// Beğeni butonunu güncelle
function updateLikeButton(button, isLiked) {
    const icon = button.querySelector('i');
    if (isLiked) {
        button.classList.add('liked');
        icon.classList.remove('far');
        icon.classList.add('fas');
    } else {
        button.classList.remove('liked');
        icon.classList.remove('fas');
        icon.classList.add('far');
    }
}

// Beğeni işlemi
async function likeMedia(mediaId) {
    try {
        const response = await fetch(`http://localhost:8000/api/media/${mediaId}/like`, {
            method: 'POST',
            headers: {
                'username': localStorage.getItem('username')
            }
        });
        const data = await response.json();
        return data.like_count;
    } catch (error) {
        console.error('Beğeni işlemi sırasında hata:', error);
        return null;
    }
}

// Yorum gönderme
async function submitComment(event) {
    event.preventDefault();
    const modal = document.getElementById('mediaModal');
    const mediaId = modal.dataset.mediaId;
    const commentInput = modal.querySelector('.comment-input');
    const comment = commentInput.value.trim();

    if (!comment) return;

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
            commentInput.value = '';
            await loadComments(mediaId);
            const data = await response.json();
            modal.querySelector('.comment-count span').textContent = data.comment_count;
        }
    } catch (error) {
        console.error('Yorum gönderilirken hata:', error);
    }
}

// Event Listeners
document.querySelector('.like-btn').addEventListener('click', async function() {
    const modal = document.getElementById('mediaModal');
    const mediaId = modal.dataset.mediaId;
    const newLikeCount = await likeMedia(mediaId);
    
    if (newLikeCount !== null) {
        const isLiked = this.classList.contains('liked');
        updateLikeButton(this, !isLiked);
        modal.querySelector('.like-count').textContent = newLikeCount;
    }
});

// ESC tuşu ile modalı kapat
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeMediaModal();
    }
});

// Modal dışına tıklandığında kapat
document.querySelector('.media-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closeMediaModal();
    }
}); 