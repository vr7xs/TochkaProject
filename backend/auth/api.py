from config import SAME_SITE, SECURE, ACCESS_TOKEN, REFRESH_TOKEN
from db_core.schemas import RegisterUser, LoginUser
from db_core.exceptions import UserError, AuthError
from auth.auth import AuthTools, current_user
from fastapi_jsonrpc import Entrypoint
from fastapi import Response, Depends
from db_core.models import User

auth_app = Entrypoint(path='/api/v1/auth', tags=['auth'])


@auth_app.method(tags=['auth'])
async def register(user_info: RegisterUser, response: Response) -> dict:
    user_exists = User.get_or_none((User.email == user_info.email) | (User.username == user_info.username))
    if user_exists:
        raise UserError()
    try:
        user = User(
            username=user_info.username.lower(),
            email=user_info.email.lower(),
            hashed_password=AuthTools.hash(user_info.password)
        )
        user.save()
        data = {'sub': user.username}
        access = AuthTools.get_encoded_data(data, ACCESS_TOKEN)
        refresh = AuthTools.get_encoded_data(data, REFRESH_TOKEN)
        response.set_cookie(key='access', value=access, httponly=True, expires=ACCESS_TOKEN, samesite=SAME_SITE, secure=SECURE)
        response.set_cookie(key='refresh', value=refresh, httponly=True, expires=REFRESH_TOKEN, samesite=SAME_SITE, secure=SECURE)
        return {'id': user.id, 'status': 'created'}
    except:
        return {'status': 404}


@auth_app.method(tags=['auth'])
async def login(user: LoginUser, response: Response) -> dict:
    db_user = User.get_or_none(User.username == user.username.lower())
    if not db_user:
        raise UserError()
    data = {'sub': db_user.username}
    access = AuthTools.get_encoded_data(data, ACCESS_TOKEN)
    refresh = AuthTools.get_encoded_data(data, REFRESH_TOKEN)
    response.set_cookie(key='access', value=access, httponly=True, expires=ACCESS_TOKEN, samesite=SAME_SITE, secure=SECURE)
    response.set_cookie(key='refresh', value=refresh, httponly=True, expires=REFRESH_TOKEN, samesite=SAME_SITE, secure=SECURE)
    return {'id': db_user.id, 'status': 'authorized'}


@auth_app.method(tags=['auth'])
async def logout(response: Response, user: User = Depends(current_user)) -> dict:
    if not user:
        raise AuthError()
    response.delete_cookie('access', httponly=True, samesite=SAME_SITE, secure=SECURE)
    response.delete_cookie('refresh', httponly=True, samesite=SAME_SITE, secure=SECURE)
    return {'id': user.id, 'status': 'logged out'}


@auth_app.method(tags=['user'])
async def current_user(user: User = Depends(current_user)) -> dict:
    if not user:
        raise AuthError()
    return {'id': user.id, 'username': user.username}

