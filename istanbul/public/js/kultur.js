document.addEventListener('DOMContentLoaded', function() {
    // Oyun verilerini yükle
    const plays = [
        {
            title: "Hamlet",
            theater: "Devlet Tiyatrosu",
            category: "drama",
            date: "2024-03-15",
            image: "hamlet.jpeg",
            description: "Shakespeare'in ölümsüz eseri"
        },
        {
            title: "Bir Yaz Gecesi Rüyası",
            theater: "Şehir Tiyatrosu",
            category: "komedi",
            date: "2024-03-20",
            image: "yazgece.jpg",
            description: "Shakespeare'in büyülü komedisi"
        },
        {
            title: "Notre Dame'ın Kamburu",
            theater: "Devlet Tiyatrosu",
            category: "muzikli",
            date: "2024-03-25",
            image: "notre.jpeg",
            description: "Victor Hugo'nun ölümsüz eseri"
        },
        {
            title: "Reis Bey",
            theater: "Özel Tiyatro",
            category: "drama",
            date: "2024-03-28",
            image: "reis.jpg",
            description: "Necip Fazıl'ın unutulmaz eseri"
        }
    ];

    // Filtreleme işlevi
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            filterPlays(filter);
            
            // Aktif filtre butonunu güncelle
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    function filterPlays(category) {
        const filteredPlays = category === 'all' 
            ? plays 
            : plays.filter(play => play.category === category);
        displayPlays(filteredPlays);
    }

    function displayPlays(playsToShow) {
        const playsGrid = document.querySelector('.plays-grid');
        playsGrid.innerHTML = playsToShow.map(play => `
            <div class="play-card">
                <img src="image/${play.image}" alt="${play.title}">
                <div class="play-info">
                    <h3>${play.title}</h3>
                    <p class="theater"><i class="fas fa-theater-masks"></i> ${play.theater}</p>
                    <p class="date"><i class="far fa-calendar-alt"></i> ${formatDate(play.date)}</p>
                    <p class="description">${play.description}</p>
                    <button class="ticket-btn">Bilet Al</button>
                </div>
            </div>
        `).join('');
    }

    // Takvim işlevleri
    let currentDate = new Date();
    updateCalendar(currentDate);

    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar(currentDate);
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar(currentDate);
    });

    function updateCalendar(date) {
        const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
            "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
        
        document.getElementById('currentMonth').textContent = 
            `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        
        // Takvim grid'ini güncelle
        generateCalendarDays(date);
    }

    function generateCalendarDays(date) {
        const calendarGrid = document.querySelector('.calendar-grid');
        calendarGrid.innerHTML = ''; // Mevcut günleri temizle
        
        // Takvim mantığını uygula
        // ...
    }

    // Yardımcı fonksiyonlar
    function formatDate(dateString) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    }

    // Sayfa yüklendiğinde tüm oyunları göster
    displayPlays(plays);
}); 