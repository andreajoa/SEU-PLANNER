"""
Auto-initialization script for database
Creates admin user automatically on first run
This is called by run.py on startup
"""

import os
import sys

def init_database(app):
    """Initialize database and create admin user"""
    from models import db, User
    import bcrypt

    with app.app_context():
        # Create all tables
        db.create_all()

        # Check if admin exists
        admin = User.query.filter_by(email='admin@planner.com').first()
        if not admin:
            print("🔧 Creating admin user...")
            password_hash = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            admin_user = User(
                email='admin@planner.com',
                username='admin',
                password_hash=password_hash,
                name='Administrator',
                level=99,
                xp=9999,
                streak=365,
                tasks_completed=1000,
                planners_created=50
            )

            db.session.add(admin_user)
            db.session.commit()

            print("=" * 60)
            print("✅ ADMIN USER CREATED!")
            print("=" * 60)
            print("📧 Email:    admin@planner.com")
            print("🔑 Password: admin123")
            print("=" * 60)
        else:
            print("✅ Admin user already exists")

        # Get total users count
        user_count = User.query.count()
        print(f"📊 Total users in database: {user_count}")
