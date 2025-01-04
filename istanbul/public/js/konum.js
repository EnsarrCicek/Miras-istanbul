// Global değişkenler
let userPosition = null;
let destinationPosition = null;

// Ses yerine Web Audio API kullanarak programatik bir uyarı sesi oluşturalım
function createAlertSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // La notası
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

    return {
        play: function() {
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }
    };
} 

// Konum izleme fonksiyonlarını güncelleyelim
function initLocationTracking(map, userMarker) {
    const locationOptions = {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 5000
    };

    // Konum alma fonksiyonu
    function getLocation() {
        if (!navigator.geolocation) {
            return;
        }

        // Konum almayı dene
        function tryGetLocation() {
            navigator.geolocation.getCurrentPosition(
                // Başarılı
                position => {
                    const coords = [position.coords.longitude, position.coords.latitude];
                    userPosition = coords;

                    // Haritayı konuma merkezle
                    map.flyTo({
                        center: coords,
                        zoom: 15
                    });

                    // Marker oluştur veya güncelle
                    if (!userMarker) {
                        userMarker = new maplibregl.Marker({
                            color: '#00FF00',
                            scale: 0.8
                        })
                        .setLngLat(coords)
                        .setPopup(new maplibregl.Popup().setHTML('Konumunuz'))
                        .addTo(map);
                    } else {
                        userMarker.setLngLat(coords);
                    }

                    // Konum başarıyla alındıktan sonra sürekli takibi başlat
                    startWatchPosition();
                },
                error => {
                    // Sessizce tekrar dene
                    setTimeout(tryGetLocation, 3000);
                },
                locationOptions
            );
        }

        tryGetLocation();
    }

    // Sürekli konum takibi
    function startWatchPosition() {
        const watchId = navigator.geolocation.watchPosition(
            position => {
                const coords = [position.coords.longitude, position.coords.latitude];
                userPosition = coords;
                
                if (userMarker) {
                    userMarker.setLngLat(coords);
                }

                if (destinationPosition) {
                    checkProximity();
                }
            },
            error => {
                // Sessizce yeniden başlat
                setTimeout(getLocation, 3000);
            },
            locationOptions
        );

        window.onbeforeunload = () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }

    getLocation();
} 

// checkProximity fonksiyonunu güncelle
function checkProximity() {
    if (!userPosition || !destinationPosition) return;

    const distance = calculateDistance(
        userPosition[1], userPosition[0],
        destinationPosition[1], destinationPosition[0]
    );

    const alertDistance = parseInt(document.getElementById('alertDistance').value);

    if (distance < alertDistance && !hasAlerted) {
        // Sadece ses ve titreşim
        if (document.getElementById('soundAlert').checked) {
            const audio = document.getElementById('alertAudio');
            audio.currentTime = 0;
            
            let playCount = 0;
            const playSound = () => {
                if (playCount < 3) {
                    audio.play();
                    playCount++;
                    setTimeout(playSound, 1500);
                }
            };
            playSound();
        }

        if (document.getElementById('vibrationAlert').checked && navigator.vibrate) {
            navigator.vibrate([1000, 500, 1000, 500, 1000]);
        }

        hasAlerted = true;
    }

    if (distance > alertDistance + 100) {
        hasAlerted = false;
    }
}

// calculateDistance fonksiyonunu da buraya taşıyalım
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
} 