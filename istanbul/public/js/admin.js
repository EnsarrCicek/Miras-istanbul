// Form göster/gizle
function showAddForm() {
    document.getElementById('addForm').style.display = 'block';
}

function hideAddForm() {
    document.getElementById('addForm').style.display = 'none';
}

// API base URL'i
const API_BASE_URL = 'http://localhost:8000';

// Konser ekleme
document.getElementById('concertForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/concerts/`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Konser başarıyla eklendi!');
            hideAddForm();
            loadConcerts();
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
        const response = await fetch(`${API_BASE_URL}/api/concerts/`);
        const concerts = await response.json();
        
        const concertsList = document.getElementById('concertsList');
        concertsList.innerHTML = concerts.map(concert => `
            <div class="concert-card">
                <div class="concert-image">
                    <img src="${API_BASE_URL}/${concert.image_path}" alt="${concert.title}">
                </div>
                <div class="concert-info">
                    <h3>${concert.title}</h3>
                    <p>${concert.venue}</p>
                    <p>${concert.date}</p>
                    <p class="price">${concert.price} TL</p>
                </div>
                <div class="concert-actions">
                    <button class="edit" onclick="editConcert(${concert.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete" onclick="deleteConcert(${concert.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Hata:', error);
    }
}

// Konser silme
async function deleteConcert(id) {
    if (confirm('Bu konseri silmek istediğinize emin misiniz?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/concerts/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('Konser başarıyla silindi!');
                loadConcerts();
            } else {
                alert('Silme işlemi başarısız!');
            }
        } catch (error) {
            console.error('Hata:', error);
            alert('Bir hata oluştu!');
        }
    }
}

// Sayfa yüklendiğinde konserleri getir
document.addEventListener('DOMContentLoaded', loadConcerts); 