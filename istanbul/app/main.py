from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from . import models, schemas, database
import os
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Güvenlik için production'da spesifik origin'leri belirtin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Veritabanı tablolarını oluşturma
models.Base.metadata.create_all(bind=database.engine)

@app.post("/register")
async def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = models.User(email=user.email, username=user.username, password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User registered successfully!"}

@app.post("/login")
async def login_user(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
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
    posts = db.query(models.Post).all()
    return posts


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
