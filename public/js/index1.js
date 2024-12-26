/* script.js */
document.addEventListener("DOMContentLoaded", function () {
    const slides = document.querySelectorAll(".slide");
    const prevBtn = document.getElementById("prevSlide");
    const nextBtn = document.getElementById("nextSlide");
    let currentSlide = 0;

    function updateSlide(newIndex) {
        slides[currentSlide].classList.remove("active");
        currentSlide = (newIndex + slides.length) % slides.length; // Döngü sağlar
        slides[currentSlide].classList.add("active");
    }

    // Otomatik slayt geçişi
    function autoSlide() {
        updateSlide(currentSlide + 1);
    }
    let slideInterval = setInterval(autoSlide, 15000);

    // Buton olayları
    prevBtn.addEventListener("click", () => {
        clearInterval(slideInterval); // Otomatik geçişi sıfırlar
        updateSlide(currentSlide - 1);
        slideInterval = setInterval(autoSlide, 15000);
    });

    nextBtn.addEventListener("click", () => {
        clearInterval(slideInterval);
        updateSlide(currentSlide + 1);
        slideInterval = setInterval(autoSlide, 15000);
    });

    // İlk slaytı aktif yap
    slides[currentSlide].classList.add("active");
});
