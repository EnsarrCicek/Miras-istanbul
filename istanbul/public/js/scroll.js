const targets =document.querySelectorAll('.target')

// Yukarda target adında tüm elementlere eişim sağlayacaksın
//.target bunun bir sınıf olduguunu gösteriri

const options ={
    threshold:0.3
    //Threshold sayfa içinde gösterilme oraının temsil
    //eder 0.5 yüzde elliye tekabul eder yani ben bu oranı nasıl belirlersem
    //yüzde elli yaptım atıyorum yani yüzde 50 si görünene kadar sayfayı göstermicek kaydırma anında
}

const callBack = (entries)=>{
    entries.forEach((entry)=> {
       
        if(entry.isIntersecting){
            entry.target.classList.add('active')
        }
        else{
            entry.target.classList.remove('active')

        }
    })
}

// bu IntersectionObserver bir options bir de callback fonksiyonu tanımlar
//callback entries değerlerini barındaracak. Entries değerleri birden fazla oldugu için foreach döngüsü
//ile içine giricez entry ile alıcaz sonra consoleçlog ile bunu ekrana yapıştırıcaz
const observer =new IntersectionObserver(callBack,options);

//elde ettiğimiz observer ile elementlerimize müdahale edicez

targets.forEach((target)=>{
    observer.observe(target)
})


//tüm targetlerı observerın observe özelliğini etkile dedik yukarıda
document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('postForm');

    postForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Formun varsayılan gönderim davranışını engelle

        const formData = new FormData(postForm);

        try {
            const response = await fetch('http://127.0.0.1:8000/add', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            alert('Post created successfully');
            // Yönlendirme işlemi
            window.location.href = 'gallery.html';
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            alert('Form submission failed');
        }
    });
});
