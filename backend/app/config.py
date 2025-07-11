# backend/app/config.py

import cloudinary
import os
from dotenv import load_dotenv

load_dotenv()

def configure_cloudinary():
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        secure=True,
    )