from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Task, Subtask
from datetime import datetime
import json

tasks_bp = Blueprint('tasks', __name__)

def calculate_xp(priority):
    """Calculate XP based on priority"""
    xp_map = {'low': 5, 'medium': 10, 'high': 20, 'urgent': 30}
    return xp_map.get(priority, 10)

@tasks_bp.route('/', methods=['GET'])
@jwt_required()
def get_tasks():
    """Get all tasks for current user"""
    try:
        user_id = get_jwt_identity()
        planner_id = request.args.get('planner_id')
        status = request.args.get('status')
        priority = request.args.get('priority')

        query = Task.query.filter_by(user_id=user_id)
        if planner_id:
            query = query.filter_by(planner_id=planner_id)
        if status:
            query = query.filter_by(status=status)
        if priority:
            query = query.filter_by(priority=priority)

        tasks = query.order_by(Task.created_at.desc()).all()
        return jsonify({
            'tasks': [t.to_dict() for t in tasks]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/', methods=['POST'])
@jwt_required()
def create_task():
    """Create a new task"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        # Parse tags
        tags = data.get('tags', [])
        if isinstance(tags, list):
            tags = ','.join(tags)

        # Calculate XP
        priority = data.get('priority', 'medium')
        xp_reward = calculate_xp(priority)

        # Parse due date
        due_date = None
        if data.get('due_date'):
            due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))

        task = Task(
            user_id=user_id,
            planner_id=data.get('planner_id'),
            title=data.get('title', 'New Task'),
            description=data.get('description'),
            priority=priority,
            due_date=due_date,
            tags=tags,
            estimated_time=data.get('estimated_time'),
            xp_reward=xp_reward
        )
        db.session.add(task)
        db.session.commit()

        return jsonify({
            'message': 'Task created successfully',
            'task': task.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    """Get a specific task with subtasks"""
    try:
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()

        if not task:
            return jsonify({'error': 'Task not found'}), 404

        task_dict = task.to_dict()
        task_dict['subtasks'] = [s.to_dict() for s in task.subtasks.order_by(Subtask.order).all()]

        return jsonify({'task': task_dict}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    """Update a task"""
    try:
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()

        if not task:
            return jsonify({'error': 'Task not found'}), 404

        data = request.get_json()

        # Update fields
        task.title = data.get('title', task.title)
        task.description = data.get('description', task.description)
        task.priority = data.get('priority', task.priority)
        task.status = data.get('status', task.status)
        task.estimated_time = data.get('estimated_time', task.estimated_time)
        task.actual_time = data.get('actual_time', task.actual_time)

        # Parse tags
        if 'tags' in data:
            tags = data['tags']
            if isinstance(tags, list):
                tags = ','.join(tags)
            task.tags = tags

        # Parse due date
        if data.get('due_date'):
            task.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))

        # Handle task completion
        if data.get('status') == 'completed' and task.status != 'completed':
            task.completed_at = datetime.utcnow()
            # Award XP to user
            user = User.query.get(user_id)
            if user:
                user.xp += task.xp_reward
                user.total_xp += task.xp_reward
                user.tasks_completed += 1

                # Level up logic (every 100 XP)
                new_level = (user.total_xp // 100) + 1
                if new_level > user.level:
                    user.level = new_level

        db.session.commit()

        return jsonify({
            'message': 'Task updated successfully',
            'task': task.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    """Delete a task"""
    try:
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()

        if not task:
            return jsonify({'error': 'Task not found'}), 404

        db.session.delete(task)
        db.session.commit()

        return jsonify({'message': 'Task deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/<int:task_id>/toggle', methods=['PATCH'])
@jwt_required()
def toggle_task(task_id):
    """Toggle task completion status"""
    try:
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()

        if not task:
            return jsonify({'error': 'Task not found'}), 404

        data = request.get_json()
        completed = data.get('completed', False)

        if completed:
            task.status = 'completed'
            if not task.completed_at:
                task.completed_at = datetime.utcnow()
                # Award XP to user
                user = User.query.get(user_id)
                if user:
                    user.xp += task.xp_reward
                    user.total_xp += task.xp_reward
                    user.tasks_completed += 1

                    # Level up logic (every 100 XP)
                    new_level = (user.total_xp // 100) + 1
                    if new_level > user.level:
                        user.level = new_level
        else:
            task.status = 'pending'
            task.completed_at = None

        db.session.commit()

        return jsonify({
            'message': 'Task toggled successfully',
            'task': task.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Subtasks routes
@tasks_bp.route('/<int:task_id>/subtasks', methods=['POST'])
@jwt_required()
def create_subtask(task_id):
    """Create a subtask"""
    try:
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()

        if not task:
            return jsonify({'error': 'Task not found'}), 404

        data = request.get_json()
        subtask = Subtask(
            task_id=task_id,
            title=data.get('title'),
            order=data.get('order', 0)
        )
        db.session.add(subtask)
        db.session.commit()

        return jsonify({
            'message': 'Subtask created successfully',
            'subtask': subtask.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/subtasks/<int:subtask_id>', methods=['PUT'])
@jwt_required()
def update_subtask(subtask_id):
    """Update a subtask"""
    try:
        user_id = get_jwt_identity()
        subtask = Subtask.query.join(Task).filter(
            Subtask.id == subtask_id,
            Task.user_id == user_id
        ).first()

        if not subtask:
            return jsonify({'error': 'Subtask not found'}), 404

        data = request.get_json()
        subtask.title = data.get('title', subtask.title)
        subtask.completed = data.get('completed', subtask.completed)
        subtask.order = data.get('order', subtask.order)

        db.session.commit()

        return jsonify({
            'message': 'Subtask updated successfully',
            'subtask': subtask.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/subtasks/<int:subtask_id>', methods=['DELETE'])
@jwt_required()
def delete_subtask(subtask_id):
    """Delete a subtask"""
    try:
        user_id = get_jwt_identity()
        subtask = Subtask.query.join(Task).filter(
            Subtask.id == subtask_id,
            Task.user_id == user_id
        ).first()

        if not subtask:
            return jsonify({'error': 'Subtask not found'}), 404

        db.session.delete(subtask)
        db.session.commit()

        return jsonify({'message': 'Subtask deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/<int:task_id>/subtasks/<int:subtask_id>/toggle', methods=['PATCH'])
@jwt_required()
def toggle_subtask(task_id, subtask_id):
    """Toggle subtask completion status"""
    try:
        user_id = get_jwt_identity()
        subtask = Subtask.query.join(Task).filter(
            Subtask.id == subtask_id,
            Task.id == task_id,
            Task.user_id == user_id
        ).first()

        if not subtask:
            return jsonify({'error': 'Subtask not found'}), 404

        # Toggle completion
        subtask.completed = not subtask.completed
        db.session.commit()

        return jsonify({
            'message': 'Subtask toggled successfully',
            'subtask': subtask.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
