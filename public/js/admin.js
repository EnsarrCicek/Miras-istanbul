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