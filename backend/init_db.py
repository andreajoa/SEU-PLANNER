"""
Auto-initialization script for database
Creates admin user automatically on first run
This is called by run.py on startup
"""

import os
import sys

def migrate_database(app):
    """Add missing columns to existing database"""
    from models import db
    from sqlalchemy import inspect, text

    with app.app_context():
        inspector = inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('users')]

        # Add planners_created column if it doesn't exist
        if 'planners_created' not in columns:
            print("🔧 Adding planners_created column to users table...")
            try:
                db.session.execute(text("ALTER TABLE users ADD COLUMN planners_created INTEGER DEFAULT 0"))
                db.session.commit()
                print("✅ Added planners_created column")
            except Exception as e:
                print(f"❌ Error adding planners_created column: {e}")
                db.session.rollback()

def init_database(app):
    """Initialize database and create admin user"""
    from models import db, User
    import bcrypt

    with app.app_context():
        # First, run any needed migrations
        try:
            migrate_database(app)
        except Exception as e:
            print(f"⚠️ Migration warning: {e}")

        # Create all tables (this won't change existing tables)
        db.create_all()

        # Check if admin exists
        try:
            admin = User.query.filter_by(email='admin@planner.com').first()
        except Exception as e:
            # If query fails, try to recreate admin
            print(f"⚠️ Query failed: {e}")
            admin = None

        if not admin:
            print("🔧 Creating admin user...")
            password_hash = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            admin_user = User(
                email='admin@planner.com',
                username='admin',
                password_hash=password_hash,
                level=99,
                xp=9999,
                total_xp=9999,
                streak=365,
                tasks_completed=1000,
                planners_created=5
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
        try:
            user_count = User.query.count()
            print(f"📊 Total users in database: {user_count}")
        except Exception as e:
            print(f"⚠️ Could not get user count: {e}")
