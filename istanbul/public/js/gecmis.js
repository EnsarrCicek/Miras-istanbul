// Gün bazlı el ile girilen veriler
const historyData = {
    "12-11": [
        {
            title: "1923: İstanbul'un Resmi Olarak Başkent Olmaması Kararlaştırıldı",
            description: "Cumhuriyetin ilanından sonra, Ankara Türkiye'nin başkenti olarak seçildi."
        },
        {
            title: "1918: İtilaf Devletleri İstanbul'u İşgal Etti",
            description: "I. Dünya Savaşı sonrası İstanbul, İtilaf Devletleri tarafından işgal edildi."
        }
    ],
    "12-12": [
        {
            title: "1453: İstanbul Fethi Sonrası İlk Osmanlı Yönetim Reformu",
            description: "Fatih Sultan Mehmet, İstanbul'u yeniden yapılandırma planlarını ilan etti."
        }
    ],
    "12-27": [
        {
            title: "12: İstanbul Fethi Sonrası İlk Osmanlı Yönetim Reformu",
            description: "Fatih Sultan Mehmet, İstanbul'u yeniden yapılandırma planlarını ilan etti."
        }
    ]
};

// Bugünün tarihini "MM-DD" formatında al
const getFormattedDate = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Ayları 2 basamaklı yap
    const day = String(today.getDate()).padStart(2, "0");
    return `${month}-${day}`;
};

document.addEventListener("DOMContentLoaded", () => {
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
        events.forEach(event => {
            const eventDiv = document.createElement("div");
            eventDiv.className = "event";
            eventDiv.innerHTML = `<p class="event-title">${event.title}</p>
                                  <p class="event-description">${event.description}</p>`;
            eventsContainer.appendChild(eventDiv);
        });
    } else {
        // Hata durumunda mesaj göster
        loadingMessage.style.display = "none";
        errorMessage.style.display = "block";
        errorMessage.textContent = "Bugün için kayıtlı bilgi bulunamadı.";
    }
});
/**
 * Belirtilen sayfaya yönlendiren fonksiyon.
 * @param {string} page - Gitmek istenen sayfanın adı.
 */
function navigateToPage(page) {
    window.location.href = page;
}
