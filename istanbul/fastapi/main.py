from fastapi import FastAPI
import uvicorn

from pydantic import BaseModel

class UserRegister(BaseModel):
    username: str
    mail: str
    password: str

app = FastAPI()


@app.post("/register")
async def register_user(model: UserRegister):
   return print(str(model))
    #db connection aç 
    #modeldeki verileri tabloya yaz
   


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)