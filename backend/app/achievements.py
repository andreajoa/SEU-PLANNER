from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Achievement, UserAchievement

achievements_bp = Blueprint('achievements', __name__)

# Initialize default achievements
DEFAULT_ACHIEVEMENTS = [
    {'name': 'First Step', 'description': 'Complete your first task', 'icon': '🎯', 'color': '#FFD700', 'xp_reward': 50, 'requirement_type': 'tasks_completed', 'requirement_value': 1},
    {'name': 'Getting Started', 'description': 'Complete 10 tasks', 'icon': '🌟', 'color': '#C0C0C0', 'xp_reward': 100, 'requirement_type': 'tasks_completed', 'requirement_value': 10},
    {'name': 'Productivity Master', 'description': 'Complete 50 tasks', 'icon': '🏆', 'color': '#CD7F32', 'xp_reward': 500, 'requirement_type': 'tasks_completed', 'requirement_value': 50},
    {'name': 'Task Champion', 'description': 'Complete 100 tasks', 'icon': '👑', 'color': '#FFD700', 'xp_reward': 1000, 'requirement_type': 'tasks_completed', 'requirement_value': 100},
    {'name': 'On Fire!', 'description': 'Reach a 7-day streak', 'icon': '🔥', 'color': '#FF4500', 'xp_reward': 200, 'requirement_type': 'streak', 'requirement_value': 7},
    {'name': 'Unstoppable', 'description': 'Reach a 30-day streak', 'icon': '⚡', 'color': '#FF6B6B', 'xp_reward': 1000, 'requirement_type': 'streak', 'requirement_value': 30},
    {'name': 'Level Up!', 'description': 'Reach level 5', 'icon': '📈', 'color': '#4ECDC4', 'xp_reward': 300, 'requirement_type': 'level', 'requirement_value': 5},
    {'name': 'Rising Star', 'description': 'Reach level 10', 'icon': '🌟', 'color': '#9B59B6', 'xp_reward': 1000, 'requirement_type': 'level', 'requirement_value': 10},
    {'name': 'Planner Creator', 'description': 'Create your first planner', 'icon': '📋', 'color': '#3498DB', 'xp_reward': 50, 'requirement_type': 'planners_created', 'requirement_value': 1},
    {'name': 'Organization Guru', 'description': 'Create 5 planners', 'icon': '🗂️', 'color': '#1ABC9C', 'xp_reward': 200, 'requirement_type': 'planners_created', 'requirement_value': 5},
]

def init_achievements():
    """Initialize default achievements"""
    if Achievement.query.count() == 0:
        for ach in DEFAULT_ACHIEVEMENTS:
            achievement = Achievement(**ach)
            db.session.add(achievement)
        db.session.commit()
        print("✅ Default achievements initialized")

@achievements_bp.route('/init', methods=['POST'])
def initialize_achievements():
    """Initialize achievements (admin endpoint)"""
    try:
        init_achievements()
        return jsonify({'message': 'Achievements initialized successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@achievements_bp.route('/', methods=['GET'])
@jwt_required()
def get_achievements():
    """Get all achievements"""
    try:
        user_id = get_jwt_identity()

        # Get all achievements
        achievements = Achievement.query.all()

        # Get user's unlocked achievements
        user_achievements = UserAchievement.query.filter_by(user_id=user_id).all()
        unlocked_ids = {ua.achievement_id for ua in user_achievements}

        # Mark which achievements are unlocked
        achievements_data = []
        for ach in achievements:
            ach_dict = ach.to_dict()
            ach_dict['unlocked'] = ach.id in unlocked_ids
            achievements_data.append(ach_dict)

        return jsonify({
            'achievements': achievements_data
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@achievements_bp.route('/check', methods=['POST'])
@jwt_required()
def check_achievements():
    """Check and unlock new achievements"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Get all achievements
        achievements = Achievement.query.all()

        # Get user's unlocked achievements
        user_achievements = UserAchievement.query.filter_by(user_id=user_id).all()
        unlocked_ids = {ua.achievement_id for ua in user_achievements}

        newly_unlocked = []

        for achievement in achievements:
            # Skip if already unlocked
            if achievement.id in unlocked_ids:
                continue

            # Check if requirements are met
            unlocked = False
            if achievement.requirement_type == 'tasks_completed':
                unlocked = user.tasks_completed >= achievement.requirement_value
            elif achievement.requirement_type == 'streak':
                unlocked = user.streak >= achievement.requirement_value
            elif achievement.requirement_type == 'level':
                unlocked = user.level >= achievement.requirement_value
            elif achievement.requirement_type == 'planners_created':
                unlocked = (user.planners_created or 0) >= achievement.requirement_value

            # Unlock achievement
            if unlocked:
                user_achievement = UserAchievement(
                    user_id=user_id,
                    achievement_id=achievement.id
                )
                db.session.add(user_achievement)

                # Award XP
                user.xp += achievement.xp_reward
                user.total_xp += achievement.xp_reward

                newly_unlocked.append(achievement.to_dict())

        # Level up logic
        new_level = (user.total_xp // 100) + 1
        if new_level > user.level:
            user.level = new_level

        db.session.commit()

        return jsonify({
            'message': f'Unlocked {len(newly_unlocked)} new achievements!',
            'newly_unlocked': newly_unlocked,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@achievements_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_achievements():
    """Get user's unlocked achievements"""
    try:
        user_id = get_jwt_identity()

        user_achievements = UserAchievement.query.filter_by(user_id=user_id).order_by(
            UserAchievement.unlocked_at.desc()
        ).all()

        return jsonify({
            'achievements': [ua.to_dict() for ua in user_achievements]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@achievements_bp.route('/<int:achievement_id>/unlock', methods=['POST'])
@jwt_required()
def unlock_achievement(achievement_id):
    """Unlock a specific achievement"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        achievement = Achievement.query.get(achievement_id)
        if not achievement:
            return jsonify({'error': 'Achievement not found'}), 404

        # Check if already unlocked
        existing = UserAchievement.query.filter_by(
            user_id=user_id,
            achievement_id=achievement_id
        ).first()

        if existing:
            return jsonify({'message': 'Achievement already unlocked'}), 200

        # Unlock achievement
        user_achievement = UserAchievement(
            user_id=user_id,
            achievement_id=achievement_id
        )
        db.session.add(user_achievement)

        # Award XP
        user.xp += achievement.xp_reward
        user.total_xp += achievement.xp_reward

        # Level up logic
        new_level = (user.total_xp // 100) + 1
        if new_level > user.level:
            user.level = new_level

        db.session.commit()

        return jsonify({
            'message': 'Achievement unlocked!',
            'achievement': achievement.to_dict(),
            'user': user.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@achievements_bp.route('/leaderboard', methods=['GET'])
@jwt_required()
def get_leaderboard():
    """Get leaderboard"""
    try:
        users = User.query.order_by(User.total_xp.desc()).limit(10).all()

        return jsonify({
            'leaderboard': [u.to_dict() for u in users]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
