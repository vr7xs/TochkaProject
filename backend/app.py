import fastapi_jsonrpc as jsonrpc
from auth.api import auth_app
from db_core.models import User, Video, Comment, Like, View
from db_core.db import database
from video.api import video_app
from fastapi.middleware.cors import CORSMiddleware
from config import FRONTEND_HOST

app = jsonrpc.API()
app.bind_entrypoint(auth_app)
app.bind_entrypoint(video_app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_HOST],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)

database.connect()
database.create_tables([User, Video, Comment, Like, View])
database.close()


@app.on_event('startup')
def startup():
    database.connect()


@app.on_event('shutdown')
def shutdown():
    if not database.is_closed():
        database.close()
