"""One-off cleanup: restore pre-existing booking to pending, reject QA-created bookings, drop TEST_ reviews."""
import os, asyncio
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')
from motor.motor_asyncio import AsyncIOMotorClient


async def main():
    db = AsyncIOMotorClient(os.environ['MONGO_URL'])[os.environ['DB_NAME']]
    async for b in db.bookings.find({}, {"_id": 0}):
        print(b["id"], b["name"], b["checkin"], b["checkout"], b["status"])
    # QA-created bookings -> rejected (frees dates)
    r = await db.bookings.update_many({"email": {"$in": ["test_booker@example.com", "test_qa_fe@example.com"]}},
                                      {"$set": {"status": "rejected"}})
    print("qa bookings rejected:", r.modified_count)
    # restore the pre-existing demo booking to pending
    r2 = await db.bookings.update_many({"email": "guest@test.com"}, {"$set": {"status": "pending"}})
    print("demo booking restored to pending:", r2.modified_count)
    r3 = await db.reviews.delete_many({"name": {"$regex": "^TEST_"}})
    print("test reviews removed:", r3.deleted_count)


asyncio.run(main())
