from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form, Header, Request
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from . import models, schemas, database
import os
from fastapi.staticfiles import StaticFiles
from datetime import datetime
from sqlalchemy import or_
from typing import Dict, List
from pathlib import Path
from pydantic import BaseModel

app = FastAPI()

# Uploads klasörünü oluştur
os.makedirs("uploads", exist_ok=True)

# Proje kök dizinini al
BASE_DIR = Path(__file__).resolve().parent.parent

# Static dosyaları için dizin yollarını tanımlayalım
STATIC_DIR = BASE_DIR / "public"
UPLOADS_DIR = BASE_DIR / "public" / "uploads"  # public/uploads klasörü için yeni yol

# StaticFiles mount işlemleri
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Uploads klasörünü ve alt klasörlerini oluştur
os.makedirs(str(UPLOADS_DIR / "profiles"), exist_ok=True)
os.makedirs(str(UPLOADS_DIR / "concerts"), exist_ok=True)  # Konser resimleri için klasör

# Varsayılan profil resminin olduğundan emin olun
DEFAULT_PROFILE_PATH = STATIC_DIR / "image" / "default-profile.jpg"
if not DEFAULT_PROFILE_PATH.exists():
    # image klasörünü oluştur
    (STATIC_DIR / "image").mkdir(exist_ok=True)
    # Varsayılan bir resim kopyala veya oluştur
    # Bu kısmı kendi varsayılan resminizle değiştirin
    import shutil
    source_image = STATIC_DIR / "image" / "default.jpg"  # Varolan bir resim
    if source_image.exists():
        shutil.copy(source_image, DEFAULT_PROFILE_PATH)

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

# Takip durumu için model
class FollowStatus(BaseModel):
    username: str
    target_username: str

# Takip işlemi için model
class FollowAction(BaseModel):
    username: str
    target_username: str
    action: str

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
async def get_gallery_posts(db: Session = Depends(database.get_db)):
    try:
        posts = db.query(models.Post).all()
        result = []
        for post in posts:
            result.append({
                "id": post.id,
                "title": post.title,
                "content": post.content,
                "author": post.author,
                "image_path": f"/uploads/{os.path.basename(post.image_path)}" if post.image_path else None
            })
        print("Posts data:", result)  # Debug için
        return result
    except Exception as e:
        print(f"Error in get_gallery_posts: {str(e)}")
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
    # Dosya yolunu düzelt
    file_name = f"{uuid4().hex}_{image.filename}"
    file_path = str(UPLOADS_DIR / "concerts" / file_name)  # Fiziksel dosya yolu
    
    # Dosyayı kaydet
    with open(file_path, "wb+") as file_object:
        file_object.write(await image.read())
    
    # Veritabanına kaydedilecek URL yolu
    db_file_path = f"/uploads/concerts/{file_name}"  # URL yolunu düzelt
    
    db_concert = models.Concert(
        title=title,
        venue=venue,
        date=date,
        price=price,
        description=description,
        lineup=lineup,
        image_path=db_file_path  # URL yolunu kaydet
    )
    
    db.add(db_concert)
    db.commit()
    db.refresh(db_concert)
    
    return db_concert

@app.get("/api/concerts/", response_model=list[schemas.Concert])
def read_concerts(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    concerts = db.query(models.Concert).offset(skip).limit(limit).all()
    for concert in concerts:
        # image_path'i düzelt
        if concert.image_path:
            # Sadece dosya adını al ve doğru yolu oluştur
            filename = os.path.basename(concert.image_path)
            concert.image_path = f"/uploads/concerts/{filename}"
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

        # Post sayısını hesapla
        post_count = db.query(models.Media).filter(models.Media.kullanici_id == user.id).count()

        # Profil fotoğrafı yolunu düzelt
        profile_image = None
        if user.profile_image:
            # /public kısmını kaldır
            profile_image = user.profile_image.replace('/public/', '/')
            if not profile_image.startswith('/'):
                profile_image = '/' + profile_image

        return {
            "username": user.username,
            "email": user.email,
            "profile_image": profile_image,
            "bio": user.bio,
            "post_count": post_count,
            "follower_count": user.follower_count or 0,
            "following_count": user.following_count or 0
        }
    except Exception as e:
        print(f"Error in get_user_profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Kullanıcının medya içeriklerini getir
@app.get("/api/kullanici/media")
async def get_user_media(username: str = Header(None), db: Session = Depends(database.get_db)):
    try:
        user = db.query(models.Kullanici).filter(models.Kullanici.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

        media_items = db.query(models.Media).filter(models.Media.kullanici_id == user.id).all()
        
        return [
            {
                "id": item.id,
                "file_path": f"/uploads/media/{os.path.basename(item.file_path)}" if item.file_path else None,
                "media_type": item.media_type,
                "title": item.title,
                "caption": item.caption,
                "author": item.author,
                "like_count": getattr(item, 'like_count', 0),
                "comment_count": getattr(item, 'comment_count', 0),
                "created_at": item.created_at
            } for item in media_items
        ]
    except Exception as e:
        print(f"Error in get_user_media: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Kullanıcının mesajlarını getir
@app.get("/api/kullanici/messages")
async def get_user_messages(username: str = Header(None), db: Session = Depends(database.get_db)):
    try:
        user = db.query(models.Kullanici).filter(models.Kullanici.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

        messages = db.query(models.Messages).filter(
            or_(
                models.Messages.sender_id == user.id,
                models.Messages.receiver_id == user.id
            )
        ).order_by(models.Messages.created_at.desc()).all()

        return [
            {
                "id": msg.id,
                "sender_id": msg.sender_id,
                "receiver_id": msg.receiver_id,
                "message": msg.message,
                "is_read": msg.is_read,
                "created_at": msg.created_at,
                "sender_username": db.query(models.Kullanici).get(msg.sender_id).username
            } for msg in messages
        ]
    except Exception as e:
        print(f"Error in get_user_messages: {str(e)}")
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
        
        # Dosya yolu oluştur - public/uploads/profiles altına kaydet
        uploads_dir = UPLOADS_DIR / "profiles"  # public/uploads/profiles
        uploads_dir.mkdir(parents=True, exist_ok=True)
        file_path = uploads_dir / new_filename
        
        # Eski profil fotoğrafını sil (varsa)
        if user.profile_image:
            old_file_path = UPLOADS_DIR / user.profile_image.lstrip('/')
            if old_file_path.exists():
                old_file_path.unlink()
        
        # Yeni dosyayı kaydet
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

@app.get("/api/kullanici/follow-status")
async def check_follow_status(follow_status: FollowStatus, db: Session = Depends(database.get_db)):
    print(f"Follow status check - Username: {follow_status.username}, Target: {follow_status.target_username}")
    
    try:
        if not follow_status.username or not follow_status.target_username:
            raise HTTPException(
                status_code=400, 
                detail="Username ve target_username gerekli"
            )

        # Takip eden kullanıcı
        follower = db.query(models.Kullanici).filter(models.Kullanici.username == follow_status.username).first()
        if not follower:
            raise HTTPException(status_code=404, detail=f"Kullanıcı bulunamadı: {follow_status.username}")

        # Takip edilen kullanıcı
        following = db.query(models.Kullanici).filter(models.Kullanici.username == follow_status.target_username).first()
        if not following:
            raise HTTPException(status_code=404, detail=f"Hedef kullanıcı bulunamadı: {follow_status.target_username}")

        # Takip durumunu kontrol et
        is_following = db.query(models.Followers).filter(
            models.Followers.follower_id == follower.id,
            models.Followers.following_id == following.id
        ).first() is not None

        return {"is_following": is_following}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in check_follow_status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Takip et/bırak
@app.post("/api/kullanici/follow")
async def follow_user(follow_action: FollowAction, db: Session = Depends(database.get_db)):
    print(f"Follow request - Username: {follow_action.username}, Target: {follow_action.target_username}, Action: {follow_action.action}")
    
    try:
        if not follow_action.username or not follow_action.target_username or not follow_action.action:
            raise HTTPException(
                status_code=400, 
                detail="Username, target_username ve action gerekli"
            )

        # Takip eden kullanıcı
        follower = db.query(models.Kullanici).filter(models.Kullanici.username == follow_action.username).first()
        if not follower:
            raise HTTPException(status_code=404, detail=f"Kullanıcı bulunamadı: {follow_action.username}")

        # Takip edilen kullanıcı
        following = db.query(models.Kullanici).filter(models.Kullanici.username == follow_action.target_username).first()
        if not following:
            raise HTTPException(status_code=404, detail=f"Hedef kullanıcı bulunamadı: {follow_action.target_username}")

        # Kendini takip etmeyi engelle
        if follower.id == following.id:
            raise HTTPException(status_code=400, detail="Kendinizi takip edemezsiniz")

        try:
            if follow_action.action == "follow":
                # Zaten takip ediyor mu kontrol et
                existing_follow = db.query(models.Followers).filter(
                    models.Followers.follower_id == follower.id,
                    models.Followers.following_id == following.id
                ).first()

                if not existing_follow:
                    new_follow = models.Followers(
                        follower_id=follower.id,
                        following_id=following.id
                    )
                    db.add(new_follow)
                    db.flush()

                    # Takipçi sayılarını güncelle
                    following.follower_count = db.query(models.Followers).filter(
                        models.Followers.following_id == following.id
                    ).count()
                    
                    follower.following_count = db.query(models.Followers).filter(
                        models.Followers.follower_id == follower.id
                    ).count()

            elif follow_action.action == "unfollow":
                db.query(models.Followers).filter(
                    models.Followers.follower_id == follower.id,
                    models.Followers.following_id == following.id
                ).delete()
                
                # Takipçi sayılarını güncelle
                following.follower_count = db.query(models.Followers).filter(
                    models.Followers.following_id == following.id
                ).count()
                
                follower.following_count = db.query(models.Followers).filter(
                    models.Followers.follower_id == follower.id
                ).count()

            db.commit()
            return {
                "message": f"Successfully {'followed' if follow_action.action == 'follow' else 'unfollowed'} user",
                "follower_count": following.follower_count,
                "following_count": follower.following_count
            }

        except Exception as e:
            db.rollback()
            print(f"Database error: {str(e)}")
            raise HTTPException(status_code=500, detail="Database error occurred")

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in follow_user: {str(e)}")
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
        
        # Dosya yolu oluştur (public/uploads/media altına kaydet)
        uploads_dir = UPLOADS_DIR / "media"  # public/uploads/media klasörüne kaydet
        uploads_dir.mkdir(parents=True, exist_ok=True)
        file_path = uploads_dir / new_filename
        
        # Dosyayı kaydet
        try:
            contents = await image.read()
            with open(file_path, "wb") as f:
                f.write(contents)
        except Exception as e:
            print(f"Error saving file: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Dosya kaydedilemedi: {str(e)}")
        
        # Medya kaydını oluştur - veritabanı yolunu düzelt
        db_file_path = f"uploads/media/{new_filename}"  # Veritabanında saklanacak yol
        new_media = models.Media(
            kullanici_id=user.id,
            media_type='photo',
            file_path=db_file_path,
            title=title,
            content=content,
            author=author,
            like_count=0,
            comment_count=0
        )
        
        db.add(new_media)
        db.commit()
        
        return {
            "message": "Medya başarıyla yüklendi",
            "media": {
                "id": new_media.id,
                "file_path": f"/uploads/media/{new_filename}",  # Frontend'e gönderilen yol
                "title": new_media.title,
                "author": new_media.author
            }
        }
        
    except Exception as e:
        print(f"Error in upload_media: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Medya detaylarını getir
@app.get("/api/media/{media_id}")
async def get_media_details(media_id: int, db: Session = Depends(database.get_db)):
    try:
        media = db.query(models.Media).filter(models.Media.id == media_id).first()
        if not media:
            raise HTTPException(status_code=404, detail="Medya bulunamadı")

        # Medyayı paylaşan kullanıcının bilgilerini al
        user = db.query(models.Kullanici).filter(models.Kullanici.id == media.kullanici_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

        # Medya ve profil fotoğrafı yollarını düzelt
        file_path = f"/uploads/media/{os.path.basename(media.file_path)}"
        user_image = f"/uploads/profiles/{os.path.basename(user.profile_image)}" if user.profile_image else None

        return {
            "id": media.id,
            "file_path": file_path,  # Düzeltilmiş medya yolu
            "title": media.title,
            "caption": media.caption,
            "like_count": media.like_count,
            "comment_count": media.comment_count,
            "created_at": media.created_at,
            "username": user.username,
            "user_id": user.id,
            "user_image": user_image,  # Düzeltilmiş profil fotoğrafı yolu
            "user_bio": user.bio
        }
    except Exception as e:
        print(f"Error in get_media_details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Keşfet sayfası için tüm medyaları getir
@app.get("/api/discover/media")
async def get_discover_media(db: Session = Depends(database.get_db)):
    try:
        media_items = db.query(models.Media).order_by(models.Media.created_at.desc()).all()
        
        result = []
        for item in media_items:
            user = db.query(models.Kullanici).filter(models.Kullanici.id == item.kullanici_id).first()
            
            # Dosya yolunu düzelt
            file_path = f"/uploads/media/{os.path.basename(item.file_path)}"
            
            result.append({
                "id": item.id,
                "file_path": file_path,  # Düzeltilmiş dosya yolu
                "title": item.title,
                "username": user.username,
                "user_image": user.profile_image,
                "like_count": item.like_count,
                "comment_count": item.comment_count,
                "created_at": item.created_at
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Beğeni durumunu kontrol et
@app.get("/api/media/{media_id}/like-status")
async def check_like_status(
    media_id: int,
    username: str = Header(None),
    db: Session = Depends(database.get_db)
):
    try:
        user = db.query(models.Kullanici).filter(models.Kullanici.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

        like = db.query(models.Like).filter(
            models.Like.kullanici_id == user.id,
            models.Like.media_id == media_id
        ).first()

        return {"is_liked": bool(like)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Yorumları getir
@app.get("/api/media/{media_id}/comments")
async def get_comments(media_id: int, db: Session = Depends(database.get_db)):
    try:
        # Tüm yorumları al
        comments = db.query(models.Comment).filter(
            models.Comment.media_id == media_id
        ).order_by(models.Comment.created_at.desc()).all()

        # Her yorum için kullanıcı bilgilerini ekle
        comment_list = []
        for comment in comments:
            user = db.query(models.Kullanici).filter(models.Kullanici.id == comment.kullanici_id).first()
            comment_list.append({
                "id": comment.id,
                "comment": comment.comment,
                "username": user.username,
                "user_image": user.profile_image,
                "created_at": comment.created_at
            })

        return comment_list

    except Exception as e:
        print(f"Error in get_comments: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Beğeni işlemi
@app.post("/api/media/{media_id}/like")
async def like_media(
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

        # Kullanıcının daha önce beğenip beğenmediğini kontrol et
        existing_like = db.query(models.Like).filter(
            models.Like.kullanici_id == user.id,
            models.Like.media_id == media_id
        ).first()

        if existing_like:
            # Beğeniyi kaldır
            db.delete(existing_like)
            media.like_count = max(0, media.like_count - 1)
        else:
            # Beğeni ekle
            new_like = models.Like(
                kullanici_id=user.id,
                media_id=media_id
            )
            db.add(new_like)
            media.like_count = (media.like_count or 0) + 1

        db.commit()
        return {"like_count": media.like_count}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Yorum ekleme endpoint'i
@app.post("/api/media/{media_id}/comment")
async def add_comment(
    media_id: int,
    comment: str = Form(...),
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

        new_comment = models.Comment(
            media_id=media_id,
            kullanici_id=user.id,
            comment=comment
        )
        db.add(new_comment)
        
        # Yorum sayısını güncelle - mevcut yorum sayısını hesapla
        comment_count = db.query(models.Comment).filter(
            models.Comment.media_id == media_id
        ).count()
        
        # Media tablosundaki yorum sayısını güncelle
        media.comment_count = comment_count + 1
        
        db.commit()
        db.refresh(new_comment)

        return {
            "id": new_comment.id,
            "comment": comment,
            "username": user.username,
            "created_at": new_comment.created_at,
            "comment_count": media.comment_count
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Admin kullanıcı kontrolü
async def check_admin(username: str = Header(None), db: Session = Depends(database.get_db)):
    if not username:
        raise HTTPException(status_code=401, detail="Yetkilendirme başlığı eksik")
    
    user = db.query(models.Kullanici).filter(models.Kullanici.username == username).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return user

# Tüm kullanıcıları getir
@app.get("/api/admin/users")
async def get_users(db: Session = Depends(database.get_db)):
    try:
        users = db.query(models.Kullanici).all()
        return {
            "users": [{
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "profile_image": user.profile_image,
                "bio": user.bio or "",
                "created_at": user.created_at.strftime("%Y-%m-%d %H:%M:%S") if user.created_at else None,
                "is_active": True  # Şimdilik hepsini aktif göster
            } for user in users]
        }
    except Exception as e:
        print(f"Error in get_users: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Tek kullanıcı bilgilerini getir
@app.get("/api/admin/users/{user_id}", response_model=schemas.UserAdmin)
async def get_user(user_id: int, 
                  admin: models.Kullanici = Depends(check_admin),
                  db: Session = Depends(database.get_db)):
    try:
        user = db.query(models.Kullanici).filter(models.Kullanici.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        return user
    except Exception as e:
        print(f"Error in get_user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Kullanıcı güncelle
@app.put("/api/admin/users/{user_id}", response_model=schemas.UserAdmin)
async def update_user(user_id: int, 
                     user_update: schemas.UserUpdate,
                     admin: models.Kullanici = Depends(check_admin),
                     db: Session = Depends(database.get_db)):
    try:
        user = db.query(models.Kullanici).filter(models.Kullanici.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

        # Güncelleme yapılacak alanları kontrol et
        if user_update.username is not None:
            user.username = user_update.username
        if user_update.email is not None:
            user.email = user_update.email
        if user_update.is_active is not None:
            user.is_active = user_update.is_active

        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        print(f"Error in update_user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Kullanıcı sil
@app.delete("/api/admin/users/{user_id}")
async def delete_user(user_id: int,
                     admin: models.Kullanici = Depends(check_admin),
                     db: Session = Depends(database.get_db)):
    try:
        user = db.query(models.Kullanici).filter(models.Kullanici.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

        db.delete(user)
        db.commit()
        return {"message": "Kullanıcı başarıyla silindi"}
    except Exception as e:
        print(f"Error in delete_user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/kullanici/media/{media_id}")
async def delete_media(media_id: int, username: str = Header(None), db: Session = Depends(database.get_db)):
    if not username:
        raise HTTPException(status_code=401, detail="Kullanıcı girişi gerekli")
    
    # Kullanıcıyı bul
    user = db.query(models.Kullanici).filter(models.Kullanici.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Media'yı bul
    media = db.query(models.Media).filter(
        models.Media.id == media_id,
        models.Media.kullanici_id == user.id
    ).first()
    
    if not media:
        raise HTTPException(status_code=404, detail="Medya bulunamadı veya bu işlem için yetkiniz yok")
    
    try:
        # Dosyayı fiziksel olarak sil
        file_path = os.path.join("public", media.file_path.lstrip('/'))
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Veritabanından sil
        db.delete(media)
        db.commit()
        
        return {"message": "Medya başarıyla silindi"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
