document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('http://localhost:8000/api/concerts/');
        const concerts = await response.json();
        
        const konserGrid = document.querySelector('.konser-grid');
        konserGrid.innerHTML = ''; // Mevcut içeriği temizle
        
        concerts.forEach(concert => {
            // Resim yolunu /uploads/concerts olarak değiştir
            const imagePath = concert.image_path.startsWith('/uploads/concerts') ? 
                `http://localhost:8000${concert.image_path}` : 
                `http://localhost:8000/uploads/concerts/${concert.image_path}`;

            const konserCard = `
                <div class="konser-card">
                    <div class="konser-image">
                        <img src="${imagePath}" alt="${concert.title}">
                    </div>
                    <div class="konser-info">
                        <h2>${concert.title}</h2>
                        <div class="konser-details">
                            <p><i class="fas fa-map-marker-alt"></i> ${concert.venue}</p>
                            <p><i class="fas fa-calendar-alt"></i> ${concert.date}</p>
                            <p class="price">${concert.price} TL</p>
                        </div>
                    </div>
                    <div class="konser-expanded">
                        <div class="expanded-content">
                            <h3>Konser Hakkında</h3>
                            <p>${concert.description}</p>
                            <div class="lineup">
                                <h4>Program Detayları:</h4>
                                <ul>
                                    ${concert.lineup.split(',').map(item => `<li>${item.trim()}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                        <div class="ticket-btn-container">
                            <button class="ticket-btn">Bilet Al</button>
                        </div>
                    </div>
                </div>
            `;
            konserGrid.innerHTML += konserCard;
        });

        // Kart tıklama olaylarını ekle
        const konserCards = document.querySelectorAll('.konser-card');
        konserCards.forEach(card => {
            card.addEventListener('click', function(e) {
                if (e.target.classList.contains('ticket-btn')) {
                    return;
                }
                
                konserCards.forEach(otherCard => {
                    if (otherCard !== card) {
                        otherCard.classList.remove('active');
                    }
                });
                
                this.classList.toggle('active');
            });
        });

    } catch (error) {
        console.error('Konserler yüklenirken hata:', error);
        document.querySelector('.konser-grid').innerHTML = `
            <div class="error-message">
                <p>Konserler yüklenirken bir hata oluştu: ${error.message}</p>
                <p>Lütfen daha sonra tekrar deneyin.</p>
            </div>
        `;
    }
}); 