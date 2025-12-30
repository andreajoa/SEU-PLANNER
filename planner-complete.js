auth-form');
    if (authForm) {
        authForm.addEventListener('submit', handleAuth);
        console.log('✅ Auth form listener attached');
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
    
    // Setup tag input Enter key
    const tagInput = document.getElementById('tag-input');
    if (tagInput) {
        tagInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
            }
        });
    }
    
    // Setup subtask input Enter key
    const subtaskInput = document.getElementById('subtask-input');
    if (subtaskInput) {
        subtaskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSubtask();
            }
        });
    }
    
    console.log('✅ Planner ULTRA fully initialized!');
});

// Make all functions globally accessible
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
window.addSubtask = addSubtask;
window.removeSubtask = removeSubtask;
window.closeLevelUpModal = closeLevelUpModal;
window.changeMonth = changeMonth;
window.openTemplate = openTemplate;
window.openTutorial = openTutorial;
window.exportCSV = exportCSV;
window.exportPDF = exportPDF;
window.copyCalendarUrl = copyCalendarUrl;
window.showPaywall = showPaywall;
window.subscribe = subscribe;
window.logout = logout;
window.changeLanguage = changeLanguage;

console.log('✅ Planner ULTRA Complete v1.0 - All functions loaded!');
