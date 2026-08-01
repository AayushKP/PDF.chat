from fastapi import Depends, HTTPException, Request, status

from app.auth.client import better_auth
from app.auth.schemas import CurrentUser


async def get_current_user(
    request: Request,
) -> CurrentUser:
    cookie = request.headers.get("cookie")

    if cookie is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    try:
        data = await better_auth.get_session(cookie)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session.",
        )

    user = data.get("user")

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    return CurrentUser(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        email_verified=user["emailVerified"],
        image=user.get("image"),
    )
