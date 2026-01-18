from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    """User model"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    username = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    avatar = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Gamification fields
    level = db.Column(db.Integer, default=1)
    xp = db.Column(db.Integer, default=0)
    streak = db.Column(db.Integer, default=0)
    tasks_completed = db.Column(db.Integer, default=0)
    total_xp = db.Column(db.Integer, default=0)
    planners_created = db.Column(db.Integer, default=0)

    # Relationships
    planners = db.relationship('Planner', backref='user', lazy='dynamic', cascade='all,delete-orphan')
    tasks = db.relationship('Task', backref='user', lazy='dynamic', cascade='all,delete-orphan')
    achievements = db.relationship('UserAchievement', backref='user', lazy='dynamic', cascade='all,delete-orphan')

    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'name': self.username,
            'avatar_url': self.avatar,
            'level': self.level,
            'xp': self.xp,
            'streak': self.streak,
            'tasks_completed': self.tasks_completed,
            'planners_created': self.planners_created or 0,
            'achievements': [],
            'subscription': 'free',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.created_at.isoformat() if self.created_at else None,
            'last_activity': datetime.utcnow().isoformat()
        }

class Planner(db.Model):
    """Planner model (daily, weekly, monthly, projects, habits, goals)"""
    __tablename__ = 'planners'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # daily, weekly, monthly, project, habit, goal
    color = db.Column(db.String(20), default='#6B46C1')
    icon = db.Column(db.String(50), default='📋')
    description = db.Column(db.Text)
    is_favorite = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # For habits/goals
    target_frequency = db.Column(db.Integer)  # e.g., 7 times per week
    target_value = db.Column(db.Integer)  # e.g., 30 minutes

    # Relationships
    tasks = db.relationship('Task', backref='planner', lazy='dynamic', cascade='all,delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'type': self.type,
            'color': self.color,
            'icon': self.icon,
            'description': self.description,
            'is_favorite': self.is_favorite,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'target_frequency': self.target_frequency,
            'target_value': self.target_value
        }

class Task(db.Model):
    """Task model"""
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    planner_id = db.Column(db.Integer, db.ForeignKey('planners.id'), nullable=True)
    title = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed, cancelled
    priority = db.Column(db.String(10), default='medium')  # low, medium, high, urgent
    due_date = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Task metadata
    estimated_time = db.Column(db.Integer)  # in minutes
    actual_time = db.Column(db.Integer)  # in minutes
    xp_reward = db.Column(db.Integer, default=10)

    # Tags (stored as JSON string)
    tags = db.Column(db.String(500))

    # Relationships
    subtasks = db.relationship('Subtask', backref='task', lazy='dynamic', cascade='all,delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'planner_id': self.planner_id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'estimated_time': self.estimated_time,
            'actual_time': self.actual_time,
            'xp_reward': self.xp_reward,
            'tags': self.tags.split(',') if self.tags else []
        }

class Subtask(db.Model):
    """Subtask model"""
    __tablename__ = 'subtasks'

    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    title = db.Column(db.String(500), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'title': self.title,
            'completed': self.completed,
            'order': self.order,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Achievement(db.Model):
    """Achievement model"""
    __tablename__ = 'achievements'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(50))
    color = db.Column(db.String(20), default='#FFD700')
    xp_reward = db.Column(db.Integer, default=50)
    requirement_type = db.Column(db.String(50))  # tasks_completed, streak, level, etc.
    requirement_value = db.Column(db.Integer)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'color': self.color,
            'xp_reward': self.xp_reward,
            'requirement_type': self.requirement_type,
            'requirement_value': self.requirement_value
        }

class UserAchievement(db.Model):
    """User Achievement junction"""
    __tablename__ = 'user_achievements'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievements.id'), nullable=False)
    unlocked_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    achievement = db.relationship('Achievement', backref='user_achievements')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'achievement': self.achievement.to_dict() if self.achievement else None,
            'unlocked_at': self.unlocked_at.isoformat() if self.unlocked_at else None
        }
