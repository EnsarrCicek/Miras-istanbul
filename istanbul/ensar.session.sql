-- Active: 1735144284403@@127.0.0.1@3306@ensar
DROP TABLE IF EXISTS concerts;

CREATE TABLE concerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    date VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    image_path VARCHAR(255),
    lineup TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Örnek konser verileri
INSERT INTO concerts (title, venue, date, price, description, image_path, lineup) VALUES 
('Zeytinli Rock Festivali', 'Ortaca/Sarıgerme Plajı', '20 Ağustos Çar - 14:00', 1344.00, 
'Türkiye''nin en büyük rock festivallerinden biri olan Zeytinli Rock Festivali, muhteşem line-up''ı ve eşsiz atmosferiyle sizlerle.',
'image/zeytinli.jpg', 'Duman,maNga,Teoman,Şebnem Ferah'),

('Sagopa Kajmer Konseri', 'Hayal Kahvesi Aqua Florya', '25 Ocak, 16 Şubat', 990.00,
'Türk rap müziğinin efsane ismi Sagopa Kajmer, benzersiz şovuyla sizlerle.',
'image/sagopa.jpg', 'Kapı Açılış: 19:00,Sahne: 21:00,Kapanış: 00:00'),

('Evgeny Grinko Konseri', 'Bostancı Gösteri Merkezi', '20 Şubat Per - 21:00', 1000.00,
'Modern klasik müziğin yenilikçi ismi Evgeny Grinko, etkileyici piyano performansıyla İstanbul''da.',
'image/evgeny.jpg', 'Valse,Field of Hope,Carousel,Once Upon a Time'),

('MABEL MATİZ 360', 'Volkswagen Arena', '14 Şubat, 15 Şubat', 500.00,
'Mabel Matiz, 360 derece sahne şovuyla unutulmaz bir performansa hazırlanıyor.',
'image/mabel.jpg', 'VIP Paket Mevcut,Meet & Greet İmkanı,Özel Sahne Şovu,Limited Edition Merch');

-- Mevcut adminleri kontrol et
SELECT * FROM admins;

-- Gerekirse tabloyu yeniden oluştur
DROP TABLE IF EXISTS admins;
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    is_superadmin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin kullanıcılarını ekle
INSERT INTO admins (username, password, email, is_superadmin) 
VALUES 
    ('Ensar', 'Ensar.2534', 'admin@example.com', TRUE),
    ('Hatice', 'Hatice.0525', 'hatice@example.com', TRUE);

-- Eklenen kayıtları kontrol et
SELECT * FROM admins;