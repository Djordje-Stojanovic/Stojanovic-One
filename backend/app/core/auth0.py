from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from jose.exceptions import JWTError
from .config import settings
import httpx

token_auth_scheme = HTTPBearer()

async def get_token_auth_header(credentials: HTTPAuthorizationCredentials = Depends(token_auth_scheme)) -> str:
    return credentials.credentials

async def verify_token(token: str = Depends(get_token_auth_header)):
    jwks_url = f'https://{settings.AUTH0_DOMAIN}/.well-known/jwks.json'
    async with httpx.AsyncClient() as client:
        jwks = await client.get(jwks_url)
        jwks = jwks.json()

    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token header")

    rsa_key = {}
    for key in jwks["keys"]:
        if key["kid"] == unverified_header["kid"]:
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"]
            }
    if rsa_key:
        try:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=[settings.AUTH0_ALGORITHMS],
                audience=settings.AUTH0_API_AUDIENCE,
                issuer=settings.AUTH0_ISSUER
            )
            return payload
        except JWTError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unable to find appropriate key")
