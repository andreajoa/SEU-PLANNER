// ==========================================
// PLANNER ULTRA - COMPLETE FUNCTIONS
// ==========================================

// Initialize Supabase client (demo mode)
if (typeof window.supabase === 'undefined') {
    window.supabase = {
        auth: {
            signUp: async (credentials) => {
                return { data: { user: { id: 'demo-' + Date.now(), email: credentials.email } }, error: null };
            },
            signInWithPassword: async (credentials) => {
                return { data: { user: { id: 'demo-user', email: credentials.email }, session: {} }, error: null };
            },
            signOut: async () => {
                localStorage.removeItem('planner_user');
                localStorage.removeItem('planner_demo_user');
                return { error: null };
            },
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
        },
        from: () => ({
            insert: () => Promise.resolve({ data: null, error: null }),
            update: () => Promise.resolve({ data: null, error: null }),
            select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
            delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) })
        })
    };
}

// ==========================================
// AUTHENTICATION
// ==========================================

async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name')?.value || '';
    const isSignup = document.querySelector('.auth-tab.active')?.dataset.tab === 'signup';

    try {
        let result;
        if (isSignup) {
            result = await supabase.auth.signUp({ email, password, options: { data: { name } } });
        } else {
            result = await supabase.auth.signInWithPassword({ email, password });
        }

        if (result.error) throw result.error;

        // Create user object
        const userInfo = {
            id: result.data.user?.id || 'demo-' + Date.now(),
            email: email,
            name: name || email.split('@')[0],
            level: 1,
            xp: 0,
            streak: 0,
            tasks_completed: 0,
            planners_created: 0,
            achievements: [],
            created_at: new Date().toISOString()
        };

        localStorage.setItem('planner_user', JSON.stringify(userInfo));
        localStorage.setItem('planner_demo_user', 'true');
        
        currentUser = userInfo;
        await initializeApp();
        updateUI();
    } catch (error) {
        alert('Erro: ' + (error.message || 'Falha na autenticação'));
        console.error('Auth error:', error);
    }
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        supabase.auth.signOut();
        localStorage.removeItem('planner_user');
        localStorage.removeItem('planner_demo_user');
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
    }
}

// ==========================================
// TAB NAVIGATION
// ==========================================

function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        const btnTab = btn.dataset.tab || (btn.onclick?.toString().match(/switchTab\(['"](.*?)['"]\)/)?.[1]);
        if (btnTab === tabName) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetTab = document.getElementById('tab-' + tabName);
    if (targetTab) {
        targetTab.classList.add('active');
        console.log('Tab activated:', tabName);
        
        // Load data for specific tabs
        if (tabName === 'stats') {
            setTimeout(() => loadStats(), 100);
        }
        if (tabName === 'achievements') {
            setTimeout(() => loadAchievements(), 100);
        }
        if (tabName === 'calendar') {
            setTimeout(() => renderCalendar(), 100);
        }
    } else {
        console.error('Tab not found:', 'tab-' + tabName);
    }
}

// ==========================================
// PLANNERS
// ==========================================

async function createPlanner(type) {
    console.log('Creating planner:', type);
    
    if (!currentUser) {
        alert('Por favor, faça login primeiro!');
        return;
    }
    
    const plannerNames = {
        todo: 'To-Do List',
        projeto: 'Projeto',
        habitos: 'Hábitos',
        financeiro: 'Financeiro'
    };

    const planner = {
        id: 'p-' + Date.now(),
        user_id: currentUser?.id || 'demo',
        name: plannerNames[type] || 'Novo Planner',
        type: type,
        created_at: new Date().toISOString()
    };

    planners.push(planner);
    savePlanners();
    
    // Award XP
    if (typeof gamification !== 'undefined' && gamification.addXp) {
        gamification.addXp(50);
    } else if (currentUser) {
        currentUser.xp = (currentUser.xp || 0) + 50;
        currentUser.planners_created = (currentUser.planners_created || 0) + 1;
        localStorage.setItem('planner_user', JSON.stringify(currentUser));
    }

    renderPlanners();
    
    // Close any open modals first
    document.querySelectorAll('.modal-overlay.active').forEach(modal => {
        modal.classList.remove('active');
    });
    
    // Open the new planner
    setTimeout(() => {
        openPlanner(planner.id);
    }, 100);
}

function openPlanner(plannerId) {
    currentPlanner = planners.find(p => p.id === plannerId);
    if (!currentPlanner) return;

    loadTasks();
    document.getElementById('planner-modal-title').textContent = currentPlanner.name;
    document.getElementById('planner-modal').classList.add('active');
    renderTasks();
}

function deletePlanner(plannerId) {
    if (!confirm('Tem certeza que deseja excluir este planner?')) return;
    
    planners = planners.filter(p => p.id !== plannerId);
    if (currentPlanner?.id === plannerId) {
        tasks = tasks.filter(t => t.planner_id !== plannerId);
        closePlannerModal();
    }
    
    savePlanners();
    renderPlanners();
}

function closePlannerModal() {
    document.getElementById('planner-modal').classList.remove('active');
    currentPlanner = null;
}

function renderPlanners() {
    const container = document.getElementById('planners-list');
    if (!container) return;

    if (planners.length === 0) {
        container.innerHTML = `
            <div class="empty-state" id="empty-planners">
                <div class="icon">📋</div>
                <h3>Nenhum planner ainda</h3>
                <p>Crie seu primeiro planner acima!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = planners.map(planner => {
        const typeClass = planner.type || 'todo';
        const icons = {
            todo: '✅',
            projeto: '🏗️',
            habitos: '🔥',
            financeiro: '💰'
        };
        
        return `
            <div class="planner-item" onclick="openPlanner('${planner.id}')">
                <div class="planner-item-info">
                    <div class="planner-item-icon ${typeClass}">${icons[typeClass] || '📋'}</div>
                    <div class="planner-item-details">
                        <h4>${planner.name}</h4>
                        <span>${planner.type || 'todo'}</span>
                    </div>
                </div>
                <div class="planner-item-actions">
                    <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deletePlanner('${planner.id}')">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function savePlanners() {
    localStorage.setItem('planner_planners', JSON.stringify(planners));
}

function loadPlanners() {
    const saved = localStorage.getItem('planner_planners');
    if (saved) {
        planners = JSON.parse(saved);
    }
    renderPlanners();
}

// ==========================================
// TASKS
// ==========================================

function openTaskModal(taskId = null) {
    editingTaskId = taskId;
    currentTags = [];
    currentSubtasks = [];

    if (taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            document.getElementById('task-title').value = task.title || '';
            document.getElementById('task-desc').value = task.description || '';
            document.getElementById('task-category').value = task.category || 'trabalho';
            document.getElementById('task-priority').value = task.priority || 'media';
            document.getElementById('task-date').value = task.date || '';
            document.getElementById('task-time').value = task.time || '';
            document.getElementById('task-duration').value = task.duration || '';
            document.getElementById('task-repeat').value = task.repeat || 'none';
            document.getElementById('task-context').value = task.context || 'anywhere';
            document.getElementById('task-energy').value = task.energy || 'medium';
            document.getElementById('task-reminder').value = task.reminder || 'none';
            document.getElementById('task-link').value = task.link || '';
            currentTags = task.tags || [];
            currentSubtasks = task.subtasks || [];
            document.getElementById('task-modal-title').textContent = '✏️ Editar Tarefa';
        }
    } else {
        document.getElementById('task-form').reset();
        document.getElementById('task-modal-title').textContent = '➕ Nova Tarefa';
    }

    renderTags();
    renderSubtasks();
    document.getElementById('task-modal').classList.add('active');
}

function closeTaskModal() {
    document.getElementById('task-modal').classList.remove('active');
    editingTaskId = null;
    currentTags = [];
    currentSubtasks = [];
}

function saveTask() {
    const taskData = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-desc').value,
        category: document.getElementById('task-category').value,
        priority: document.getElementById('task-priority').value,
        date: document.getElementById('task-date').value,
        time: document.getElementById('task-time').value,
        duration: parseInt(document.getElementById('task-duration').value) || 0,
        repeat: document.getElementById('task-repeat').value,
        context: document.getElementById('task-context').value,
        energy: document.getElementById('task-energy').value,
        reminder: document.getElementById('task-reminder').value,
        link: document.getElementById('task-link').value,
        tags: currentTags,
        subtasks: currentSubtasks,
        done: false,
        planner_id: currentPlanner?.id
    };

    if (!taskData.title) {
        alert('Por favor, preencha o título da tarefa');
        return;
    }

    if (editingTaskId) {
        const index = tasks.findIndex(t => t.id === editingTaskId);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...taskData };
        }
    } else {
        taskData.id = 'task-' + Date.now();
        taskData.created_at = new Date().toISOString();
        tasks.push(taskData);
    }

    saveTasks();
    renderTasks();
    closeTaskModal();
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.done = !task.done;
    task.completed_at = task.done ? new Date().toISOString() : null;

    if (task.done) {
        // Award XP
        if (typeof gamification !== 'undefined' && gamification.addXp) {
            gamification.addXp(10);
        } else if (currentUser) {
            currentUser.xp = (currentUser.xp || 0) + 10;
            currentUser.tasks_completed = (currentUser.tasks_completed || 0) + 1;
            localStorage.setItem('planner_user', JSON.stringify(currentUser));
        }
        updateStats();
    }

    saveTasks();
    renderTasks();
}

function deleteTask(taskId) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
}

function filterTasks() {
    renderTasks();
}

function renderTasks() {
    if (!currentPlanner) return;

    const search = document.getElementById('task-search')?.value.toLowerCase() || '';
    const priorityFilter = document.getElementById('filter-priority')?.value || '';
    const categoryFilter = document.getElementById('filter-category')?.value || '';

    let filteredTasks = tasks.filter(t => t.planner_id === currentPlanner.id);

    if (search) {
        filteredTasks = filteredTasks.filter(t => 
            t.title?.toLowerCase().includes(search) ||
            t.description?.toLowerCase().includes(search)
        );
    }

    if (priorityFilter) {
        filteredTasks = filteredTasks.filter(t => t.priority === priorityFilter);
    }

    if (categoryFilter) {
        filteredTasks = filteredTasks.filter(t => t.category === categoryFilter);
    }

    // Render based on current view
    if (currentView === 'kanban') {
        renderKanbanView(filteredTasks);
    } else if (currentView === 'timeline') {
        renderTimelineView(filteredTasks);
    } else {
        renderListView(filteredTasks);
    }
}

function renderListView(tasksToRender) {
    const container = document.getElementById('task-list');
    if (!container) return;

    if (tasksToRender.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="icon">📝</div><h3>Nenhuma tarefa</h3><p>Crie sua primeira tarefa!</p></div>';
        return;
    }

    container.innerHTML = tasksToRender.map(task => {
        const priorityClass = `priority-${task.priority || 'media'}`;
        return `
            <div class="task-item ${task.done ? 'done' : ''}">
                <div class="task-checkbox ${task.done ? 'checked' : ''}" onclick="toggleTask('${task.id}')">
                    ${task.done ? '✓' : ''}
                </div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    ${task.description ? `<div class="task-meta">${task.description}</div>` : ''}
                    <div class="task-meta">
                        ${task.category ? `<span>${getCategoryIcon(task.category)} ${task.category}</span>` : ''}
                        <span class="priority-badge ${priorityClass}">${task.priority || 'media'}</span>
                        ${task.date ? `<span>📅 ${formatDate(task.date)}</span>` : ''}
                        ${task.time ? `<span>🕐 ${task.time}</span>` : ''}
                    </div>
                    ${task.tags?.length > 0 ? `
                        <div class="task-tags">
                            ${task.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="task-actions">
                    <button class="btn btn-sm btn-secondary" onclick="openTaskModal('${task.id}')">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTask('${task.id}')">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderKanbanView(tasksToRender) {
    const todo = document.getElementById('kanban-todo');
    const progress = document.getElementById('kanban-progress');
    const done = document.getElementById('kanban-done');

    if (!todo || !progress || !done) return;

    const todoTasks = tasksToRender.filter(t => !t.done);
    const doneTasks = tasksToRender.filter(t => t.done);

    todo.innerHTML = todoTasks.map(task => `
        <div class="kanban-task" onclick="openTaskModal('${task.id}')">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">${task.title}</div>
            ${task.description ? `<div style="font-size: 0.85rem; color: var(--gray-dark);">${task.description}</div>` : ''}
        </div>
    `).join('') || '<div style="text-align: center; color: var(--gray-dark); padding: 1rem;">Sem tarefas</div>';

    progress.innerHTML = '<div style="text-align: center; color: var(--gray-dark); padding: 1rem;">Sem tarefas</div>';

    done.innerHTML = doneTasks.map(task => `
        <div class="kanban-task" onclick="openTaskModal('${task.id}')">
            <div style="font-weight: 600; margin-bottom: 0.5rem; text-decoration: line-through; opacity: 0.6;">${task.title}</div>
        </div>
    `).join('') || '<div style="text-align: center; color: var(--gray-dark); padding: 1rem;">Sem tarefas</div>';
}

function renderTimelineView(tasksToRender) {
    const container = document.getElementById('timeline-list');
    if (!container) return;

    const sortedTasks = [...tasksToRender].sort((a, b) => {
        if (a.date && b.date) return new Date(a.date) - new Date(b.date);
        if (a.date) return -1;
        if (b.date) return 1;
        return 0;
    });

    container.innerHTML = sortedTasks.map(task => {
        return `
            <div class="task-item ${task.done ? 'done' : ''}">
                <div class="task-checkbox ${task.done ? 'checked' : ''}" onclick="toggleTask('${task.id}')">${task.done ? '✓' : ''}</div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    ${task.date ? `<div class="task-meta">📅 ${formatDate(task.date)} ${task.time || ''}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function setView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.task-view').forEach(v => v.style.display = 'none');
    
    event.target.classList.add('active');
    
    if (view === 'list') {
        document.getElementById('view-list').style.display = 'block';
    } else if (view === 'kanban') {
        document.getElementById('view-kanban').style.display = 'block';
    } else if (view === 'timeline') {
        document.getElementById('view-timeline').style.display = 'block';
    }
    
    renderTasks();
}

function saveTasks() {
    localStorage.setItem('planner_tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem('planner_tasks');
    if (saved) {
        tasks = JSON.parse(saved);
    }
    if (currentPlanner) {
        tasks = tasks.filter(t => t.planner_id === currentPlanner.id);
    }
}

// ==========================================
// TAGS & SUBTASKS
// ==========================================

function addTag() {
    const input = document.getElementById('tag-input');
    const tag = input.value.trim();
    if (tag && !currentTags.includes(tag)) {
        currentTags.push(tag);
        input.value = '';
        renderTags();
    }
}

function removeTag(tag) {
    currentTags = currentTags.filter(t => t !== tag);
    renderTags();
}

function renderTags() {
    const container = document.getElementById('tags-container');
    if (!container) return;
    container.innerHTML = currentTags.map((tag, index) => `
        <span class="tag">${tag} <button onclick="removeTagByIndex(${index})" style="margin-left: 0.25rem; background: none; border: none; cursor: pointer;">×</button></span>
    `).join('');
}

function removeTagByIndex(index) {
    currentTags.splice(index, 1);
    renderTags();
}

function addSubtask() {
    const input = document.getElementById('subtask-input');
    const subtask = input.value.trim();
    if (subtask) {
        currentSubtasks.push({ text: subtask, done: false });
        input.value = '';
        renderSubtasks();
    }
}

function removeSubtask(index) {
    currentSubtasks.splice(index, 1);
    renderSubtasks();
}

function renderSubtasks() {
    const container = document.getElementById('subtasks-list');
    if (!container) return;
    container.innerHTML = currentSubtasks.map((st, index) => `
        <div class="subtask-item">
            <input type="checkbox" ${st.done ? 'checked' : ''} onchange="currentSubtasks[${index}].done = this.checked">
            <span>${st.text}</span>
            <button onclick="removeSubtask(${index})">🗑️</button>
        </div>
    `).join('');
}

// ==========================================
// STATS & ACHIEVEMENTS
// ==========================================

function loadStats() {
    if (!currentUser) return;

    const completedTasks = tasks.filter(t => t.done).length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    document.getElementById('stat-level').textContent = currentUser.level || 1;
    document.getElementById('stat-streak').textContent = currentUser.streak || 0;
    document.getElementById('stat-completed').textContent = completedTasks;
    document.getElementById('stat-rate').textContent = completionRate + '%';

    // Update XP bar
    const xpProgress = calculateXPProgress(currentUser.xp || 0, currentUser.level || 1);
    document.getElementById('xp-bar').style.width = xpProgress + '%';
    document.getElementById('xp-text').textContent = `${currentUser.xp || 0} / ${(currentUser.level || 1) * 100} XP`;

    // Update charts
    updateCharts();
}

function loadAchievements() {
    if (!currentUser) return;

    const achievements = [
        { id: 'first_task', icon: '🎯', name: 'Primeira Tarefa', desc: 'Complete 1 tarefa', unlocked: (currentUser.tasks_completed || 0) >= 1 },
        { id: 'task_master', icon: '👑', name: 'Mestre das Tarefas', desc: 'Complete 10 tarefas', unlocked: (currentUser.tasks_completed || 0) >= 10 },
        { id: 'centenarian', icon: '💯', name: 'Centenário', desc: 'Complete 100 tarefas', unlocked: (currentUser.tasks_completed || 0) >= 100 },
        { id: 'week_streak', icon: '🔥', name: 'Streak 7 Dias', desc: 'Mantenha 7 dias de streak', unlocked: (currentUser.streak || 0) >= 7 },
        { id: 'month_streak', icon: '💪', name: 'Streak 30 Dias', desc: 'Mantenha 30 dias de streak', unlocked: (currentUser.streak || 0) >= 30 },
        { id: 'level_10', icon: '⭐', name: 'Nível 10', desc: 'Alcance o nível 10', unlocked: (currentUser.level || 1) >= 10 },
        { id: 'planner_pro', icon: '📋', name: 'Planejador Pro', desc: 'Crie 5 planners', unlocked: (currentUser.planners_created || 0) >= 5 }
    ];

    const container = document.getElementById('achievements-grid');
    if (!container) return;

    container.innerHTML = achievements.map(ach => `
        <div class="achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}">
            <div class="icon">${ach.icon}</div>
            <h4>${ach.name}</h4>
            <p>${ach.desc}</p>
        </div>
    `).join('');
}

function updateStats() {
    if (document.getElementById('tab-stats').classList.contains('active')) {
        loadStats();
    }
}

function calculateXPProgress(xp, level) {
    const xpForCurrentLevel = (level - 1) * 100;
    const xpInCurrentLevel = xp - xpForCurrentLevel;
    const xpNeededForNextLevel = level * 100 - xpForCurrentLevel;
    return Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100));
}

function updateCharts() {
    // Weekly productivity chart
    const weeklyCtx = document.getElementById('weekly-chart');
    if (weeklyCtx && typeof Chart !== 'undefined') {
        const weeklyData = getWeeklyTaskData();
        if (weeklyChart) weeklyChart.destroy();
        weeklyChart = new Chart(weeklyCtx, {
            type: 'bar',
            data: {
                labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
                datasets: [{
                    label: 'Tarefas Concluídas',
                    data: weeklyData,
                    backgroundColor: 'rgba(107, 70, 193, 0.8)'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // Priority chart
    const priorityCtx = document.getElementById('priority-chart');
    if (priorityCtx && typeof Chart !== 'undefined') {
        const priorityData = getPriorityData();
        if (priorityChart) priorityChart.destroy();
        priorityChart = new Chart(priorityCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(priorityData),
                datasets: [{
                    data: Object.values(priorityData),
                    backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#DC2626', '#7C2D12']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}

function getWeeklyTaskData() {
    const data = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    tasks.filter(t => t.done && t.completed_at).forEach(task => {
        const taskDate = new Date(task.completed_at);
        const daysDiff = Math.floor((today - taskDate) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0 && daysDiff < 7) {
            const dayOfWeek = taskDate.getDay();
            data[dayOfWeek]++;
        }
    });
    return data;
}

function getPriorityData() {
    const priorities = { baixa: 0, media: 0, alta: 0, urgente: 0, critica: 0 };
    tasks.forEach(task => {
        if (priorities[task.priority]) {
            priorities[task.priority]++;
        }
    });
    return priorities;
}

// ==========================================
// CALENDAR
// ==========================================

function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

function renderCalendar() {
    const container = document.getElementById('calendar-grid');
    const monthYear = document.getElementById('calendar-month-year');
    if (!container) return;

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    if (monthYear) monthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();

    let html = '<div class="calendar-day-header">Dom</div><div class="calendar-day-header">Seg</div><div class="calendar-day-header">Ter</div><div class="calendar-day-header">Qua</div><div class="calendar-day-header">Qui</div><div class="calendar-day-header">Sex</div><div class="calendar-day-header">Sáb</div>';

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day other-month"></div>';
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
        const hasTasks = tasks.some(t => t.date === dateStr);
        const classes = `calendar-day ${isToday ? 'today' : ''} ${hasTasks ? 'has-tasks' : ''}`;
        html += `<div class="${classes}" onclick="selectDate('${dateStr}')">${day}</div>`;
    }

    container.innerHTML = html;
}

function selectDate(dateStr) {
    document.getElementById('selected-date-title').textContent = `Tarefas de ${formatDate(dateStr)}`;
    const dayTasks = tasks.filter(t => t.date === dateStr);
    const container = document.getElementById('day-tasks-list');
    
    if (!container) return;
    
    if (dayTasks.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Nenhuma tarefa neste dia</p></div>';
        return;
    }

    container.innerHTML = dayTasks.map(task => `
        <div class="task-item ${task.done ? 'done' : ''}">
            <div class="task-checkbox ${task.done ? 'checked' : ''}" onclick="toggleTask('${task.id}')">${task.done ? '✓' : ''}</div>
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                ${task.time ? `<div class="task-meta">🕐 ${task.time}</div>` : ''}
            </div>
        </div>
    `).join('');
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function getCategoryIcon(category) {
    const icons = {
        trabalho: '💼',
        pessoal: '🏠',
        saude: '💪',
        estudos: '📚',
        financas: '💰',
        outro: '📦'
    };
    return icons[category] || '📦';
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
}

function updateUI() {
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.name || 'Usuário';
        document.getElementById('user-level').textContent = currentUser.level || 1;
        document.getElementById('user-streak').textContent = currentUser.streak || 0;
    }
    loadPlanners();
}

function closeLevelUpModal() {
    document.getElementById('level-up-modal').classList.remove('active');
}

function openTemplate(type) {
    console.log('Opening template:', type);
    // For now, just show an alert. In the future, this could open a modal with template details
    alert(`Template "${type}" será implementado em breve! Você poderá usar este template para criar planners automaticamente.`);
}

function openTutorial(type) {
    alert(`Tutorial ${type} será implementado em breve!`);
}

function exportCSV() {
    const csv = tasks.map(t => `${t.title},${t.done ? 'Sim' : 'Não'},${t.priority || ''},${t.date || ''}`).join('\n');
    const blob = new Blob(['Título,Concluída,Prioridade,Data\n' + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tarefas.csv';
    a.click();
}

function exportPDF() {
    alert('Exportação PDF será implementada em breve!');
}

function copyCalendarUrl() {
    const url = document.getElementById('calendar-url').textContent;
    navigator.clipboard.writeText(url).then(() => {
        alert('Link copiado!');
    });
}

function showPaywall() {
    document.getElementById('paywall-modal').classList.add('active');
}

function subscribe() {
    alert('Assinatura será implementada em breve!');
    document.getElementById('paywall-modal').classList.remove('active');
}

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choiceResult => {
            deferredPrompt = null;
        });
    }
}

function closeInstallBanner() {
    document.getElementById('install-banner').classList.remove('active');
}

// ==========================================
// INITIALIZATION
// ==========================================

async function initializeApp() {
    console.log('Initializing app...');
    
    // Load user
    const userStr = localStorage.getItem('planner_user');
    if (userStr) {
        currentUser = JSON.parse(userStr);
        console.log('User loaded:', currentUser.email);
    } else {
        console.warn('No user found in localStorage');
    }

    // Load planners and tasks
    const savedPlanners = localStorage.getItem('planner_planners');
    if (savedPlanners) {
        planners = JSON.parse(savedPlanners);
        console.log('Loaded planners:', planners.length);
    }
    
    const savedTasks = localStorage.getItem('planner_tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        console.log('Loaded tasks:', tasks.length);
    }
    
    // Update UI
    updateUI();

    // Show main app
    const authScreen = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');
    const loadingScreen = document.getElementById('loading-screen');
    
    if (authScreen) authScreen.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';
    if (loadingScreen) loadingScreen.style.display = 'none';

    // Update streak
    if (currentUser) {
        const lastActivity = currentUser.last_activity ? new Date(currentUser.last_activity) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (!lastActivity || lastActivity.toDateString() !== today.toDateString()) {
            if (lastActivity && lastActivity.getTime() === today.getTime() - 86400000) {
                currentUser.streak = (currentUser.streak || 0) + 1;
            } else if (!lastActivity) {
                currentUser.streak = 1;
            }
            currentUser.last_activity = today.toISOString();
            localStorage.setItem('planner_user', JSON.stringify(currentUser));
        }
    }

    // PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const installBanner = document.getElementById('install-banner');
        if (installBanner) installBanner.classList.add('active');
    });
    
    console.log('App initialized successfully!');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing...');
    
    // Check if user is logged in
    const hasUser = localStorage.getItem('planner_demo_user');
    
    if (hasUser) {
        setTimeout(() => initializeApp(), 100);
    } else {
        const loading = document.getElementById('loading-screen');
        const authScreen = document.getElementById('auth-screen');
        if (loading) loading.style.display = 'none';
        if (authScreen) authScreen.style.display = 'flex';
    }

    // Setup auth form
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', handleAuth);
        console.log('Auth form listener attached');
    }

    // Setup auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const isSignup = this.dataset.tab === 'signup';
            const nameGroup = document.getElementById('name-group');
            const submitBtn = document.getElementById('auth-submit-btn');
            if (nameGroup) nameGroup.style.display = isSignup ? 'block' : 'none';
            if (submitBtn) submitBtn.querySelector('span').textContent = isSignup ? 'Criar Conta' : 'Entrar';
        });
    });

    // Setup tag and subtask inputs
    const tagInput = document.getElementById('tag-input');
    if (tagInput) {
        tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
            }
        });
    }

    const subtaskInput = document.getElementById('subtask-input');
    if (subtaskInput) {
        subtaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSubtask();
            }
        });
    }
    
    // Ensure all functions are available immediately
    console.log('All functions initialized and available');
});

// Export all functions to window
window.handleAuth = handleAuth;
window.logout = logout;
window.switchTab = switchTab;
window.createPlanner = createPlanner;
window.openPlanner = openPlanner;
window.deletePlanner = deletePlanner;
window.closePlannerModal = closePlannerModal;
window.openTaskModal = openTaskModal;
window.closeTaskModal = closeTaskModal;
window.saveTask = saveTask;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.setView = setView;
window.filterTasks = filterTasks;
window.addTag = addTag;
window.removeTag = removeTag;
window.removeTagByIndex = removeTagByIndex;
window.addSubtask = addSubtask;
window.removeSubtask = removeSubtask;
window.closeLevelUpModal = closeLevelUpModal;
window.changeMonth = changeMonth;
window.selectDate = selectDate;
window.openTemplate = openTemplate;
window.openTutorial = openTutorial;
window.exportCSV = exportCSV;
window.exportPDF = exportPDF;
window.copyCalendarUrl = copyCalendarUrl;
window.showPaywall = showPaywall;
window.subscribe = subscribe;
window.changeLanguage = changeLanguage;
window.installPWA = installPWA;
window.closeInstallBanner = closeInstallBanner;

console.log('✅ Planner ULTRA - All functions loaded!');

