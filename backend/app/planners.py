from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Planner, Task
from datetime import datetime

planners_bp = Blueprint('planners', __name__)

@planners_bp.route('/planners', methods=['GET'])
@jwt_required()
def get_planners():
    """Get all planners for current user"""
    try:
        user_id = get_jwt_identity()
        planner_type = request.args.get('type')  # Filter by type

        query = Planner.query.filter_by(user_id=user_id)
        if planner_type:
            query = query.filter_by(type=planner_type)

        planners = query.order_by(Planner.created_at.desc()).all()
        return jsonify([p.to_dict() for p in planners]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@planners_bp.route('/planners', methods=['POST'])
@jwt_required()
def create_planner():
    """Create a new planner"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        planner = Planner(
            user_id=user_id,
            name=data.get('name', 'New Planner'),
            type=data.get('type', 'todo'),
            color=data.get('color', '#6B46C1'),
            icon=data.get('icon', '📋'),
            description=data.get('description'),
            target_frequency=data.get('target_frequency'),
            target_value=data.get('target_value')
        )
        db.session.add(planner)
        db.session.commit()

        # Update user stats
        user = User.query.get(user_id)
        if user:
            user.planners_created = (user.planners_created or 0) + 1
            db.session.commit()

        return jsonify(planner.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@planners_bp.route('/planners/<int:planner_id>', methods=['GET'])
@jwt_required()
def get_planner(planner_id):
    """Get a specific planner"""
    try:
        user_id = get_jwt_identity()
        planner = Planner.query.filter_by(id=planner_id, user_id=user_id).first()

        if not planner:
            return jsonify({'error': 'Planner not found'}), 404

        return jsonify(planner.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@planners_bp.route('/planners/<int:planner_id>', methods=['PUT'])
@jwt_required()
def update_planner(planner_id):
    """Update a planner"""
    try:
        user_id = get_jwt_identity()
        planner = Planner.query.filter_by(id=planner_id, user_id=user_id).first()

        if not planner:
            return jsonify({'error': 'Planner not found'}), 404

        data = request.get_json()
        planner.name = data.get('name', planner.name)
        planner.color = data.get('color', planner.color)
        planner.icon = data.get('icon', planner.icon)
        planner.description = data.get('description', planner.description)
        planner.is_favorite = data.get('is_favorite', planner.is_favorite)
        planner.target_frequency = data.get('target_frequency', planner.target_frequency)
        planner.target_value = data.get('target_value', planner.target_value)

        db.session.commit()

        return jsonify(planner.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@planners_bp.route('/planners/<int:planner_id>', methods=['DELETE'])
@jwt_required()
def delete_planner(planner_id):
    """Delete a planner"""
    try:
        user_id = get_jwt_identity()
        planner = Planner.query.filter_by(id=planner_id, user_id=user_id).first()

        if not planner:
            return jsonify({'error': 'Planner not found'}), 404

        db.session.delete(planner)
        db.session.commit()

        return jsonify({'message': 'Planner deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
