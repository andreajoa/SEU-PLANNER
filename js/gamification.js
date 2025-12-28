// Gamification system for Planner Premium ULTRA
class GamificationSystem {
    constructor() {
        this.user = this.getCurrentUser();
        this.achievementsList = [
            { id: 'first_task', name: 'Primeira Tarefa', description: 'Complete sua primeira tarefa', icon: '🎯', requirement: { type: 'tasks_completed', value: 1 } },
            { id: 'task_master', name: 'Mestre das Tarefas', description: 'Complete 10 tarefas', icon: '👑', requirement: { type: 'tasks_completed', value: 10 } },
            { id: 'centenarian', name: 'Centenário', description: 'Complete 100 tarefas', icon: '💯', requirement: { type: 'tasks_completed', value: 100 } },
            { id: 'week_streak', name: 'Streak 7 Dias', description: 'Faça login por 7 dias seguidos', icon: '🔥', requirement: { type: 'streak', value: 7 } },
            { id: 'month_streak', name: 'Streak 30 Dias', description: 'Faça login por 30 dias seguidos', icon: '💪', requirement: { type: 'streak', value: 30 } },
            { id: 'level_10', name: 'Nível 10', description: 'Alcance o nível 10', icon: '⭐', requirement: { type: 'level', value: 10 } },
            { id: 'planner_pro', name: 'Planejador Pro', description: 'Crie 5 planejadores', icon: '📋', requirement: { type: 'planners_created', value: 5 } }
        ];
        
        this.init();
    }
    
    init() {
        if (this.user) {
            this.updateUserStats();
        }
    }
    
    getCurrentUser() {
        const user = localStorage.getItem('planner_user');
        return user ? JSON.parse(user) : null;
    }
    
    // Calculate level based on XP
    calculateLevel(xp) {
        // XP required for each level: Level 1 = 100 XP, Level 2 = 200 XP, etc.
        // Total XP needed for level N = 100 * N * (N + 1) / 2
        // For now, using a simpler formula: each level requires 100 XP
        return Math.floor(xp / 100) + 1;
    }
    
    // Calculate XP needed for next level
    xpForNextLevel(currentLevel) {
        return currentLevel * 100;
    }
    
    // Calculate current XP progress to next level
    xpToNextLevel(currentXp, currentLevel) {
        const xpForCurrentLevel = (currentLevel - 1) * 100;
        const xpForNextLevel = currentLevel * 100;
        return xpForNextLevel - currentXp;
    }
    
    // Calculate XP progress percentage for current level
    xpProgressPercentage(currentXp) {
        const currentLevel = this.calculateLevel(currentXp);
        const xpForCurrentLevel = (currentLevel - 1) * 100;
        const xpInCurrentLevel = currentXp - xpForCurrentLevel;
        return Math.min(100, Math.round((xpInCurrentLevel / 100) * 100));
    }
    
    // Award XP for completing a task
    awardTaskCompletionXp() {
        const xp = 10; // +10 XP per task completed
        this.addXp(xp);
        return xp;
    }
    
    // Award XP for creating a planner
    awardPlannerCreationXp() {
        const xp = 50; // +50 XP per planner created
        this.addXp(xp);
        return xp;
    }
    
    // Add XP to user
    addXp(xpAmount) {
        if (!this.user) return;
        
        const newXp = this.user.xp + xpAmount;
        const oldLevel = this.user.level;
        const newLevel = this.calculateLevel(newXp);
        
        this.user.xp = newXp;
        this.user.level = newLevel;
        
        // Check if user leveled up
        if (newLevel > oldLevel) {
            this.levelUp(newLevel);
        }
        
        // Update user in localStorage
        localStorage.setItem('planner_user', JSON.stringify(this.user));
        
        // Update UI if on a page that shows stats
        this.updateUserStats();
        
        return { xpAdded: xpAmount, levelUp: newLevel > oldLevel, newLevel };
    }
    
    // Handle level up
    levelUp(newLevel) {
        console.log(`🎉 Level Up! You reached level ${newLevel}!`);
        
        // In a real app, we would show a level up animation here
        this.showLevelUpAnimation(newLevel);
    }
    
    // Show level up animation
    showLevelUpAnimation(level) {
        // Create a level up notification
        const notification = document.createElement('div');
        notification.className = 'level-up-notification fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-purple-500 text-white text-2xl font-bold py-6 px-8 rounded-xl shadow-2xl z-50 animate-bounce';
        notification.innerHTML = `
            <div class="flex flex-col items-center">
                <div class="text-4xl mb-2">🎉</div>
                <div>Level Up!</div>
                <div class="text-3xl">Nível ${level}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after animation
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Update streak
    updateStreak() {
        if (!this.user) return;
        
        const today = new Date().toDateString();
        const lastActivity = this.user.last_activity ? new Date(this.user.last_activity).toDateString() : null;
        
        // If it's the first time or consecutive day
        if (!lastActivity || new Date(lastActivity).getTime() === new Date().getTime() - 86400000) {
            // Same day - no change to streak
            if (lastActivity === today) {
                return this.user.streak;
            }
            // Consecutive day - increment streak
            else {
                this.user.streak += 1;
            }
        } 
        // Not consecutive - reset streak
        else if (lastActivity && lastActivity !== today) {
            this.user.streak = 1;
        }
        
        // Update last activity
        this.user.last_activity = new Date().toISOString().split('T')[0];
        
        // Update user in localStorage
        localStorage.setItem('planner_user', JSON.stringify(this.user));
        
        // Update UI if on a page that shows stats
        this.updateUserStats();
        
        return this.user.streak;
    }
    
    // Check and award achievements
    checkAchievements() {
        if (!this.user) return [];
        
        const unlockedAchievements = [];
        
        for (const achievement of this.achievementsList) {
            // Skip if already unlocked
            if (this.user.achievements && this.user.achievements.includes(achievement.id)) {
                continue;
            }
            
            let unlocked = false;
            
            switch (achievement.requirement.type) {
                case 'tasks_completed':
                    // In a real app, we would query the database for completed tasks
                    // For now, we'll use a simplified check
                    if (this.user.tasks_completed >= achievement.requirement.value) {
                        unlocked = true;
                    }
                    break;
                case 'streak':
                    if (this.user.streak >= achievement.requirement.value) {
                        unlocked = true;
                    }
                    break;
                case 'level':
                    if (this.user.level >= achievement.requirement.value) {
                        unlocked = true;
                    }
                    break;
                case 'planners_created':
                    // In a real app, we would query the database for planners created
                    // For now, we'll use a simplified check
                    if (this.user.planners_created >= achievement.requirement.value) {
                        unlocked = true;
                    }
                    break;
            }
            
            if (unlocked) {
                this.unlockAchievement(achievement.id);
                unlockedAchievements.push(achievement);
            }
        }
        
        return unlockedAchievements;
    }
    
    // Unlock an achievement
    unlockAchievement(achievementId) {
        if (!this.user) return false;
        
        if (!this.user.achievements) {
            this.user.achievements = [];
        }
        
        if (!this.user.achievements.includes(achievementId)) {
            this.user.achievements.push(achievementId);
            localStorage.setItem('planner_user', JSON.stringify(this.user));
            
            // Show achievement notification
            this.showAchievementNotification(achievementId);
            
            return true;
        }
        
        return false;
    }
    
    // Show achievement notification
    showAchievementNotification(achievementId) {
        const achievement = this.achievementsList.find(a => a.id === achievementId);
        if (!achievement) return;
        
        // Create achievement notification
        const notification = document.createElement('div');
        notification.className = 'achievement-notification fixed bottom-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg z-50 animate-fade-in-up';
        notification.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-xl">${achievement.icon}</span>
                <div>
                    <div>Conquista Desbloqueada!</div>
                    <div class="text-sm font-normal">${achievement.name}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Update user stats in UI
    updateUserStats() {
        // Update level display if element exists
        const levelDisplay = document.getElementById('level-display');
        if (levelDisplay && this.user) {
            levelDisplay.textContent = `Lvl ${this.user.level}`;
        }
        
        // Update streak display if element exists
        const streakDisplay = document.getElementById('streak-display');
        if (streakDisplay && this.user) {
            streakDisplay.textContent = `${this.user.streak} dias`;
        }
    }
    
    // Get user stats for display
    getUserStats() {
        if (!this.user) return null;
        
        return {
            level: this.user.level,
            xp: this.user.xp,
            xpToNextLevel: this.xpToNextLevel(this.user.xp, this.user.level),
            xpProgress: this.xpProgressPercentage(this.user.xp),
            streak: this.user.streak,
            achievements: this.user.achievements || [],
            unlockedAchievements: this.achievementsList.filter(a => 
                (this.user.achievements || []).includes(a.id)
            ),
            lockedAchievements: this.achievementsList.filter(a => 
                !(this.user.achievements || []).includes(a.id)
            )
        };
    }
    
    // Get achievement by ID
    getAchievement(achievementId) {
        return this.achievementsList.find(a => a.id === achievementId);
    }
    
    // Get all achievements
    getAllAchievements() {
        if (!this.user) return this.achievementsList.map(achievement => ({
            ...achievement,
            unlocked: false
        }));
        
        return this.achievementsList.map(achievement => ({
            ...achievement,
            unlocked: (this.user.achievements || []).includes(achievement.id)
        }));
    }
}

// Initialize gamification system
const gamification = new GamificationSystem();

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GamificationSystem;
}