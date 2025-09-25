# backend/app/services/email.py

import os

# Simple dev email sender: logs a message with the reset URL.
# In production, replace this with real SMTP or an email provider.

def send_password_reset_email(to_email: str, reset_url: str):
    # For local/dev: write to stdout so you can see the link in logs
    print(f"[DEV EMAIL] To: {to_email}\nReset your password: {reset_url}")
    
    # Optionally, write to a file so it's easier to copy
    try:
        log_dir = os.path.join(os.getcwd(), "emails")
        os.makedirs(log_dir, exist_ok=True)
        with open(os.path.join(log_dir, "password_reset.log"), "a", encoding="utf-8") as f:
            f.write(f"To: {to_email} | URL: {reset_url}\n")
    except Exception as e:
        # If this fails, just ignore; the stdout print above should still help in dev
        print(f"[DEV EMAIL] Failed to write email log: {e}")
