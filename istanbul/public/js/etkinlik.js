document.addEventListener('DOMContentLoaded', function() {
    // Mekan verilerini yükle
    const venues = [
        {
            title: "Emirgan Korusu",
            location: "Sarıyer, İstanbul",
            category: "korular",
            region: "avrupa",
            image: "emirgan.jpg",
            features: ["Piknik Alanı", "Kafeler", "Lale Bahçesi", "Yürüyüş Parkuru"],
            description: "Boğaz'ın en güzel korularından biri"
        },
        {
            title: "Belgrad Ormanı",
            location: "Eyüp, İstanbul",
            category: "piknik",
            region: "avrupa",
            image: "belgrad.jpg",
            features: ["Piknik Alanı", "Koşu Parkuru", "Bisiklet Yolu", "Tarihi Bentler"],
            description: "İstanbul'un oksijen deposu"
        },
        {
            title: "Atatürk Arboretumu",
            location: "Sarıyer, İstanbul",
            category: "botanik",
            region: "avrupa",
            image: "atatürk.jpg",
            features: ["Botanik Bahçe", "Gölet", "Fotoğraf Çekim Alanı"],
            description: "4500'den fazla bitki türü"
        },
        {
            title: "Fenerbahçe Parkı",
            location: "Kadıköy, İstanbul",
            category: "park",
            region: "anadolu",
            image: "fener.jpg",
            features: ["Deniz Manzarası", "Yürüyüş Yolu", "Çocuk Parkı", "Kafeler"],
            description: "Deniz kenarında huzurlu bir park"
        }
    ];

    // Filtreleme işlevi
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            filterVenues(filter);
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    function filterVenues(region) {
        const filteredVenues = region === 'all' 
            ? venues 
            : venues.filter(venue => venue.region === region);
        displayVenues(filteredVenues);
    }

    function displayVenues(venuesToShow) {
        const venuesGrid = document.querySelector('.venues-grid');
        venuesGrid.innerHTML = venuesToShow.map(venue => `
            <div class="venue-card">
                <img src="image/${venue.image}" alt="${venue.title}">
                <div class="venue-info">
                    <h3>${venue.title}</h3>
                    <p class="location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${venue.location}
                    </p>
                    <p class="description">${venue.description}</p>
                    <div class="features">
                        ${venue.features.map(feature => 
                            `<span class="feature-tag">${feature}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Kategori filtreleme
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const category = item.dataset.filter;
            const filteredVenues = venues.filter(venue => 
                venue.category === category
            );
            displayVenues(filteredVenues);
        });
    });

    // Sayfa yüklendiğinde tüm mekanları göster
    displayVenues(venues);
}); 