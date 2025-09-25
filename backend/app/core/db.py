from motor.motor_asyncio import AsyncIOMotorClient

class MongoDBClient:
    def __init__(self):
        self.client = None
        self.db = None

    async def start_client(self, uri: str, db_name: str):
        self.client = AsyncIOMotorClient(uri)
        self.db = self.client[db_name]

    async def close_client(self):
        if self.client:
            self.client.close()

    def get_db(self):
        return self.db

mongodb_client = MongoDBClient()

def get_database():
    return mongodb_client.get_db()