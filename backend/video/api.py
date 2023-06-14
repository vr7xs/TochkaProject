from fastapi import Depends, Form, UploadFile, File, HTTPException
from fastapi_jsonrpc import Entrypoint
from auth.auth import current_user
from db_core.exceptions import DataError, AuthError
from db_core.models import Video, User, Comment, Like, View
from video.s3 import S3Client, generate_unique_filename
from video.utils import check_file_signature
from peewee import fn
from typing import Optional

video_app = Entrypoint(path='/api/v1/video')
s3_client = S3Client()


@video_app.method()
async def get_video_by_id(id: int, user: User = Depends(current_user)) -> dict:
    video = Video.get_or_none(Video.id == id)
    if not video:
        raise DataError()
    if user:
        view = View.get_or_none((View.user == user) & (View.video == video))
        if not view:
            View.create(video=video, user=user)
    return {'video': {
        'id': video.id,
        'name': video.name,
        'user_id': video.user.id,
        'user': video.user.username,
        'description': video.description,
        'likes': video.video_likes.count(),
        'preview': s3_client.get_object_url(video.preview),
        'videoUrl': s3_client.get_object_url(video.cloud_name),
        'views': video.views.count()
    },
        'comments': [
            {'id': comment.id, 'user': comment.user.username, 'text': comment.text, 'created_at': comment.created_at}
            for comment in video.video_comments.order_by(Comment.created_at)],
        'extra': [{'id': video.id, 'name': video.name, 'user': video.user.username,
                   'preview': s3_client.get_object_url(video.preview)} for video in get_most_liked_videos(4, id)]}


@video_app.method()
async def get_user_info(user: User = Depends(current_user)) -> dict:
    if not user:
        raise AuthError()
    videos = Video.select().where(Video.user == user)
    return {'user': {
        'username': user.username,
        'email': user.email
    },
        'videos': [{'id': video.id,
                    'name': video.name,
                    'preview': s3_client.get_object_url(video.preview),
                    } for video in videos],
        'views': [{'id': video.id,
                   'name': video.name,
                   'preview': s3_client.get_object_url(video.preview),
                   'user': video.user.username} for video in get_users_views(user)]
    }


@video_app.method()
async def delete_comment(comment_id: int, user: User = Depends(current_user)) -> dict:
    if not user:
        raise AuthError()
    comment = Comment.get_or_none(Comment.id == comment_id)
    if not comment:
        raise DataError()
    if comment.user == user:
        context = {'id': comment.id, 'status': 'deleted'}
        comment.delete_instance()
        return context
    raise DataError()


@video_app.method()
async def like(video_id, user: User = Depends(current_user)) -> dict:
    if not user:
        raise AuthError()
    video = Video.get_or_none(Video.id == video_id)
    if not video:
        raise DataError()
    like_record = Like.get_or_none((Like.user == user) & (Like.video == video))
    if like_record:
        context = {'id': like_record.id, 'status': 'removed'}
        like_record.delete_instance()
        return context
    like_record = Like(
        user=user,
        video=video
    )
    like_record.save()
    return {'id': like_record.id, 'status': 'saved'}


@video_app.post(path='/api/v1/upload')
async def upload_video(name: str = Form(...),
                       description: Optional[None | str] = None,
                       video: UploadFile = File(...),
                       preview: UploadFile = File(...),
                       user: User = Depends(current_user)):
    if not user:
        raise HTTPException(status_code=401, detail='unautorized')
    if not name or all(' ' == i for i in name):
        raise DataError()
    if not (check_file_signature(video) and check_file_signature(preview)):
        raise DataError()
    video.file.seek(0)
    preview.file.seek(0)
    video_unique_filename = generate_unique_filename(video.filename)
    preview_unique_filename = generate_unique_filename(preview.filename)
    s3_client.upload_file(video.file, video_unique_filename)
    s3_client.upload_file(preview.file, preview_unique_filename)
    video = Video(
        user=user,
        name=name,
        description=description,
        cloud_name=video_unique_filename,
        preview=preview_unique_filename
    )
    video.save()
    return {'id': video.id, 'status': 'uploaded'}


@video_app.method()
async def delete_video(video_id: int, user: User = Depends(current_user)) -> dict:
    if not user:
        raise AuthError()
    video = Video.get_or_none(Video.id == video_id)
    if not video:
        raise DataError()
    if video.user == user:
        s3_client.delete_object(video.cloud_name)
        s3_client.delete_object(video.preview)
        context = {'id': video.id, 'status': 'deleted'}
        video.delete_instance()
        return context
    raise DataError()


@video_app.method()
async def upload_comment(text: str, video_id: int, user: User = Depends(current_user)) -> dict:
    if not user:
        raise AuthError()
    video = Video.get_or_none(Video.id == video_id)
    if not video:
        raise DataError()
    if not text or all(' ' == i for i in text):
        raise DataError()
    comment = Comment(user=user, video=video, text=text)
    comment.save()
    return {'status': 'uploaded', 'comment': {'id': comment.id, 'user': user.username, 'text': comment.text,
                                              'created_at': comment.created_at}}


@video_app.method()
async def get_videos_for_main_page() -> list[dict]:
    videos = get_most_liked_videos(12)
    return [{'id': video.id,
             'name': video.name,
             'user': video.user.username,
             'likes': video.video_likes.count(),
             'preview': s3_client.get_object_url(video.preview)} for video in videos]


@video_app.method()
async def get_user_page(user_id: int) -> dict:
    user = User.get_or_none(User.id == user_id)
    if not user:
        raise DataError()
    users_videos = Video.select().where(Video.user == user)
    return {'user': {'id': user.id, 'username': user.username, 'email': user.email},
            'videos': [{'id': video.id, 'name': video.name, 'preview': s3_client.get_object_url(video.preview)}
                       for video in users_videos]}


def get_most_liked_videos(limit, exclude: int | None = None):
    return Video.select().where((Video.id != exclude) if exclude else None).join(Like, 'FULL JOIN').group_by(
        Video.id).order_by(fn.COUNT(Like).desc()).limit(limit)


def get_users_views(user, limit: int = None):
    videos = Video.select().join(View, 'FULL JOIN').where((View.user == user) & (Video.user != user)).limit(limit)
    return videos
