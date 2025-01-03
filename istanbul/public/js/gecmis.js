// Gün bazlı tarihsel veriler
const historyData = {
    "12-27": [
        {
            title: "1925: Saat Kulesi Restorasyonu",
            description: "Galata Kulesi'nin ilk büyük restorasyon çalışması başladı."
        },
        {
            title: "1950: İlk Elektrikli Tramvay",
            description: "İstanbul'da ilk elektrikli tramvay hattı Eminönü-Beyazıt arasında hizmete girdi."
        }
    ],
    "12-28": [
        {
            title: "1930: Darülbedayi'nin İlk Temsili",
            description: "Bugünkü İstanbul Şehir Tiyatroları'nın temeli olan Darülbedayi'de ilk temsil verildi.",
            image: "image/2.jpg",
            additionalContent: `
                <div class="detailed-content">
                    <h3>Tarihsel Önemi</h3>
                    <p>Darülbedayi, Türk tiyatro tarihinin en önemli kurumlarından biridir. 1914 yılında kurulan bu kurum, Türk tiyatrosunun modernleşmesinde öncü rol oynamıştır.</p>
                    
                    <div class="image-gallery">
                        <img src="image/13.jpg" alt="Tarihi Fotoğraf 1">
                       
                    </div>

                    <h3>İlk Temsil</h3>
                    <p>İlk temsilin detayları ve dönemin önemli oyuncuları burada yer almıştır. Tarihi bir dönüm noktası olan bu temsil, Türk tiyatrosunda yeni bir çığır açmıştır.</p>
                    
                    <div class="image-gallery">
                        <img src="image/11.jpg" alt="Tarihi Sahne">
                    </div>

                    <h3>Günümüze Etkisi</h3>
                    <p>Bugün İstanbul Şehir Tiyatroları olarak devam eden kurum, Türk tiyatrosunun gelişiminde önemli bir rol oynamaya devam etmektedir.</p>
                </div>
            `
        },
        {
            title: "1940: Tarihi Kapalıçarşı Yangını",
            description: "Kapalıçarşı'da çıkan büyük yangın sonrası restorasyon çalışmaları başladı."
        },
        {
            title: "1965: Boğaziçi Köprüsü Planları",
            description: "Boğaziçi Köprüsü'nün ilk resmi planları onaylandı."
        }
    ],
    "12-29": [
        {
            title: "1936: İstanbul Üniversitesi Reformu",
            description: "İstanbul Üniversitesi'nde büyük eğitim reformu başlatıldı."
        },
        {
            title: "1955: Beyoğlu'nun İlk Sinemaları",
            description: "Beyoğlu'nda ilk sürekli sinema gösterimleri başladı."
        }
    ],
    "12-30": [
        {
            title: "1928: Latin Alfabesine Geçiş",
            description: "İstanbul'da Latin alfabesine geçiş için ilk resmi kurslar açıldı."
        }
    ],
    "12-31": [
        {
            title: "1926: Sirkeci Garı'nın Açılışı",
            description: "Sirkeci Garı resmi olarak hizmete açıldı."
        },
        {
            title: "1950: Yılbaşı Kutlamaları",
            description: "İstanbul'da ilk büyük ölçekli yılbaşı kutlamaları düzenlendi."
        }
    ],
    "01-01": [
        {
            title: "2017: İstanbul'da, Reina gece kulübüne saldırı yapıldı.",
            description: "1 Ocak 2017'de yerel saatle 01:15'te İstanbul'un Beşiktaş ilçesindeki Ortaköy semtinde bulunan Reina adlı gece kulübüne yeni yıl kutlamaları sırasında düzenlenen silahlı saldırı. Saldırı sonucunda 39 kişi öldü, 70 kişi ise yaralandı.",
            image: "image/reina.JPG",
            additionalContent: `
                <div class="detailed-content">
                    <h3>Olay Detayları</h3>
                    <p>Olay yerine taksiyle gelen ve üzerinde siyah mont, siyah pantolon ve açık renkli şapka olan Abdulkadir Masharipov (kod adı: Abu Muhammed Horasani) elindeki AK-47 marka uzun namlulu silahla ilk önce etrafa ateş açtı. Sonrasında polis memuru Burak Yıldız'ı öldürdü. Ardından kapıda bekleyen gece kulübünün özel güvenliğini sağlayan kişilere ateş açarak öldürdü ve içeriye girerek etrafa rastgele ateş açtı. Yaklaşık 7 dakika süren saldırı sonrası saldırgan üstünü değiştirerek gözden kayboldu.[32][33]

Kayıplar
Saldırıda biri aynı zamanda Belçika vatandaşı olan 12 Türk vatandaşı hayatını yitirdi.[34] Bunların dışında, 7 tane Suudi Arabistan, üç tane Lübnan, en az üç tane Irak, ikişer tane Tunus, Fas ve Ürdün, birer tane Rusya, Kuveyt, Kanada, İsrail ve Suriye vatandaşı hayatını yitirdi.[34] Ölen iki Hindistan vatandaşından biri olan film yapımcısı ve iş insanı Abis Rizvi'de saldırı günü gece kulübünde bulunmaktaydı. Hayatını kaybetmiş 39 kişiden birinin kimliği henüz tespit edilemedi;[34] bazı kaynaklarda ölen Iraklı sayısının dört olduğu bildirilmektedir.[35]

Saldırının ardından haber ajanslarına düşen ilk bilgiler biri polis iki kişinin öldüğü yönündeydi. Olaydan yaklaşık bir buçuk saat sonra basına konuşan İstanbul Valisi Vasip Şahin, saldırının bir "terör saldırısı" olduğunu ve ilk belirlemelere göre 35 kişinin öldüğünü açıkladı. Daha sonra yeni bir açıklama yapan İçişleri Bakanı Süleyman Soylu, ölen kişi sayısının 39 olduğunu bildirdi. Sağlık Bakanı Recep Akdağ ise kimliği belirlenen 20 kişiden 15'inin yabancı uyruklu, 5'inin ise Türk olduğunu ve 4'ü ağır olmak üzere 65 kişinin yaralı olarak hastanelerde olduğunu duyurdu.[36]</p>
                    
                   

                   
                </div>
            `
        }
    ],
    "01-02": [
        {
            title: "1923: İstanbul'un İşgalden Kurtuluşu",
            description: "Kısa açıklama buraya...",
            image: "image/kurtulus.jpg",
            additionalContent: `
                <div class="detailed-content">
                    <h3>Kurtuluş Süreci</h3>
                    <p>Detaylı bilgiler...</p>
                    
                    <div class="image-gallery">
                        <img src="image/kurtulus1.jpg" alt="Tarihi Fotoğraf 1">
                        <img src="image/kurtulus2.jpg" alt="Tarihi Fotoğraf 2">
                    </div>

                    <h3>Kutlamalar</h3>
                    <p>Kutlamalar hakkında bilgiler...</p>
                </div>
            `
        }
    ],
    // Diğer tarihler için verileri ekleyebilirsiniz
};

// Bugünün tarihini "MM-DD" formatında al
function getFormattedDate() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${month}-${day}`;
}

// Tarihi olayları sayfaya yükle
function loadHistoricalEvents() {
    const loadingMessage = document.getElementById("loadingMessage");
    const errorMessage = document.getElementById("errorMessage");
    const eventsContainer = document.getElementById("events");

    // UI'yi temizle
    loadingMessage.style.display = "block";
    errorMessage.style.display = "none";
    eventsContainer.innerHTML = "";

    // Bugünün tarihine göre veriyi al
    const todayKey = getFormattedDate();
    const events = historyData[todayKey];

    if (events && events.length > 0) {
        loadingMessage.style.display = "none";
        
        // Her olay için kart oluştur
        events.forEach(event => {
            const eventCard = createEventCard(event);
            eventsContainer.appendChild(eventCard);

            // Animasyon için timeout
            setTimeout(() => {
                eventCard.classList.add('show');
            }, 100);
        });
    } else {
        loadingMessage.style.display = "none";
        errorMessage.style.display = "block";
        errorMessage.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-circle"></i>
                <p>Bugün (${todayKey}) için kayıtlı tarihsel bilgi bulunamadı.</p>
                <p class="error-sub">Başka bir gün tekrar kontrol edin.</p>
            </div>
        `;
    }
}

function createEventCard(event) {
    // Tarihi formatla
    const date = event.date || getFormattedDate(); // Eğer event.date yoksa bugünün tarihini kullan

    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    eventCard.innerHTML = `
        <div class="event-date">${event.title.split(':')[0]}</div> <!-- Başlıktaki tarihi al -->
        <h3 class="event-title">${event.title.split(':')[1].trim()}</h3>
        <p class="event-description">${event.description}</p>
        <div class="event-icon">📜</div>
        <button class="close-btn" style="display: none;">×</button>
        
        <!-- Genişletilmiş içerik -->
        <div class="expanded-content">
            <div class="image-section">
                <img src="${event.image || 'image/default-history.jpg'}" alt="${event.title}">
            </div>
            <div class="text-section">
                <h2>${event.title}</h2>
                <p>${event.description}</p>
                <div class="additional-content">
                    ${event.additionalContent || 'Daha detaylı bilgi yakında eklenecek...'}
                </div>
            </div>
        </div>
    `;

    // Overlay oluştur
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    // Karta tıklama olayı
    eventCard.addEventListener('click', function(e) {
        if (e.target.classList.contains('close-btn')) {
            closeCard(this, overlay);
            return;
        }
        
        if (!this.classList.contains('expanded')) {
            expandCard(this, overlay);
        }
    });

    // Overlay'e tıklama olayı
    overlay.addEventListener('click', () => {
        closeCard(eventCard, overlay);
    });

    return eventCard;
}

function expandCard(card, overlay) {
    card.classList.add('expanded');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    card.querySelector('.close-btn').style.display = 'block';
}

function closeCard(card, overlay) {
    card.classList.remove('expanded');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    card.querySelector('.close-btn').style.display = 'none';
}

// Sayfa yüklendiğinde olayları yükle
document.addEventListener("DOMContentLoaded", loadHistoricalEvents);

// Her gün gece yarısında sayfayı yenile
function scheduleRefresh() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow - now;
    
    setTimeout(() => {
        loadHistoricalEvents();
        scheduleRefresh(); // Bir sonraki gün için tekrar planla
    }, timeUntilMidnight);
}

// Yenileme planlamasını başlat
scheduleRefresh();
