from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Task, Planner
from datetime import datetime, timedelta
from sqlalchemy import func

user_bp = Blueprint('user', __name__)

@user_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    """Get user statistics"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Get task statistics
        total_tasks = Task.query.filter_by(user_id=user_id).count()
        completed_tasks = Task.query.filter_by(user_id=user_id, status='completed').count()
        pending_tasks = Task.query.filter_by(user_id=user_id, status='pending').count()
        in_progress_tasks = Task.query.filter_by(user_id=user_id, status='in_progress').count()

        # Tasks completed this week
        week_ago = datetime.utcnow() - timedelta(days=7)
        completed_this_week = Task.query.filter(
            Task.user_id == user_id,
            Task.status == 'completed',
            Task.completed_at >= week_ago
        ).count()

        # Task distribution by priority
        priority_dist = db.session.query(
            Task.priority,
            func.count(Task.id)
        ).filter(Task.user_id == user_id).group_by(Task.priority).all()

        # Task distribution by status
        status_dist = db.session.query(
            Task.status,
            func.count(Task.id)
        ).filter(Task.user_id == user_id).group_by(Task.status).all()

        return jsonify({
            'user': user.to_dict(),
            'stats': {
                'total_planners': Planner.query.filter_by(user_id=user_id).count(),
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'pending_tasks': pending_tasks,
                'in_progress_tasks': in_progress_tasks,
                'completed_this_week': completed_this_week,
                'completion_rate': round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 2),
                'priority_distribution': {p: c for p, c in priority_dist},
                'status_distribution': {s: c for s, c in status_dist}
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify(user.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        user.username = data.get('username', user.username)
        user.avatar = data.get('avatar', user.avatar)

        db.session.commit()

        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/leaderboard', methods=['GET'])
@jwt_required()
def get_leaderboard():
    """Get global leaderboard"""
    try:
        # Get top 10 users by XP
        users = User.query.order_by(User.total_xp.desc()).limit(10).all()

        return jsonify({
            'leaderboard': [u.to_dict() for u in users]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
