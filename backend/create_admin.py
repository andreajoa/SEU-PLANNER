"""
Create Admin User Script
Run this to create an admin user for the planner application
"""

import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db, User
import bcrypt

def create_admin_user():
    """Create admin user if it doesn't exist"""
    app = create_app('production')

    with app.app_context():
        # Check if admin already exists
        existing_admin = User.query.filter_by(email='admin@planner.com').first()
        if existing_admin:
            print("✅ Admin user already exists!")
            print("   Email: admin@planner.com")
            print("   Password: admin123")
            return

        # Create admin user
        password_hash = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        admin_user = User(
            email='admin@planner.com',
            username='admin',
            password_hash=password_hash,
            level=99,
            xp=9999,
            total_xp=9999,
            streak=365,
            tasks_completed=1000
        )

        db.session.add(admin_user)
        db.session.commit()

        print("=" * 60)
        print("✅ ADMIN USER CREATED SUCCESSFULLY!")
        print("=" * 60)
        print()
        print("📧 Email:    admin@planner.com")
        print("🔑 Password: admin123")
        print()
        print("🌐 Use these credentials to login at:")
        print("   https://seu-planner.onrender.com")
        print()
        print("⚠️  IMPORTANT: Change the password after first login!")
        print("=" * 60)

if __name__ == '__main__':
    create_admin_user()
