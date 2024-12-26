let currentSlide = 1;
const slides = document.querySelectorAll('.photo img');
const totalSlides = slides.length;

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.style.opacity = '0';  // Tüm slide'ların görünürlüğünü 0 yap
        slide.style.zIndex = '1';   // Z-index'i varsayılan yap

        if (i === index) {
            slide.style.opacity = '1';  // Sadece aktif slide'ın görünürlüğünü 1 yap
            slide.style.zIndex = '10';  // Aktif slide'ın z-index'ini en üste taşı
        }
    });
}

function nextSlide() {
    currentSlide++;
    if (currentSlide >= totalSlides) {
        currentSlide = 1;  // Son slide'a gelindiğinde başa dön
    }
    showSlide(currentSlide);
}

showSlide(currentSlide);
setInterval(nextSlide, 4000);  // Her 3 saniyede bir sonraki slayta geç
