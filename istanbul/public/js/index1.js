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

// Konser ekleme fonksiyonunu güncelle
async function addConcert(event) {
    event.preventDefault();
    
    const formData = new FormData();
    const fileInput = document.querySelector('#concertImage');
    
    if (fileInput.files.length > 0) {
        formData.append("file", fileInput.files[0]);
        
        try {
            const response = await fetch('/upload-concert', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const data = await response.json();
                const imagePath = `/uploads/concerts/${data.filename}`; // Yolu güncelle
                
                // Konser bilgilerini kaydet
                const concert = {
                    title: document.querySelector('#concertTitle').value,
                    date: document.querySelector('#concertDate').value,
                    location: document.querySelector('#concertLocation').value,
                    description: document.querySelector('#concertDescription').value,
                    image: imagePath // Güncellenmiş yol
                };
                
                // Konseri localStorage'a kaydet
                saveConcert(concert);
                
                // Formu temizle ve başarı mesajı göster
                document.querySelector('#concertForm').reset();
                alert('Konser başarıyla eklendi!');
                
                // Konser listesini güncelle
                displayConcerts();
                
            } else {
                throw new Error('Dosya yüklenemedi');
            }
        } catch (error) {
            console.error('Hata:', error);
            alert('Konser eklenirken bir hata oluştu');
        }
    } else {
        alert('Lütfen bir resim seçin');
    }
}
