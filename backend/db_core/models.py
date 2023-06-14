from datetime import datetime
import peewee
from db_core.db import BaseModel


class User(BaseModel):
    id: int = peewee.AutoField(primary_key=True)
    email: str = peewee.CharField(unique=True, null=False, max_length=140)
    username: str = peewee.CharField(unique=True, null=False, max_length=50)
    hashed_password: str = peewee.CharField(null=False, max_length=200)
    created_at: datetime = peewee.DateTimeField(null=False, default=datetime.utcnow)

    class Meta:
        db_table = 'users'


class Video(BaseModel):
    id: int = peewee.AutoField(primary_key=True)
    user: User = peewee.ForeignKeyField(User, on_delete='CASCADE', backref='videos')
    name: str = peewee.CharField(null=False, max_length=100)
    description: str = peewee.CharField(null=True, max_length=100)
    cloud_name: str = peewee.CharField(null=False, unique=True, max_length=200)
    preview: str = peewee.CharField(null=False, unique=True, max_length=200)
    created_at: datetime = peewee.DateTimeField(null=False, default=datetime.utcnow)

    class Meta:
        db_table = 'videos'


class Comment(BaseModel):
    id: int = peewee.AutoField(primary_key=True)
    user: User = peewee.ForeignKeyField(User, on_delete='CASCADE', backref='users_comments')
    video: Video = peewee.ForeignKeyField(Video, on_delete='CASCADE', backref='video_comments')
    text: str = peewee.CharField(null=False, max_length=60)
    created_at: datetime = peewee.DateTimeField(default=datetime.utcnow, null=False)


class Like(BaseModel):
    user: User = peewee.ForeignKeyField(User, on_delete='CASCADE', backref='users_likes')
    video: Video = peewee.ForeignKeyField(Video, on_delete='CASCADE', backref='video_likes')


class View(BaseModel):
    user: User = peewee.ForeignKeyField(User, on_delete='CASCADE', backref='video_views')
    video: Video = peewee.ForeignKeyField(Video, on_delete='CASCADE', backref='views')
