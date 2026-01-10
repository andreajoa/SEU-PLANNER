import os
from app import create_app
from init_db import init_database

# Create Flask app
config_name = os.getenv('FLASK_ENV', 'development')
app = create_app(config_name)

# Initialize database and create admin user
print("🔧 Initializing database...")
init_database(app)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=config_name == 'development')
