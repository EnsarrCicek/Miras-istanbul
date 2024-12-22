document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.heritage-cards');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let slidePosition = 0;
    const slideWidth = 320; // card width + gap

    nextBtn.addEventListener('click', () => {
        const maxSlide = slider.children.length * slideWidth - slider.offsetWidth;
        if (slidePosition > -maxSlide) {
            slidePosition -= slideWidth;
            slider.style.transform = `translateX(${slidePosition}px)`;
        }
    });

    prevBtn.addEventListener('click', () => {
        if (slidePosition < 0) {
            slidePosition += slideWidth;
            slider.style.transform = `translateX(${slidePosition}px)`;
        }
    });
}); 