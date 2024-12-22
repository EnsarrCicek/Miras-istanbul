const searchIcon =document.getElementById('searchIcon')
const searchEngine =document.getElementById('searchEngine')

// Yukarıda yaptığımız olay const ile html ile js yi ıd ile bağladık

searchIcon.addEventListener('click',()=>{
  searchEngine.classList.toggle('active')
})

//Bu kısımda search ıconu ve arama kısmının açılıp kapanmasını yaptık yukarıda






//Burada hesabım kısmının bulunduğu açılır pencereyi yaptık
const dropdownIcon = document.getElementById('dropdownIcon');
const dropdown = dropdownIcon.parentElement;

dropdownIcon.addEventListener('click', () => {
    dropdown.classList.toggle('show');
});

// Dışarıya tıklanırsa açılır pencereyi kapatma
window.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});
