from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import config
from models import db

def create_app(config_name='development'):
    """Application factory"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    JWTManager(app)
    
    # CRITICAL: Configure CORS to allow frontend domain
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "https://seu-planner-frontend.onrender.com",
                "http://localhost:5173",
                "http://localhost:4173"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # Register blueprints
    from app.auth import auth_bp
    from app.planners import planners_bp
    from app.tasks import tasks_bp
    from app.user import user_bp
    from app.achievements import achievements_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(planners_bp, url_prefix='/api/planners')
    app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
    app.register_blueprint(user_bp, url_prefix='/api/user')
    app.register_blueprint(achievements_bp, url_prefix='/api/achievements')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500
    
    # Root route - API info
    @app.route('/')
    def index():
        return jsonify({
            'name': 'Planner Premium ULTRA API',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': {
                'health': '/api/health',
                'auth': '/api/auth/*',
                'planners': '/api/planners/*',
                'tasks': '/api/tasks/*',
                'user': '/api/user/*',
                'achievements': '/api/achievements/*'
            },
            'frontend': 'https://seu-planner-frontend.onrender.com',
            'docs': 'https://github.com/andreajoa/SEU-PLANNER'
        })
    
    # Health check
    @app.route('/api/health')
    def health():
        return jsonify({'status': 'healthy', 'version': '1.0.0'})
    
    # Initialize database
    with app.app_context():
        db.create_all()
    
    return app
