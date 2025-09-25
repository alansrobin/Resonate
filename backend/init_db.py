#!/usr/bin/env python3

# Script to initialize database with new schema
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.app.core.db import init_db, Base, engine

def main():
    print("Initializing database with new schema...")
    
    # Drop all existing tables and recreate them
    Base.metadata.drop_all(bind=engine)
    print("Dropped existing tables")
    
    # Initialize database with new schema
    init_db()
    print("Database initialized successfully!")
    print("New tables created: reports, users, urgency_votes")

if __name__ == "__main__":
    main()
