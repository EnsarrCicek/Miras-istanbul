from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form, Header
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from . import models, schemas, database
import os
from fastapi.staticfiles import StaticFiles
from datetime import datetime
from sqlalchemy import or_
from typing import Dict, List

app = FastAPI()

# Uploads klasörünü oluştur
os.makedirs("uploads", exist_ok=True)

# Proje kök dizinini al
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Statik dosyaları serve et
app.mount("/static", StaticFiles(directory="public"), name="static")
app.mount("/uploads", StaticFiles(directory=os.path.join(BASE_DIR, "public", "uploads")), name="uploads")

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Geliştirme için. Prodüksiyonda spesifik origin'leri belirtin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Veritabanı tablolarını oluşturma
models.Base.metadata.create_all(bind=database.engine)

@app.post("/register")
async def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = models.Kullanici(email=user.email, username=user.username, password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User registered successfully!"}

@app.post("/login")
async def login_user(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    db_user = db.query(models.Kullanici).filter(models.Kullanici.username == user.username).first()
    if not db_user or db_user.password != user.password:
        raise HTTPException(status_code=400, detail="Invalid username or password")
    return {"message": "Login successful!"}

@app.get("/get")
async def get_message():
    return {"message": "GET request successful!"}

@app.post("/add")
async def create_post(
    title: str = Form(...),
    content: str = Form(...),
    author: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    # Fotoğrafı kaydetme işlemi
    uploads_dir = "uploads"
    os.makedirs(uploads_dir, exist_ok=True)  # 'uploads' dizini yoksa oluştur

    # Benzersiz bir dosya ismi oluşturma
    unique_filename = f"{uuid4().hex}_{image.filename}"
    file_location = os.path.join(uploads_dir, unique_filename)

    with open(file_location, "wb+") as file_object:
        file_object.write(image.file.read())

    # Veriyi veri tabanına kaydetme
    post = models.Post(
        title=title,
        content=content,
        author=author,
        image_path=file_location
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    return {"message": "Post created successfully", "post": post}


@app.get("/gallery")
async def get_gallery(db: Session = Depends(database.get_db)):
    try:
        posts = db.query(models.Post).all()
        # Her post için görsel yolunu düzelt
        for post in posts:
            if post.image_path and not post.image_path.startswith(('http://', 'https://')):
                post.image_path = f"uploads/{os.path.basename(post.image_path)}"
        return posts
    except Exception as e:
        print(f"Gallery error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/posts")
async def get_posts(db: Session = Depends(database.get_db)):
    posts = db.query(models.Post).all()
    return {"posts": posts}


@app.post("/test-post")
def test_post():
    print("POST request received at /test-post")
    return {"message": "Post request received successfully"}

@app.get("/")
def read_root():
    return {"message": "Server is running"}

@app.post("/api/admin/concerts/", response_model=schemas.Concert)
async def create_concert(
    title: str = Form(...),
    venue: str = Form(...),
    date: str = Form(...),
    price: float = Form(...),
    description: str = Form(None),
    lineup: str = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    # Resim kaydetme
    uploads_dir = "uploads/concerts"
    os.makedirs(uploads_dir, exist_ok=True)
    
    file_name = f"{uuid4().hex}_{image.filename}"
    file_path = os.path.join(uploads_dir, file_name)
    
    with open(file_path, "wb+") as file_object:
        file_object.write(await image.read())

    # Konser oluşturma
    db_concert = models.Concert(
        title=title,
        venue=venue,
        date=date,
        price=price,
        description=description,
        lineup=lineup,
        image_path=file_path
    )
    
    db.add(db_concert)
    db.commit()
    db.refresh(db_concert)
    return db_concert

@app.get("/api/concerts/", response_model=list[schemas.Concert])
def read_concerts(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    concerts = db.query(models.Concert).offset(skip).limit(limit).all()
    return concerts

@app.delete("/api/admin/concerts/{concert_id}")
def delete_concert(concert_id: int, db: Session = Depends(database.get_db)):
    concert = db.query(models.Concert).filter(models.Concert.id == concert_id).first()
    if concert is None:
        raise HTTPException(status_code=404, detail="Concert not found")
    
    # Resmi sil
    if concert.image_path and os.path.exists(concert.image_path):
        os.remove(concert.image_path)
    
    db.delete(concert)
    db.commit()
    return {"message": "Concert deleted"}

@app.put("/api/admin/concerts/{concert_id}", response_model=schemas.Concert)
async def update_concert(
    concert_id: int,
    title: str = Form(...),
    venue: str = Form(...),
    date: str = Form(...),
    price: float = Form(...),
    description: str = Form(None),
    lineup: str = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(database.get_db)
):
    # Konseri bul
    concert = db.query(models.Concert).filter(models.Concert.id == concert_id).first()
    if concert is None:
        raise HTTPException(status_code=404, detail="Concert not found")
    
    # Yeni resim yüklendiyse
    if image:
        # Eski resmi sil
        if concert.image_path and os.path.exists(concert.image_path):
            os.remove(concert.image_path)
        
        # Yeni resmi kaydet
        uploads_dir = "uploads/concerts"
        os.makedirs(uploads_dir, exist_ok=True)
        
        file_name = f"{uuid4().hex}_{image.filename}"
        file_path = os.path.join(uploads_dir, file_name)
        
        with open(file_path, "wb+") as file_object:
            file_object.write(await image.read())
        
        concert.image_path = file_path
    
    # Diğer alanları güncelle
    concert.title = title
    concert.venue = venue
    concert.date = date
    concert.price = price
    concert.description = description
    concert.lineup = lineup
    
    db.commit()
    db.refresh(concert)
    return concert

@app.get("/api/concerts/{concert_id}", response_model=schemas.Concert)
def read_concert(concert_id: int, db: Session = Depends(database.get_db)):
    concert = db.query(models.Concert).filter(models.Concert.id == concert_id).first()
    if concert is None:
        raise HTTPException(status_code=404, detail="Concert not found")
    return concert

@app.post("/admin/login")
async def admin_login(admin: schemas.AdminBase, db: Session = Depends(database.get_db)):
    print(f"Login attempt - username: {admin.username}, password: {admin.password}")  # Debug log
    
    try:
        db_admin = db.query(models.Admin).filter(
            models.Admin.username == admin.username
        ).first()
        
        if not db_admin:
            print(f"Admin not found: {admin.username}")
            raise HTTPException(status_code=400, detail="Admin bulunamadı")
        
        if db_admin.password != admin.password:
            print(f"Password mismatch for: {admin.username}")
            raise HTTPException(status_code=400, detail="Şifre hatalı")
        
        print(f"Successful login for: {admin.username}")
        return {
            "message": "Admin girişi başarılı!",
            "admin": {
                "username": db_admin.username,
                "email": db_admin.email,
                "is_superadmin": db_admin.is_superadmin
            }
        }
    except Exception as e:
        print(f"Error during admin login: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/create", response_model=schemas.Admin)
async def create_admin(admin: schemas.AdminCreate, db: Session = Depends(database.get_db)):
    db_admin = models.Admin(
        username=admin.username,
        password=admin.password,  # Gerçek uygulamada şifre hash'lenmelidir
        email=admin.email,
        is_superadmin=False  # Varsayılan olarak normal admin
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin

# Kullanıcı profil bilgilerini getir
@app.get("/api/kullanici/profile")
async def get_user_profile(username: str = Header(None), db: Session = Depends(database.get_db)):
    try:
        user = db.query(models.Kullanici).filter(models.Kullanici.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

        # Gönderi, takipçi ve takip sayılarını hesapla
        post_count = db.query(models.Media).filter(models.Media.kullanici_id == user.id).count()
        follower_count = db.query(models.Followers).filter(models.Followers.following_id == user.id).count()
        following_count = db.query(models.Followers).filter(models.Followers.follower_id == user.id).count()

        return {
            "username": user.username,
            "email": user.email,
            "profile_image": user.profile_image,
            "bio": user.bio,
            "post_count": post_count,
            "follower_count": follower_count,
            "following_count": following_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Kullanıcının medya içeriklerini getir
@app.get("/api/kullanici/media")
async def get_user_media(username: str = Header(None), db: Session = Depends(database.get_db)):
    try:
        user = db.query(models.Kullanici).filter(models.Kullanici.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

        media = db.query(models.Media).filter(models.Media.kullanici_id == user.id).all()
        return [
            {
                "id": m.id,
                "media_type": m.media_type,
                "file_path": m.file_path,
                "caption": m.caption,
                "created_at": m.created_at
            } for m in media
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Kullanıcının mesajlarını getir
@app.get("/api/kullanici/messages")
async def get_user_messages(username: str = Header(None), db: Session = Depends(database.get_db)):
    try:
        user = db.query(models.Kullanici).filter(models.Kullanici.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

        # Gelen ve giden mesajları al
        messages = db.query(models.Messages).filter(
            or_(
                models.Messages.sender_id == user.id,
                models.Messages.receiver_id == user.id
            )
        ).order_by(models.Messages.created_at.desc()).all()

        return [
            {
                "id": m.id,
                "sender_id": m.sender_id,
                "receiver_id": m.receiver_id,
                "message": m.message,
                "is_read": m.is_read,
                "created_at": m.created_at,
                "sender_username": db.query(models.Kullanici).get(m.sender_id).username
            } for m in messages
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Profil fotoğrafı güncelleme endpoint'i
@app.post("/api/kullanici/update-profile-image")
async def update_profile_image(
    profile_image: UploadFile = File(...),
    username: str = Header(None),
    db: Session = Depends(database.get_db)
):
    try:
        user = db.query(models.Kullanici).filter(models.Kullanici.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

        # Dosya uzantısını al
        file_extension = os.path.splitext(profile_image.filename)[1]
        
        # Yeni dosya adını oluştur
        new_filename = f"profile_{user.id}_{int(datetime.now().timestamp())}{file_extension}"
        
        # Dosya yolu oluştur
        uploads_dir = os.path.join(BASE_DIR, "public", "uploads", "profiles")
        os.makedirs(uploads_dir, exist_ok=True)
        file_path = os.path.join(uploads_dir, new_filename)
        
        # Dosyayı kaydet
        try:
            contents = await profile_image.read()
            with open(file_path, "wb") as f:
                f.write(contents)
        except Exception as e:
            print(f"Error saving file: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Dosya kaydedilemedi: {str(e)}")
        
        # Veritabanında profil fotoğrafı yolunu güncelle
        db_file_path = f"/uploads/profiles/{new_filename}"
        user.profile_image = db_file_path
        db.commit()
        
        return {
            "message": "Profil fotoğrafı başarıyla güncellendi",
            "profile_image": db_file_path
        }
        
    except Exception as e:
        print(f"Error in update_profile_image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/kullanici/update-bio")
async def update_bio(
    bio: str = Form(...),
    username: str = Header(None),
    db: Session = Depends(database.get_db)
):
    try:
        user = db.query(models.Kullanici).filter(models.Kullanici.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

        # Biyografiyi güncelle
        user.bio = bio
        db.commit()
        
        return {
            "message": "Biyografi başarıyla güncellendi",
            "bio": bio
        }
        
    except Exception as e:
        print(f"Error in update_bio: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/kullanici/follow-status/{target_username}")
async def get_follow_status(
    target_username: str,
    username: str = Header(None),
    db: Session = Depends(database.get_db)
):
    try:
        follower = db.query(models.Kullanici).filter(models.Kullanici.username == username).first()
        target = db.query(models.Kullanici).filter(models.Kullanici.username == target_username).first()
        
        if not follower or not target:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
            
        is_following = db.query(models.Followers).filter(
            models.Followers.follower_id == follower.id,
            models.Followers.following_id == target.id
        ).first() is not None
        
        return {"is_following": is_following}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/kullanici/follow")
async def follow_user(
    follow_data: Dict[str, str],
    username: str = Header(None),
    db: Session = Depends(database.get_db)
):
    try:
        # Takip eden kullanıcıyı bul
        follower = db.query(models.Kullanici).filter(models.Kullanici.username == username).first()
        if not follower:
            raise HTTPException(status_code=404, detail="Takip eden kullanıcı bulunamadı")

        # Takip edilecek kullanıcıyı bul
        target = db.query(models.Kullanici).filter(
            models.Kullanici.username == follow_data["target_username"]
        ).first()
        if not target:
            raise HTTPException(status_code=404, detail="Takip edilecek kullanıcı bulunamadı")

        # Kendini takip etmeyi engelle
        if follower.id == target.id:
            raise HTTPException(status_code=400, detail="Kendinizi takip edemezsiniz")

        if follow_data["action"] == "follow":
            # Zaten takip ediliyor mu kontrol et
            existing_follow = db.query(models.Followers).filter(
                models.Followers.follower_id == follower.id,
                models.Followers.following_id == target.id
            ).first()

            if not existing_follow:
                # Yeni takip kaydı oluştur
                new_follow = models.Followers(
                    follower_id=follower.id,
                    following_id=target.id
                )
                db.add(new_follow)
                
                # Takipçi sayılarını güncelle
                if target.follower_count is None:
                    target.follower_count = 0
                if follower.following_count is None:
                    follower.following_count = 0
                    
                target.follower_count += 1
                follower.following_count += 1

        elif follow_data["action"] == "unfollow":
            # Takip kaydını bul ve sil
            follow_record = db.query(models.Followers).filter(
                models.Followers.follower_id == follower.id,
                models.Followers.following_id == target.id
            ).first()

            if follow_record:
                db.delete(follow_record)
                
                # Takipçi sayılarını güncelle
                if target.follower_count > 0:
                    target.follower_count -= 1
                if follower.following_count > 0:
                    follower.following_count -= 1

        db.commit()
        return {"message": "İşlem başarılı", "action": follow_data["action"]}

    except Exception as e:
        print(f"Follow error: {str(e)}")  # Debug için
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/kullanici/upload-media")
async def upload_media(
    title: str = Form(...),
    content: str = Form(...),
    author: str = Form(...),
    image: UploadFile = File(...),
    username: str = Header(None),
    db: Session = Depends(database.get_db)
):
    try:
        user = db.query(models.Kullanici).filter(models.Kullanici.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

        # Dosya uzantısını al
        file_extension = os.path.splitext(image.filename)[1]
        
        # Yeni dosya adını oluştur
        new_filename = f"post_{user.id}_{int(datetime.now().timestamp())}{file_extension}"
        
        # Dosya yolu oluştur
        uploads_dir = os.path.join("public", "uploads", "media")
        os.makedirs(uploads_dir, exist_ok=True)
        file_path = os.path.join(uploads_dir, new_filename)
        
        # Dosyayı kaydet
        try:
            contents = await image.read()
            with open(file_path, "wb") as f:
                f.write(contents)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Dosya kaydedilemedi: {str(e)}")
        
        # Medya kaydını oluştur
        new_media = models.Media(
            kullanici_id=user.id,
            media_type='photo',
            file_path=f"/static/uploads/media/{new_filename}",
            caption=content,
            title=title,
            author=author
        )
        
        db.add(new_media)
        db.commit()
        
        return {
            "message": "Medya başarıyla yüklendi",
            "media": {
                "id": new_media.id,
                "file_path": new_media.file_path,
                "caption": new_media.caption,
                "title": new_media.title,
                "author": new_media.author
            }
        }
        
    except Exception as e:
        print(f"Error in upload_media: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Medya detaylarını getir
@app.get("/api/media/{media_id}", response_model=schemas.MediaDetail)
async def get_media_details(
    media_id: int,
    username: str = Header(None),
    db: Session = Depends(database.get_db)
):
    try:
        user = db.query(models.Kullanici).filter(models.Kullanici.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

        media = db.query(models.Media).filter(models.Media.id == media_id).first()
        if not media:
            raise HTTPException(status_code=404, detail="Medya bulunamadı")

        # Beğeni durumunu kontrol et
        is_liked = db.query(models.Like).filter(
            models.Like.kullanici_id == user.id,
            models.Like.media_id == media_id
        ).first() is not None

        # Yorum sayısını al
        comment_count = db.query(models.Comment).filter(models.Comment.media_id == media_id).count()

        return {
            **media.__dict__,
            "is_liked": is_liked,
            "comment_count": comment_count
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Yorumları getir
@app.get("/api/media/{media_id}/comments", response_model=List[schemas.Comment])
async def get_media_comments(media_id: int, db: Session = Depends(database.get_db)):
    try:
        comments = db.query(models.Comment).filter(
            models.Comment.media_id == media_id
        ).order_by(models.Comment.created_at.desc()).all()

        return [{
            **comment.__dict__,
            "username": db.query(models.Kullanici).get(comment.kullanici_id).username,
            "user_image": db.query(models.Kullanici).get(comment.kullanici_id).profile_image
        } for comment in comments]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Beğeni işlemi
@app.post("/api/media/{media_id}/like")
async def like_media(
    media_id: int,
    like_data: schemas.LikeAction,
    username: str = Header(None),
    db: Session = Depends(database.get_db)
):
    try:
        user = db.query(models.Kullanici).filter(models.Kullanici.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

        media = db.query(models.Media).filter(models.Media.id == media_id).first()
        if not media:
            raise HTTPException(status_code=404, detail="Medya bulunamadı")

        if like_data.action == "like":
            # Beğeni ekle
            if not db.query(models.Like).filter_by(kullanici_id=user.id, media_id=media_id).first():
                new_like = models.Like(kullanici_id=user.id, media_id=media_id)
                db.add(new_like)
                media.like_count += 1
                
                # Medya sahibinin toplam beğeni sayısını güncelle
                media_owner = db.query(models.Kullanici).get(media.kullanici_id)
                media_owner.total_likes += 1

        else:
            # Beğeni kaldır
            like = db.query(models.Like).filter_by(kullanici_id=user.id, media_id=media_id).first()
            if like:
                db.delete(like)
                media.like_count = max(0, media.like_count - 1)
                
                # Medya sahibinin toplam beğeni sayısını güncelle
                media_owner = db.query(models.Kullanici).get(media.kullanici_id)
                media_owner.total_likes = max(0, media_owner.total_likes - 1)

        db.commit()
        return {"like_count": media.like_count}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Yorum ekle
@app.post("/api/media/{media_id}/comment", response_model=schemas.Comment)
async def add_comment(
    media_id: int,
    comment_data: schemas.CommentCreate,
    username: str = Header(None),
    db: Session = Depends(database.get_db)
):
    try:
        user = db.query(models.Kullanici).filter(models.Kullanici.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

        new_comment = models.Comment(
            kullanici_id=user.id,
            media_id=media_id,
            comment=comment_data.comment
        )
        db.add(new_comment)
        db.commit()
        db.refresh(new_comment)

        return {
            **new_comment.__dict__,
            "username": user.username,
            "user_image": user.profile_image
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
