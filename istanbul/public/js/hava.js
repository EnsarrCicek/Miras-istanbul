document.getElementById('weatherIcon').addEventListener('click', async () => {
    const weatherContent = document.getElementById('weatherContent');
    weatherContent.innerHTML = "Hava durumu bilgisi yükleniyor...";

    // İngilizce -> Türkçe hava durumu çeviri tablosu
    const weatherTranslations = {
        "Rain": "Yağmurlu",
        "Cloudy": "Bulutlu",
        "Partly Cloudy": "Parçalı Bulutlu",
        "Partially cloudy": "Parçalı Bulutlu",
        "Clear": "Açık",
        "Sunny": "Güneşli",
        "Snow": "Karlı",
        "Thunderstorm": "Fırtınalı",
        "Overcast": "Kapalı",
        "Fog": "Sisli",
        "Haze": "Puslu",
        "Drizzle": "Çiseleme",
        "Windy": "Rüzgarlı"
    };

    try {
        // API'den hava durumu verisi çekiliyor
        const response = await fetch(
            'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/İstanbul?unitGroup=metric&key=6CGZ5QJEY7QNACGN6M7LR3TZX&contentType=json'
        );

        // Eğer API yanıtı başarılı değilse hata fırlat
        if (!response.ok) throw new Error('Veri alınamadı.');

        // Gelen veriyi JSON formatına dönüştür
        const data = await response.json();

        // Gelen conditions değerlerini kontrol etmek için konsola yazdır
        console.log("Bugün hava durumu (conditions):", data.days[0].conditions);
        console.log("Yarın hava durumu (conditions):", data.days[1].conditions);

        // Hava durumu açıklamalarını işleyip Türkçe'ye çeviriyoruz
        const translateCondition = (condition) => {
            // Gelen condition değerini virgüle göre parçala ve her bir kısmı çevir
            return condition
                .split(", ") // İngilizce ifadeleri virgüle göre ayır
                .map(part => weatherTranslations[part.trim()] || part.trim()) // Türkçe çeviri yap veya olduğu gibi bırak
                .join(", "); // Parçaları tekrar birleştir
        };

        const todayCondition = translateCondition(data.days[0].conditions);
        const tomorrowCondition = translateCondition(data.days[1].conditions);

        // Hava durumu verilerini içeriğe yazdır
        weatherContent.innerHTML = `
            <p><strong>Bugün:</strong> ${data.days[0].temp}°C, ${todayCondition}</p>
            <p><strong>Yarın:</strong> ${data.days[1].temp}°C, ${tomorrowCondition}</p>
        `;
    } catch (error) {
        // Hata durumunda kullanıcıya bilgi mesajı göster
        weatherContent.innerHTML = `<p>Hava durumu bilgisi alınamadı.</p>`;
        console.error('Hata:', error); // Hata detaylarını konsola yaz
    }
});
