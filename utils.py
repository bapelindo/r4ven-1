import json
import requests
import socket
import os
import re
import sys

# Cloudinary and environment variable imports
import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv

DISCORD_WEBHOOK_FILE_NAME = "dwebhook.js"

if sys.stdout.isatty():
    R = '\033[31m'  # Red
    G = '\033[32m'  # Green
    C = '\033[36m'  # Cyan
    W = '\033[0m'   # Reset
    Y = '\033[33m'  # Yellow
    M = '\033[35m'  # Magenta
    B = '\033[34m'  # Blue
else:
    R = G = C = W = Y = M = B = ''

def get_file_data(file_path):
    """
    gets the file data
    :param file_path: the path to the file you want to read
    :return: the file data as plain text
    """
    with open(file_path, 'r') as open_file:
        return open_file.read()


def update_webhook(webhook: str, webhook_data: dict):
    """
    will send a post request to the given webhook
    :param webhook: the webhook you want to update
    """
    request_payload = json.dumps(webhook_data)
    headers = {'Content-Type': 'application/json'}
    requests.request("POST", webhook, headers=headers, data=request_payload)

def check_and_get_webhook_url(folder_name):
    file_path = os.path.join(folder_name, DISCORD_WEBHOOK_FILE_NAME)

    # Regular expression to match valid Discord webhook URLs
    webhook_regex = re.compile(
    r'^https://(discord(app)?\.com)/api(/v\d+)?/webhooks/\d+/[A-Za-z0-9_-]+/?$')
    

    def is_valid_webhook(url):
        return webhook_regex.match(url) is not None

    def get_valid_webhook():
        while True:
            print(f'\n{B}[+] {C}Enter Discord Webhook URL:{W}')
            dwebhook_input = input().strip()
            if is_valid_webhook(dwebhook_input):
                with open(file_path, 'w') as file:
                    file.write(dwebhook_input)
                return dwebhook_input
            else:
                print(f"{R}Invalid webhook. Please enter a valid Discord webhook URL.{W}")

    if not os.path.exists(file_path):
        return get_valid_webhook()
    else:
        with open(file_path, 'r') as file:
            webhook_url = file.read().strip()
            if is_valid_webhook(webhook_url):
                return webhook_url
            else:
                print(f"{R}Invalid webhook URL found in file. Please enter a valid Discord webhook URL.{W}")
                return get_valid_webhook()

# --- Cloudinary Functions ---

def configure_cloudinary():
    """
    Loads environment variables and configures the Cloudinary SDK.
    """
    load_dotenv()
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")
    
    if not all([cloud_name, api_key, api_secret]):
        print(f"{R}[-] Cloudinary credentials not found in .env file.{W}")
        return False
        
    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret
    )
    print(f"{G}[+] Cloudinary configured successfully for cloud: {cloud_name}{W}")
    return True

def upload_image_to_cloudinary(image_path, public_id=None):
    """
    Uploads an image to Cloudinary.

    :param image_path: The local path to the image file.
    :param public_id: Optional. The desired public ID for the image on Cloudinary.
    :return: The upload result dictionary from Cloudinary or None on error.
    """
    if not os.path.exists(image_path):
        print(f"{R}[-] Image file not found at: {image_path}{W}")
        return None
    
    try:
        print(f"{Y}[*] Uploading {image_path} to Cloudinary...{W}")
        upload_result = cloudinary.uploader.upload(
            image_path,
            public_id=public_id,
            unique_filename=False,
            overwrite=True
        )
        print(f"{G}[+] Image uploaded successfully!{W}")
        print(f"{C}    Public URL: {upload_result.get('secure_url')}{W}")
        return upload_result
    except Exception as e:
        print(f"{R}[-] Error uploading image to Cloudinary: {e}{W}")
        return None

def get_transformed_image_url(public_id, width, height, crop="fill"):
    """
    Generates a URL for a transformed image.

    :param public_id: The public ID of the image on Cloudinary.
    :param width: The target width.
    :param height: The target height.
    :param crop: The crop mode (e.g., "fill", "fit", "crop", "scale").
    :return: The URL of the transformed image.
    """
    return cloudinary.utils.cloudinary_url(
        public_id,
        width=width,
        height=height,
        crop=crop,
        secure=True
    )[0]