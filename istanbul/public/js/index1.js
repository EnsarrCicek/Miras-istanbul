/* script.js */
document.addEventListener("DOMContentLoaded", function () {
    const slides = document.querySelectorAll(".slide");
    
    // Eğer slide elementi yoksa fonksiyondan çık
    if (!slides || slides.length === 0) return;
    
    const prevBtn = document.getElementById("prevSlide");
    const nextBtn = document.getElementById("nextSlide");
    let currentSlide = 0;

    function updateSlide(newIndex) {
        slides[currentSlide].classList.remove("active");
        currentSlide = (newIndex + slides.length) % slides.length;
        slides[currentSlide].classList.add("active");
    }

    function autoSlide() {
        updateSlide(currentSlide + 1);
    }
    
    let slideInterval = setInterval(autoSlide, 15000);

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener("click", () => {
            clearInterval(slideInterval);
            updateSlide(currentSlide - 1);
            slideInterval = setInterval(autoSlide, 15000);
        });

        nextBtn.addEventListener("click", () => {
            clearInterval(slideInterval);
            updateSlide(currentSlide + 1);
            slideInterval = setInterval(autoSlide, 15000);
        });
    }

    slides[currentSlide].classList.add("active");
});

// Kullanıcı profiline yönlendirme fonksiyonu
function goToUserProfile(username) {
    if (!username) {
        console.error('Username is required');
        return;
    }
    window.location.href = `http://127.0.0.1:5500/istanbul/public/profile.html?username=${encodeURIComponent(username)}`;
}
