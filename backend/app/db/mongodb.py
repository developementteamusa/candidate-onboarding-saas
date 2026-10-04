from pymongo import MongoClient
from pymongo.server_api import ServerApi

from app.core.config import get_settings


settings = get_settings()


class MongoDB:
    client = None
    database = None


mongodb = MongoDB()


def connect_to_mongodb():
    if mongodb.client is not None:
        return

    mongodb.client = MongoClient(
        settings.mongodb_uri,
        server_api=ServerApi("1"),
        serverSelectionTimeoutMS=5000,
    )

    mongodb.client.admin.command("ping")

    mongodb.database = mongodb.client[
        settings.mongodb_database
    ]


def close_mongodb_connection():
    if mongodb.client is not None:
        mongodb.client.close()
        mongodb.client = None
        mongodb.database = None


def get_database():
    if mongodb.database is None:
        raise RuntimeError(
            "MongoDB connection has not been initialized."
        )

    return mongodb.database


def ping_database():
    if mongodb.client is None:
        return False

    try:
        mongodb.client.admin.command("ping")
        return True
    except Exception:
        return False