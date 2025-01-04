document.addEventListener('DOMContentLoaded', function() {
    const categoryItems = document.querySelectorAll('.category-item');
    
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.dataset.target;
            showSection(targetSection);
        });
    });

    // İlk yüklemede URL'deki bölümü göster
    const hash = window.location.hash.slice(1);
    if (hash) {
        showSection(hash);
    }
});

function showSection(sectionId) {
    // Tüm bölümleri gizle
    const allSections = document.querySelectorAll('.food-section');
    allSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Seçilen bölümü göster
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.style.display = 'block';
        
        // URL'i güncelle
        window.location.hash = sectionId;
        
        // Smooth scroll
        selectedSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Sayfa yüklendiğinde kategorileri yükle
function loadRestaurants() {
    const restaurantData = {
        'kebap-section': [
            {
                name: 'Adana Kebapçısı',
                rating: 4.8,
                address: 'Kadıköy, İstanbul',
                description: 'Geleneksel Adana kebap lezzeti',
                image: 'adana1.jpg',
                features: ['park', 'wifi', 'card']
            },
            {
                name: 'Beyti Restaurant',
                rating: 4.9,
                address: 'Florya, İstanbul',
                description: 'Eşsiz Beyti kebap deneyimi',
                image: 'beyti.jpg',
                features: ['park', 'wifi', 'card', 'valet']
            },
            {
                name: 'Hamdi Restaurant',
                rating: 4.7,
                address: 'Eminönü, İstanbul',
                description: 'Boğaz manzaralı kebap keyfi',
                image: 'hamdi.jpg',
                features: ['wifi', 'card', 'view']
            }
        ],
        'doner-section': [
            {
                name: 'İskender Efendi',
                rating: 4.6,
                address: 'Beşiktaş, İstanbul',
                description: 'Meşhur İskender döner',
                image: 'iskender.jpg',
                features: ['wifi', 'card']
            },
            {
                name: 'Dönerci Şahin',
                rating: 4.7,
                address: 'Üsküdar, İstanbul',
                description: 'Geleneksel yaprak döner',
                image: 'sahin.jpg',
                features: ['park', 'wifi', 'card']
            },
            {
                name: 'Sultan Döner',
                rating: 4.5,
                address: 'Fatih, İstanbul',
                description: 'El yapımı özel döner',
                image: 'sultan.jpg',
                features: ['wifi', 'card']
            }
        ],
        'baklava-section': [
            {
                name: 'Karaköy Güllüoğlu',
                rating: 4.9,
                address: 'Karaköy, İstanbul',
                description: 'Geleneksel fıstıklı baklava',
                image: 'gulluoglu.jpg',
                features: ['wifi', 'card', 'takeaway']
            },
            {
                name: 'Köşkeroğlu',
                rating: 4.7,
                address: 'Gaziosmanpaşa, İstanbul',
                description: 'Özel kuru baklava çeşitleri',
                image: 'koskeroglu.jpg',
                features: ['park', 'wifi', 'card']
            },
            {
                name: 'Hafız Mustafa 1864',
                rating: 4.8,
                address: 'Sirkeci, İstanbul',
                description: 'Tarihi lezzet durağı',
                image: 'hafizmustafa.jpg',
                features: ['wifi', 'card', 'history']
            }
        ],
        'lokum-section': [
            {
                name: 'Ali Muhiddin Hacı Bekir',
                rating: 4.9,
                address: 'Eminönü, İstanbul',
                description: 'Tarihi lokum ustası',
                image: 'hacibekir.jpg',
                features: ['wifi', 'card', 'history']
            },
            {
                name: 'Divan Lokumları',
                rating: 4.7,
                address: 'Elmadağ, İstanbul',
                description: 'Modern lokum çeşitleri',
                image: 'divan.jpg',
                features: ['park', 'wifi', 'card']
            },
            {
                name: 'Meşhur Beyoğlu Lokumcusu',
                rating: 4.6,
                address: 'Beyoğlu, İstanbul',
                description: 'Özel lokum koleksiyonu',
                image: 'beyoglu.jpg',
                features: ['wifi', 'card']
            }
        ],
        'evyemegi-section': [
            {
                name: 'Çiya Sofrası',
                rating: 4.8,
                address: 'Kadıköy, İstanbul',
                description: 'Geleneksel Anadolu mutfağı',
                image: 'ciya.jpg',
                features: ['wifi', 'card', 'organic']
            },
            {
                name: 'Asuman Ana Ev Yemekleri',
                rating: 4.6,
                address: 'Beşiktaş, İstanbul',
                description: 'Ev yapımı lezzetler',
                image: 'asuman.jpg',
                features: ['wifi', 'card', 'takeaway']
            },
            {
                name: 'Lezzet-i Şahane',
                rating: 4.7,
                address: 'Üsküdar, İstanbul',
                description: 'Osmanlı mutfağından seçmeler',
                image: 'sahane.jpg',
                features: ['park', 'wifi', 'card']
            }
        ],
        'şarap-section': [
            {
                name: 'La Cave',
                rating: 4.8,
                address: 'Nişantaşı, İstanbul',
                description: 'Seçkin şarap koleksiyonu',
                image: 'lacave.jpg',
                features: ['wifi', 'card', 'sommelier']
            },
            {
                name: 'Sensus Wine Boutique',
                rating: 4.7,
                address: 'Galata, İstanbul',
                description: 'Butik şarap deneyimi',
                image: 'sensus.jpg',
                features: ['park', 'wifi', 'card', 'tasting']
            },
            {
                name: 'Viktor Levi',
                rating: 4.9,
                address: 'Kadıköy, İstanbul',
                description: 'Tarihi şarap evi',
                image: 'viktorlevi.jpg',
                features: ['wifi', 'card', 'history', 'view']
            }
        ]
    };

    // Özel özellik ikonları ekle
    const icons = {
        park: '<i class="fas fa-parking"></i> Park',
        wifi: '<i class="fas fa-wifi"></i> Wifi',
        card: '<i class="fas fa-credit-card"></i> Kart',
        valet: '<i class="fas fa-car"></i> Vale',
        view: '<i class="fas fa-mountain"></i> Manzara',
        takeaway: '<i class="fas fa-shopping-bag"></i> Paket',
        history: '<i class="fas fa-landmark"></i> Tarihi',
        organic: '<i class="fas fa-leaf"></i> Organik',
        sommelier: '<i class="fas fa-wine-glass-alt"></i> Sommelier',
        tasting: '<i class="fas fa-glass-cheers"></i> Tadım'
    };

    // Her kategori için restoranları yükle
    Object.entries(restaurantData).forEach(([sectionId, restaurants]) => {
        const section = document.getElementById(sectionId);
        if (section) {
            const grid = section.querySelector('.restaurant-grid');
            if (grid) {
                grid.innerHTML = restaurants.map(restaurant => createRestaurantCard(restaurant)).join('');
            }
        }
    });
}

function createRestaurantCard(restaurant) {
    return `
        <div class="restaurant-card">
            <img src="image/restaurants/${restaurant.image}" alt="${restaurant.name}">
            <div class="restaurant-info">
                <h3>${restaurant.name}</h3>
                <p class="rating"><i class="fas fa-star"></i> ${restaurant.rating}</p>
                <p class="address">${restaurant.address}</p>
                <p class="description">${restaurant.description}</p>
                <div class="restaurant-features">
                    ${createFeatureIcons(restaurant.features)}
                </div>
                <a href="#" class="reservation-btn">Rezervasyon Yap</a>
            </div>
        </div>
    `;
}

function createFeatureIcons(features) {
    const icons = {
        park: '<i class="fas fa-parking"></i> Park',
        wifi: '<i class="fas fa-wifi"></i> Wifi',
        card: '<i class="fas fa-credit-card"></i> Kart'
    };
    return features.map(feature => `<span>${icons[feature]}</span>`).join('');
} 