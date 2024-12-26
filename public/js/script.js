/**
 * Haritaya bir marker eklemek için fonksiyon
 * @param {maplibregl.Map} map - MapLibre harita nesnesi
 * @param {number[]} coordinates - Marker'ın konumunu belirten [longitude, latitude] koordinatları
 * @param {string} iconUrl - Marker için kullanılacak ikonun URL'si
 * @param {string} [popupHtml] - İsteğe bağlı olarak popup içeriği
 */
function addMarker(map, coordinates, iconUrl, popupHtml) {
    // Marker için DOM elementini oluşturur
    const el = document.createElement('div');
    el.style.backgroundImage = `url('${iconUrl}')`; // İkon URL'sini uygular
    el.style.backgroundSize = 'cover';
    el.style.width = '50px'; // İkonun genişliği
    el.style.height = '50px'; // İkonun yüksekliği
    el.style.borderRadius = '50%'; // İkonun yuvarlak olması için
    el.style.cursor = 'pointer'; // Fare üzerinde ikon gösterildiğinde işaretçi olarak pointer
    
    // Popup oluşturur (eğer sağlanmışsa)
    const popup = popupHtml ? new maplibregl.Popup({ offset: 25 }).setHTML(popupHtml) : null;

    // Marker'ı oluşturur ve haritaya ekler
    new maplibregl.Marker({ element: el })
        .setLngLat(coordinates) // Marker'ın koordinatlarını ayarlar
        .setPopup(popup) // Marker'a popup ekler (eğer sağlanmışsa)
        .addTo(map); // Marker'ı haritaya ekler

    // Popup açıldığında buton olay dinleyicisini ekle
    if (popup) {
        popup.on('open', () => {
            // Mevcut olay dinleyicilerini temizle
            document.querySelectorAll('.popup-button').forEach(button => {
                button.removeEventListener('click', handleButtonClick);
            });
            
            // Butonlara tıklama olayı ekle
            document.querySelectorAll('.popup-button').forEach(button => {
                button.addEventListener('click', handleButtonClick);
            });
        });
    }
}

// Buton tıklama olay işleyici fonksiyonu
function handleButtonClick(event) {
    const url = event.target.getAttribute('data-url');
    if (url) {
        window.open(url, '_blank'); // Yeni sekmede aç
    }
}

// Örnek kullanım
const map = new maplibregl.Map({
    container: 'map',
    style: 'https://api.maptiler.com/maps/basic/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
    center: [28.97120142737262, 41.012964817985306],
    zoom: 13
});

// Popup içeriğini burada oluşturun
const popupHtml1 = `
    <div>
    
        <p>Sultanahmet Camisi.</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Sultanahmet+Camii,+Binbirdirek,+At+Meydan%C4%B1+Cd+No:10,+34122+Fatih%2F%C4%B0stanbul/@41.0231281,28.9247471,13z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14cab9bd6570f4e1:0xe52df7368a157ca4!2m2!1d28.9768138!2d41.0054096!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 3px 8px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer; border-radius:10% ">
            Yol Tarifi
        </button>
    </div>
`;

const popupHtml2 = `
    <div>
        <p>Ayasofya.</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Sultan+Ahmet,+Ayasofya-i+Kebir+Cami-i+%C5%9Eerifi,+Ayasofya+Meydan%C4%B1,+Fatih%2F%C4%B0stanbul/@41.0268419,28.9491815,14z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14cab9be92011c27:0x236e6f6f37444fae!2m2!1d28.980175!2d41.008583!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;
const popupHtml3 = `
    <div>
        <p>Topkapı Sarayı.</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Cankurtaran,+Topkap%C4%B1+Saray%C4%B1+M%C3%BCzesi,+Fatih%2F%C4%B0stanbul/@41.0231928,28.9225636,13z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14cab9b8afa5f833:0x15aa1943c3015300!2m2!1d28.9833789!2d41.0115195!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;
const popupHtml4 = `
    <div>
        <p>Yerebatan Sarnıcı.</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Alemdar,+Yerebatan+Sarn%C4%B1c%C4%B1,+Yerebatan+Caddesi,+Fatih%2F%C4%B0stanbul/@41.0269558,28.948033,14z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14cab9bde0c66ac9:0x60c02fe1ee6d8471!2m2!1d28.977878!2d41.008384!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;
const popupHtml5 = `
    <div>
        <p>Gülhane Parkı.</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Cankurtaran,+G%C3%BClhane+Park%C4%B1,+Kennedy+Caddesi,+Fatih%2F%C4%B0stanbul/@41.0231928,28.9247875,13z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14cab9c735bcda2b:0x65e6a6edfa646cb!2m2!1d28.9815101!2d41.0133079!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;

const popupHtml6 = `
    <div>
        <p>Galata Kulesi</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Bereketzade,+Galata+Kulesi,+Beyo%C4%9Flu%2F%C4%B0stanbul/@41.0355335,28.9572286,15z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14cab9e7a7777c43:0x4c76cf3dcc8b330b!2m2!1d28.9741286!2d41.025569!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;

const popupHtml7= `
    <div>
        <p>Dolmabahçe sarayı</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Vi%C5%9Fnezade,+Dolmabah%C3%A7e+Saray%C4%B1,+Dolmabah%C3%A7e+Caddesi,+Be%C5%9Fikta%C5%9F%2F%C4%B0stanbul/@41.0480715,28.9716911,15z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14cab7761a3b7de3:0xdcd33e38cf3b830b!2m2!1d29.0004594!2d41.0391643!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;

const popupHtml8= `
    <div>
        <p>İstiklal Caddesi</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/%C4%B0stiklal+Cd.,+Beyo%C4%9Flu%2F%C4%B0stanbul/@41.0396427,28.9606638,15z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14cab761b76c7cf7:0xd59a76ee7cacf701!2m2!1d28.9779527!2d41.0337874!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;

const popupHtml9= `
    <div>
        <p>Saint Antoine Kilisesi</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Tomtom,+Saint+Antuan+Katolik+Kilisesi,+%C4%B0stiklal+Caddesi,+Beyo%C4%9Flu%2F%C4%B0stanbul/@41.0385882,28.9626356,15z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14cab7600647761f:0x87ccd464f889e39!2m2!1d28.9771334!2d41.0323076!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;
const popupHtml10= `
    <div>
        <p>Beylerbeyi Sarayı</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Beylerbeyi,+Beylerbeyi+Saray%C4%B1,+Abdullaha%C4%9Fa+Caddesi,+%C3%9Csk%C3%BCdar%2F%C4%B0stanbul/@41.0499587,28.9834696,14z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14cab7da02210c0f:0xaa4ea6c2e70ee70a!2m2!1d29.0400503!2d41.042501!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;

const popupHtml11= `
    <div>
        <p>Kız Kulesi</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Salacak,+K%C4%B1z+Kulesi,+%C3%9Csk%C3%BCdar%2F%C4%B0stanbul/@41.0335283,28.9616298,13z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14cab82bea99445f:0x6ed7f4baceb4476c!2m2!1d29.0041105!2d41.0211216!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;

const popupHtml12= `
    <div>
        <p>Fetih Paşa Korusu</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Fethi+Pa%C5%9Fa+Korusu,+Kuzguncuk,+%C3%9Csk%C3%BCdar%2F%C4%B0stanbul/@41.0495003,28.9834696,14z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14cab7ec0b2cab8f:0x30ecd38f5422f88c!2m2!1d29.026851!2d41.032158!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;
const popupHtml13= `
    <div>
        <p>Nakkaştepe Millet Bahçesi</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Kuzguncuk,+Nakka%C5%9Ftepe+Millet+Bah%C3%A7esi,+G%C3%BCm%C3%BC%C5%9Fyolu+%C3%87%C4%B1kmaz%C4%B1+Sokak,+%C3%9Csk%C3%BCdar%2F%C4%B0stanbul/@41.0496433,28.9523236,13z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14cab72134271ee9:0xb78d35eeb85f36eb!2m2!1d29.0385452!2d41.0380656!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;

const popupHtml14= `
    <div>
        <p>Kuzguncuk Evleri</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Kuzguncuk,+Kuzguncuk+Evleri,+%C3%9Csk%C3%BCdar%2F%C4%B0stanbul/@41.0495003,28.9834696,14z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14cab70107737f47:0xb1784b468aea4f63!2m2!1d29.0300243!2d41.0356182!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;

const popupHtml15= `
    <div>
        <p>Ortaköy Camisi</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Mecidiye,+Ortak%C3%B6y+Camii,+Mecidiye+K%C3%B6pr%C3%BCs%C3%BC+Sokak+B%C3%BCy%C3%BCk+Mecidiye+Cami,+D:1,+Be%C5%9Fikta%C5%9F%2F%C4%B0stanbul/@41.052464,28.9737498,14z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14cab7c8e42887ad:0xfd73f2a29eafc8bc!2m2!1d29.0269478!2d41.0472151!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;
const popupHtml16= `
    <div>
        <p>Yıldız Sarayı</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Y%C4%B1ld%C4%B1z,+Y%C4%B1ld%C4%B1z+Saray%C4%B1+M%C3%BCzesi,+Be%C5%9Fikta%C5%9F%2F%C4%B0stanbul/@41.0523479,28.9672208,14z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14cab7bd125beb5f:0x7af33e6b5e9ecc69!2m2!1d29.011557!2d41.0500208!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;

const popupHtml17= `
    <div>
        <p>Yıldız Parkı</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Y%C4%B1ld%C4%B1z,+Y%C4%B1ld%C4%B1z+Park%C4%B1,+%C3%87%C4%B1ra%C4%9Fan+Caddesi,+Be%C5%9Fikta%C5%9F%2F%C4%B0stanbul/@41.0523479,28.9707383,14z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14cab7ba74cafa3d:0x8d3f0c3423ee17e6!2m2!1d29.0152631!2d41.0491431!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;
const popupHtml18= `
    <div>
        <p>Emirgan Korusu</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Re%C5%9Fitpa%C5%9Fa,+Emirgan+Korusu,+Emirgan+Sokak,+Sar%C4%B1yer%2F%C4%B0stanbul/@41.0770388,28.966032,13z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14caca7152beb381:0x163da0c8ff4d15bb!2m2!1d29.053112!2d41.1086496!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;
const popupHtml19= `
    <div>
        <p>Rumeli Hisarı</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Rumeli+Hisar%C4%B1,+Sar%C4%B1yer%2F%C4%B0stanbul/@41.0715805,28.9624366,13z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14caca01a906122d:0x2b734e631d4be15c!2m2!1d29.0503567!2d41.0869107!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;

const popupHtml20= `
    <div>
        <p>Beykoz Kasrı</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Beykoz+Kasr%C4%B1,+Yal%C4%B1k%C3%B6y,+34820+Beykoz%2F%C4%B0stanbul/@41.0919287,28.9631801,12z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14cacadb0419d253:0x30c0076bb1763e44!2m2!1d29.0837234!2d41.1389336!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;

const popupHtml21= `
    <div>
        <p>Anadolu Hisarı Kalesi</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Anadolu+Hisar%C4%B1,+Anadolu+Hisar%C4%B1,+Beykoz%2F%C4%B0stanbul/@41.0673372,28.9819525,13z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14caca1fcf05448f:0xaba3e984536ec08!2m2!1d29.0669017!2d41.082152!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D" 
        style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;

const popupHtml22= `
    <div>
        <p>Fatih Korusu</p>
        <button class="popup-button" data-url="https://www.google.com/maps/dir/41.0445138,28.9645082/Kavac%C4%B1k,+Ota%C4%9Ftepe+Fatih+Korusu,+Beykoz%2F%C4%B0stanbul/@41.0732116,28.9819525,13z/data=!3m1!4b1!4m10!4m9!1m1!4e1!1m5!1m1!1s0x14caca0325629c6f:0x5589bc01ffd47abf!2m2!1d29.0734238!2d41.0894693!3e0?entry=ttu&g_ep=EgoyMDI0MDgyMS4wIKXMDSoASAFQAw%3D%3D"
         style="padding: 5px 10px; background-color: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Yol Tarifi
        </button>
    </div>
`;
// Marker'ları ekle
//Fatih
addMarker(map, [28.97674950793629,41.00542593827896], 'https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcSFReePZVsTHgDjihAov2GAmX-PBXBKspWLFD_vVto-xIUJyq2wVt8jd0SZMl3xefIixk_exnrzl8HN4s3r9HFJ9CkEwq85z6lsIDBs2w', popupHtml1);
addMarker(map, [28.979965457671852,41.00851114605041], 'https://st.depositphotos.com/1007905/2221/i/450/depositphotos_22211193-stock-photo-hagia-sophia-istanbul.jpg', popupHtml2);
addMarker(map, [28.98406298147131,41.01279557806987], 'https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcQ7m7gvM_hRU6eurVL3JrrtKyrOiM2dXMBqfKZbTQ-ZWqUJpTOdkl2JwAMjUkEXhty-rJrjeEuWUQLZBChcnMejiVp4YAunaW3oXi8NYw', popupHtml3);
addMarker(map, [28.97784927116234,41.00825395387773], 'https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcTq8S63LQrnOHnbKg7Q8laC5O8QelRr6CTd_btLsmzbasFv10i1V63jJANxV-chftd_hQDALyNNWyOSGaf0W5o7Zc71481p5zfp5i8XUTk', popupHtml4);
addMarker(map, [ 28.981567547936294,41.013589488237244], 'https://st4.depositphotos.com/2338807/20294/i/380/depositphotos_202948568-stock-photo-gulhane-park-rosehouse-park-historical.jpg', popupHtml5);
//Beyoğlu
addMarker(map, [ 28.974224475226265,41.025628470692936], 'https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcRvXoDpL3GjUqN10eRkpxge51MP-e6igfmaSt0Kr4YG-4nawgllp-4IzpI3FdNOAlc1rn77mH0tagDoy3rkjbmUONVmxqsZJ0LC1Wyw_w', popupHtml5);
addMarker(map, [ 28.974224475226265,41.025628470692936], 'https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcRvXoDpL3GjUqN10eRkpxge51MP-e6igfmaSt0Kr4YG-4nawgllp-4IzpI3FdNOAlc1rn77mH0tagDoy3rkjbmUONVmxqsZJ0LC1Wyw_w', popupHtml6);
addMarker(map, [ 28.99623832142842,41.038047427842145], 'https://st5.depositphotos.com/2353269/66479/i/380/depositphotos_664790980-stock-photo-sunset-shot-closed-gate-leading.jpg', popupHtml7);
addMarker(map, [  28.982748017195405,41.03572531954981], 'https://st3.depositphotos.com/1031967/17961/i/380/depositphotos_179618424-stock-photo-istanbul-turkey-april-istanbul-nostalgic.jpg', popupHtml8);
addMarker(map, [  28.977003186509478,41.032322110519715], 'https://st4.depositphotos.com/14787348/39218/i/380/depositphotos_392183192-stock-photo-istanbul-turkey-december-2018-antoine.jpg', popupHtml9);
//Üsküdar
addMarker(map, [  29.0401448465569,41.04225405269824], 'https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcRIwydQzwdENbQesa607w44iilSbJkKjufWLXbT5rmNhTdOaFeb3tUsUi9T-oTak-6bIajqxb3dit-IyvHNwhJZG1gJ7B9RJpS1sGCDuQ', popupHtml10);
addMarker(map, [    29.004013209117772,41.0211090952094], 'https://st2.depositphotos.com/4142459/11200/i/380/depositphotos_112006524-stock-photo-maidens-tower-at-the-southern.jpg', popupHtml11);
addMarker(map, [ 29.02649264550442,41.03225583862101], 'https://st4.depositphotos.com/7323362/21323/i/380/depositphotos_213237880-stock-photo-green-park-street-a-bridge.jpg', popupHtml12);
addMarker(map, [ 29.037544067455627,41.03542853599154], 'https://lh5.googleusercontent.com/p/AF1QipN9G6plAGIZxaQzYYnXHVuNmlnak6GvnqGVqDMM=w675-h390-n-k-no', popupHtml13);
addMarker(map, [ 29.030809805409632,41.03466789551865], 'https://st3.depositphotos.com/14787348/37695/i/380/depositphotos_376952542-stock-photo-historical-colorful-houses-kuzguncuk-kuzguncuk.jpg', popupHtml14);
//Beşiktaş
addMarker(map, [  29.026637239426293,41.04733502384809], 'https://st.depositphotos.com/1007970/1223/i/380/depositphotos_12236896-stock-photo-ortakoy-mosque-and-bosphorus-bridge.jpg', popupHtml15);
addMarker(map, [   29.013309965606112,41.05352984731485], 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe9MldImeL2UVAJMiH167xizNPV1SYehFfUg&s', popupHtml16);
addMarker(map, [  29.015873289686652,41.04810238196143], 'https://fastly.4sqi.net/img/general/200x200/5105965_dOfcjOLea93Mah45JJBHFBJxkVP4mqFa5487feT9r4E.jpg', popupHtml17);
//Sarıyer
addMarker(map, [   29.053442488081345,41.108294617534284], 'https://st4.depositphotos.com/9475128/26752/i/380/depositphotos_267526546-stock-photo-emirgan-istanbul-turkey-april-2019.jpg', popupHtml18);
addMarker(map, [    29.05581549073517,41.084811847094244], 'https://st.depositphotos.com/1000135/3789/i/380/depositphotos_37899017-stock-photo-rumeli-fortress.jpg', popupHtml19);
//Beykoz
addMarker(map, [   29.08263993121429,41.13866753036507], 'https://st.depositphotos.com/2602391/4656/i/380/depositphotos_46563533-stock-photo-kucuksu-pavilion-istanbul-turkey.jpg', popupHtml20);
addMarker(map, [      29.066810880918666,41.082102328300294], 'https://st2.depositphotos.com/6558960/9339/i/380/depositphotos_93399808-stock-photo-anatolian-castle-anadolu-hisari.jpg', popupHtml21);
addMarker(map, [ 29.07081628703341,41.0899228185919], 'https://fastly.4sqi.net/img/general/200x200/20040699_tq3Q_j0jvoTqehYbGvwB6uhK_zoHutCWSogWEKwUJ9Q.jpg', popupHtml22);

// Dropdown item event listeners
document.getElementById('fatih').addEventListener('click', () => {
    map.flyTo({
        center: [     28.980097741117874,41.01015173916002],
        zoom: 14,
        speed: 1.2,
        curve: 1,
        easing(t) {
            return t;
        },
        essential: true
    });
});

document.getElementById('beyoglu').addEventListener('click', () => {
    map.flyTo({
        center: [  28.97855781359587,41.031299259098574],
        zoom: 14,
        speed: 1.2,
        curve: 1,
        easing(t) {
            return t;
        },
        essential: true
    });
});

document.getElementById('üsküdar').addEventListener('click', () => {
    map.flyTo({
        center: [29.030845117178558,41.03472137344568],
        zoom: 13,
        speed: 1.2,
        curve: 1,
        easing(t) {
            return t;
        },
        essential: true
    });
});
document.getElementById('besiktas').addEventListener('click', () => {
    map.flyTo({
        center: [ 29.017260642068777,41.05271575591837],
        zoom: 14,
        speed: 1.2,
        curve: 1,
        easing(t) {
            return t;
        },
        essential: true
    });
});
document.getElementById('sarıyer').addEventListener('click', () => {
    map.flyTo({
        center: [29.047712579780438,41.100556314596844],
        zoom: 12,
        speed: 1.2,
        curve: 1,
        easing(t) {
            return t;
        },
        essential: true
    });
});

document.getElementById('beykoz').addEventListener('click', () => {
    map.flyTo({
        center: [ 29.098201134253827,41.12994341624943],
        zoom: 12,
        speed: 1.2,
        curve: 1,
        easing(t) {
            return t;
        },
        essential: true
    });
});
// Geocoder API'si ile arama özelliği
const geocoderApi = {
    forwardGeocode: async (config) => {
        const features = [];
        try {
            const request = `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geojson=1&addressdetails=1`;
            const response = await fetch(request);
            const geojson = await response.json();
            for (const feature of geojson.features) {
                const center = [
                    feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
                    feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2
                ];
                const point = {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: center
                    },
                    place_name: feature.properties.display_name,
                    properties: feature.properties,
                    text: feature.properties.display_name,
                    place_type: ['place'],
                    center
                };
                features.push(point);
            }
        } catch (e) {
            console.error(`Failed to forwardGeocode with error: ${e}`);
        }
        return {
            features
        };
    }
};

const geocoder = new MaplibreGeocoder(geocoderApi, {
    maplibregl: maplibregl
});

document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
