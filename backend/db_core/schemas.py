from pydantic import BaseModel, EmailStr, validator


class RegisterUser(BaseModel):
    username: str
    email: EmailStr
    password: str

    @validator('username', 'email', 'password')
    def length_validate(cls, v, values, **kwargs):
        if len(v) < 8:
            raise ValueError('More than 8 symbols')
        return v

    @validator('username', 'email', 'password')
    def space_validate(cls, v, values, **kwargs):
        if all(' ' == i for i in v):
            raise ValueError('Couldn\'t be empty values')
        return v


class LoginUser(BaseModel):
    username: str
    password: str


class CommentSchema(BaseModel):
    video_id: int
    text: str
