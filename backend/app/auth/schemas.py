from pydantic import BaseModel


class CurrentUser(BaseModel):
    id: str
    name: str
    email: str
    email_verified: bool
    image: str | None = None
