from datetime import timedelta, datetime
from jose import jwt
from fastapi import Request, Response
from passlib.context import CryptContext
from config import SECRET_KEY, ALGORITHM, SECURE, SAME_SITE
from config import ACCESS_TOKEN
from db_core.models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthTools:
    @classmethod
    def hash(cls, s):
        return pwd_context.hash(s)

    @classmethod
    def verify(cls, plain, hashed):
        return pwd_context.verify(plain, hashed)

    @classmethod
    def get_encoded_data(cls, data: dict, expires_delta: int | None = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + timedelta(minutes=expires_delta)
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @classmethod
    def get_token_data(cls, token):
        try:
            return jwt.decode(token, key=SECRET_KEY, algorithms=ALGORITHM)
        except:
            return None


def current_user(request: Request, response: Response):
    access = request.cookies.get('access')
    refresh = request.cookies.get('refresh')
    if not refresh:
        return None
    if not access:
        try:
            data = AuthTools.get_token_data(refresh)
            username = data['sub']
            data = {'sub': username}
            access = AuthTools.get_encoded_data(data, ACCESS_TOKEN)
            response.set_cookie(key='access', value=access, expires=ACCESS_TOKEN, samesite=SAME_SITE, secure=SECURE, httponly=True)
            return User.get_or_none(User.username == username)
        except:
            return None
    else:
        try:
            data = AuthTools.get_token_data(access)
            username = data['sub']
            return User.get_or_none(User.username == username)
        except:
            return None

