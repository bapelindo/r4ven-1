import time
import sys
from port_forward import run_flask
from utils import check_and_get_webhook_url

folder_name = 'all'
check_and_get_webhook_url(folder_name)
print("Starting R4ven ALL server via PM2...")
run_flask(folder_name)
