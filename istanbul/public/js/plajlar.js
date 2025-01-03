document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('.slider-container');

    sliders.forEach(sliderContainer => {
        const slider = sliderContainer.querySelector('.slider');
        const slides = slider.querySelectorAll('img');
        const nav = sliderContainer.querySelector('.slider-nav');
        const prevBtn = sliderContainer.querySelector('.prev');
        const nextBtn = sliderContainer.querySelector('.next');
        let currentSlide = 0;
        let touchStartX = 0;
        let touchEndX = 0;

        // Slider noktalarını oluştur
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('slider-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            nav.appendChild(dot);
        });

        const dots = nav.querySelectorAll('.slider-dot');

        function updateDots() {
            dots.forEach(dot => dot.classList.remove('active'));
            dots[currentSlide].classList.add('active');
        }

        function goToSlide(n) {
            currentSlide = n;
            slider.style.transform = `translateX(-${currentSlide * 100}%)`;
            updateDots();
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            goToSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            goToSlide(currentSlide);
        }

        // Dokunmatik ekran desteği
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeDistance = touchEndX - touchStartX;
            if (Math.abs(swipeDistance) > 50) {
                if (swipeDistance > 0) {
                    prevSlide();
                } else {
                    nextSlide();
                }
            }
        }

        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);

        // Otomatik geçiş
        let slideInterval = setInterval(nextSlide, 5000);

        // Fare üzerine geldiğinde otomatik geçişi durdur
        sliderContainer.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });

        // Fare ayrıldığında otomatik geçişi tekrar başlat
        sliderContainer.addEventListener('mouseleave', () => {
            slideInterval = setInterval(nextSlide, 5000);
        });
    });
}); 