import httpx

from app.config import settings


class BetterAuthClient:
    def __init__(self):
        self.base_url = settings.FRONTEND_URL.rstrip("/")

    async def get_session(
        self,
        cookie: str,
    ) -> dict:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{self.base_url}/api/auth/get-session",
                headers={
                    "Cookie": cookie,
                },
            )

            if response.status_code != 200:
                raise Exception("Invalid session")

            return response.json()


better_auth = BetterAuthClient()
