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

-- Tabloları sil
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS followers;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS kullanici;

-- Tabloları yeniden oluştur (models.py'daki tanımlamalara göre)

-- Kullanıcıları users tablosundan kullanici tablosuna aktar

-- Kullanici tablosuna yeni sütunlar ekle
ALTER TABLE kullanici
ADD COLUMN follower_count INT DEFAULT 0,
ADD COLUMN following_count INT DEFAULT 0;

-- Media tablosuna yeni sütunlar ekle
ALTER TABLE media
ADD COLUMN title VARCHAR(255),
ADD COLUMN content TEXT,
ADD COLUMN author VARCHAR(255);

-- Beğeni sayısı için media tablosuna sütun ekle
ALTER TABLE media
ADD COLUMN like_count INT DEFAULT 0;

-- Kullanıcı toplam beğeni sayısı için kullanici tablosuna sütun ekle
ALTER TABLE kullanici
ADD COLUMN total_likes INT DEFAULT 0;

-- Yorumlar tablosunu oluştur
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    media_id INT NOT NULL,
    kullanici_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
    FOREIGN KEY (kullanici_id) REFERENCES kullanici(id) ON DELETE CASCADE
);

-- Beğeniler tablosu
CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kullanici_id INT NOT NULL,
    media_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES kullanici(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (kullanici_id, media_id)
);

-- Media tablosunu güncelle
ALTER TABLE media
ADD COLUMN like_count INT DEFAULT 0,
ADD COLUMN comment_count INT DEFAULT 0;

-- Önce mevcut like_count sütununu sil
ALTER TABLE media DROP COLUMN like_count;

-- Sonra yeniden ekle
ALTER TABLE media
ADD COLUMN like_count INT DEFAULT 0,
ADD COLUMN comment_count INT DEFAULT 0;