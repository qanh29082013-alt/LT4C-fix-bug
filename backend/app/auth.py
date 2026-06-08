from __future__ import annotations

from typing import Any, Dict, TypedDict

import httpx
from fastapi import HTTPException, status

from .settings import Settings

AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"
USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


class GoogleUserResponse(TypedDict, total=False):
    sub: str
    name: str | None
    given_name: str | None
    family_name: str | None
    picture: str | None
    email: str | None
    email_verified: bool | None


class GoogleOAuthClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._timeout = httpx.Timeout(10.0, read=10.0)

    def build_authorize_url(self, state: str) -> str:
        params = {
            "client_id": self.settings.google_client_id,
            "redirect_uri": str(self.settings.google_redirect_uri),
            "response_type": "code",
            "scope": self.settings.google_scopes,
            "state": state,
            "prompt": "consent",
            "access_type": "online",
        }
        query = httpx.QueryParams(params)
        return f"{AUTHORIZE_URL}?{query}"

    async def exchange_code_for_token(self, code: str) -> str:
        payload = {
            "client_id": self.settings.google_client_id,
            "client_secret": self.settings.google_client_secret,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": str(self.settings.google_redirect_uri),
        }
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.post(
                    TOKEN_URL,
                    data=payload,
                )
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Google token exchange request failed.",
            ) from exc
        
        if response.status_code != status.HTTP_200_OK:
            # Log the error details for debugging
            from .main import logger
            logger.error("Google token exchange failed: Status=%s, Body=%s", response.status_code, response.text)
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to exchange authorization code: {response.text}",
            )
        data: Dict[str, Any] = response.json()
        access_token = data.get("access_token")
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token response from Google.",
            )
        return access_token

    async def fetch_current_user(self, access_token: str) -> Dict[str, Any]:
        headers = {"Authorization": f"Bearer {access_token}"}
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.get(USERINFO_URL, headers=headers)
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Google userinfo request failed.",
            ) from exc
        if response.status_code != status.HTTP_200_OK:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch user profile from Google.",
            )
        payload: GoogleUserResponse = response.json()
        google_id = payload.get("sub")
        if not google_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google response missing user identifier.",
            )
        # Construct standard user payload to map to model fields
        user_payload: Dict[str, Any] = {
            "discord_id": google_id,  # Map google 'sub' to discord_id column for consistency
            "username": payload.get("email", "").split("@")[0] or f"google-{google_id}",
            "display_name": payload.get("name") or payload.get("given_name"),
            "email": payload.get("email"),
            "avatar_url": payload.get("picture"),
            "phone_number": None,
        }
        return user_payload
