document.addEventListener('DOMContentLoaded', function() {
    const konserCards = document.querySelectorAll('.konser-card');

    konserCards.forEach(card => {
        card.addEventListener('click', function() {
            // Önce tüm kartları kapat
            konserCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.remove('active');
                }
            });
            
            // Sadece tıklanan kartı aç/kapat
            this.classList.toggle('active');
        });
    });
}); 