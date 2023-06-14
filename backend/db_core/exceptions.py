from fastapi_jsonrpc import BaseError


class UserError(BaseError):
    CODE = -32001
    MESSAGE = 'No User / User exists'


class AuthError(BaseError):
    CODE = -32002
    MESSAGE = 'Unauthorized'


class DataError(BaseError):
    CODE = -32003
    MESSAGE = 'Enter correct data'


class S3Error(BaseError):
    CODE = -32004
    MESSAGE = 'Objects storage error'


