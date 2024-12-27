document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('http://localhost:8000/add', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Başarıyla yüklendi!');
            window.location.href = '/public/gallery.html';
        } else {
            const error = await response.json();
            alert('Hata: ' + error.detail);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Bir hata oluştu!');
    }
}); 