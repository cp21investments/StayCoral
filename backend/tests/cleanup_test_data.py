"""Remove QA-created inquiries/properties (prefixed TEST_ / test-) from the DB."""
import asyncio
from dotenv import dotenv_values
from motor.motor_asyncio import AsyncIOMotorClient

env = dotenv_values("/app/backend/.env")


async def main():
    c = AsyncIOMotorClient(env["MONGO_URL"])
    db = c[env["DB_NAME"]]
    r1 = await db.inquiries.delete_many({"name": {"$regex": "^TEST_"}})
    r2 = await db.properties.delete_many({"slug": {"$regex": "^test-"}})
    print("inquiries deleted:", r1.deleted_count, "properties deleted:", r2.deleted_count)
    print("remaining properties:", await db.properties.count_documents({}))
    print("remaining inquiries:", await db.inquiries.count_documents({}))
    c.close()


asyncio.run(main())
