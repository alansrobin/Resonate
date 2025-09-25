Run the backend locally (without Docker):
1. python3 -m venv .venv
2. source .venv/bin/activate
3. pip install -r requirements.txt
4. uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
