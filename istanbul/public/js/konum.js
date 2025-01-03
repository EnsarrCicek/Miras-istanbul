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