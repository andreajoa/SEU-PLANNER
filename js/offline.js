// Offline support system for Planner Premium ULTRA
class OfflineSupport {
    constructor() {
        this.isOnline = navigator.onLine;
        this.offlineQueue = [];
        this.init();
    }
    
    init() {
        this.loadOfflineQueue();
        this.bindEvents();
        this.checkOnlineStatus();
    }
    
    bindEvents() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleOnline();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleOffline();
        });
    }
    
    // Check current online status
    checkOnlineStatus() {
        this.isOnline = navigator.onLine;
        
        if (this.isOnline) {
            this.handleOnline();
        } else {
            this.handleOffline();
        }
        
        return this.isOnline;
    }
    
    // Handle going online
    handleOnline() {
        console.log('Application is now online. Processing offline queue...');
        
        // Process offline queue
        this.processOfflineQueue();
        
        // Update UI to reflect online status
        this.updateOnlineStatusIndicator(true);
    }
    
    // Handle going offline
    handleOffline() {
        console.log('Application is now offline. Queuing operations...');
        
        // Update UI to reflect offline status
        this.updateOnlineStatusIndicator(false);
    }
    
    // Update online status indicator in UI
    updateOnlineStatusIndicator(isOnline) {
        // Create or update online status indicator
        let indicator = document.getElementById('online-status-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'online-status-indicator';
            indicator.className = 'fixed top-4 right-4 z-50 px-3 py-2 rounded-full text-xs font-medium shadow-lg';
            document.body.appendChild(indicator);
        }
        
        if (isOnline) {
            indicator.textContent = 'Online';
            indicator.className = 'fixed top-4 right-4 z-50 px-3 py-2 rounded-full text-xs font-medium shadow-lg bg-green-500 text-white';
        } else {
            indicator.textContent = 'Offline';
            indicator.className = 'fixed top-4 right-4 z-50 px-3 py-2 rounded-full text-xs font-medium shadow-lg bg-red-500 text-white';
        }
    }
    
    // Add operation to offline queue
    queueOperation(operation) {
        const operationId = Date.now() + Math.random();
        
        const queueItem = {
            id: operationId,
            operation: operation.type,
            data: operation.data,
            timestamp: new Date().toISOString(),
            retries: 0
        };
        
        this.offlineQueue.push(queueItem);
        this.saveOfflineQueue();
        
        console.log(`Operation queued: ${operation.type}`, queueItem);
        
        // Show offline notification if needed
        this.showOfflineNotification(operation);
        
        return operationId;
    }
    
    // Process offline queue
    async processOfflineQueue() {
        if (this.offlineQueue.length === 0) {
            console.log('Offline queue is empty');
            return;
        }
        
        console.log(`Processing ${this.offlineQueue.length} offline operations...`);
        
        // Process each item in the queue
        for (let i = 0; i < this.offlineQueue.length; i++) {
            const queueItem = this.offlineQueue[i];
            
            try {
                // Attempt to execute the operation
                const success = await this.executeQueuedOperation(queueItem);
                
                if (success) {
                    // Remove successful operation from queue
                    this.offlineQueue.splice(i, 1);
                    i--; // Adjust index after removal
                    console.log(`Operation ${queueItem.id} executed successfully`);
                } else {
                    // Increment retry count
                    queueItem.retries++;
                    
                    if (queueItem.retries >= 3) {
                        // Remove operation after too many retries
                        this.offlineQueue.splice(i, 1);
                        i--;
                        console.log(`Operation ${queueItem.id} removed after too many retries`);
                    }
                }
            } catch (error) {
                console.error(`Error processing operation ${queueItem.id}:`, error);
            }
        }
        
        // Save updated queue
        this.saveOfflineQueue();
    }
    
    // Execute a queued operation
    async executeQueuedOperation(queueItem) {
        try {
            switch (queueItem.operation) {
                case 'create_task':
                    return await this.executeCreateTask(queueItem.data);
                case 'update_task':
                    return await this.executeUpdateTask(queueItem.data);
                case 'delete_task':
                    return await this.executeDeleteTask(queueItem.data);
                case 'update_user':
                    return await this.executeUpdateUser(queueItem.data);
                case 'create_planner':
                    return await this.executeCreatePlanner(queueItem.data);
                default:
                    console.warn(`Unknown operation type: ${queueItem.operation}`);
                    return false;
            }
        } catch (error) {
            console.error(`Error executing operation ${queueItem.operation}:`, error);
            return false;
        }
    }
    
    // Execute create task operation
    async executeCreateTask(taskData) {
        try {
            // In a real app, this would make an API call to Supabase
            // For now, we'll update localStorage
            let tasks = JSON.parse(localStorage.getItem('planner_tasks') || '[]');
            tasks.push(taskData);
            localStorage.setItem('planner_tasks', JSON.stringify(tasks));
            
            return true;
        } catch (error) {
            console.error('Error executing create task:', error);
            return false;
        }
    }
    
    // Execute update task operation
    async executeUpdateTask(taskData) {
        try {
            // In a real app, this would make an API call to Supabase
            // For now, we'll update localStorage
            let tasks = JSON.parse(localStorage.getItem('planner_tasks') || '[]');
            const taskIndex = tasks.findIndex(task => task.id === taskData.id);
            
            if (taskIndex !== -1) {
                tasks[taskIndex] = { ...tasks[taskIndex], ...taskData };
                localStorage.setItem('planner_tasks', JSON.stringify(tasks));
            }
            
            return true;
        } catch (error) {
            console.error('Error executing update task:', error);
            return false;
        }
    }
    
    // Execute delete task operation
    async executeDeleteTask(taskId) {
        try {
            // In a real app, this would make an API call to Supabase
            // For now, we'll update localStorage
            let tasks = JSON.parse(localStorage.getItem('planner_tasks') || '[]');
            tasks = tasks.filter(task => task.id !== taskId);
            localStorage.setItem('planner_tasks', JSON.stringify(tasks));
            
            return true;
        } catch (error) {
            console.error('Error executing delete task:', error);
            return false;
        }
    }
    
    // Execute update user operation
    async executeUpdateUser(userData) {
        try {
            // In a real app, this would make an API call to Supabase
            // For now, we'll update localStorage
            localStorage.setItem('planner_user', JSON.stringify(userData));
            
            return true;
        } catch (error) {
            console.error('Error executing update user:', error);
            return false;
        }
    }
    
    // Execute create planner operation
    async executeCreatePlanner(plannerData) {
        try {
            // In a real app, this would make an API call to Supabase
            // For now, we'll update localStorage
            let planners = JSON.parse(localStorage.getItem('planner_planners') || '[]');
            planners.push(plannerData);
            localStorage.setItem('planner_planners', JSON.stringify(planners));
            
            return true;
        } catch (error) {
            console.error('Error executing create planner:', error);
            return false;
        }
    }
    
    // Save offline queue to localStorage
    saveOfflineQueue() {
        try {
            localStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));
        } catch (error) {
            console.error('Error saving offline queue:', error);
        }
    }
    
    // Load offline queue from localStorage
    loadOfflineQueue() {
        try {
            const queueData = localStorage.getItem('offline_queue');
            if (queueData) {
                this.offlineQueue = JSON.parse(queueData);
            }
        } catch (error) {
            console.error('Error loading offline queue:', error);
            this.offlineQueue = [];
        }
    }
    
    // Show offline notification
    showOfflineNotification(operation) {
        // Only show notification if we're currently offline
        if (!this.isOnline) {
            // Create notification element
            const notification = document.createElement('div');
            notification.id = `offline-notification-${operation.type}`;
            notification.className = 'fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
            notification.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">cloud_off</span>
                    <div>
                        <div class="font-medium">Operação em espera</div>
                        <div class="text-sm">${this.getOperationDescription(operation.type)}</div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // Remove notification after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 5000);
        }
    }
    
    // Get operation description for UI
    getOperationDescription(operationType) {
        const descriptions = {
            'create_task': 'Tarefa será salva quando você estiver online',
            'update_task': 'Atualização será sincronizada quando você estiver online',
            'delete_task': 'Exclusão será sincronizada quando você estiver online',
            'update_user': 'Atualização de perfil será sincronizada quando você estiver online',
            'create_planner': 'Planejador será criado quando você estiver online'
        };
        
        return descriptions[operationType] || 'Operação será sincronizada quando você estiver online';
    }
    
    // Check if there are pending offline operations
    hasPendingOperations() {
        return this.offlineQueue.length > 0;
    }
    
    // Get count of pending operations
    getPendingOperationCount() {
        return this.offlineQueue.length;
    }
    
    // Clear offline queue
    clearOfflineQueue() {
        this.offlineQueue = [];
        this.saveOfflineQueue();
    }
}

// Initialize offline support when available
let offlineSupport = null;

if ('serviceWorker' in navigator) {
    // Initialize after service worker registration
    window.addEventListener('load', () => {
        offlineSupport = new OfflineSupport();
    });
} else {
    // Initialize directly if service workers not supported
    offlineSupport = new OfflineSupport();
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OfflineSupport;
}