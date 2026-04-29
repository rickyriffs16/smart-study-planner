document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // Auth Check
    // ==========================================
    const savedUser = localStorage.getItem('study_username');
    if (!savedUser) { window.location.href = '/'; return; }

    const greetingTitle = document.getElementById('greetingTitle');
    if (greetingTitle) greetingTitle.textContent = `${savedUser}'s Dashboard`;

    window.logout = () => {
        localStorage.removeItem('study_username');
        window.location.href = '/';
    };

    // ==========================================
    // Theme
    // ==========================================
    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlEl = document.documentElement;

    function applyTheme(theme) {
        htmlEl.setAttribute('data-theme', theme);
        darkModeToggle.innerHTML = theme === 'dark'
            ? '<i class="bi bi-sun-fill"></i> Light Mode'
            : '<i class="bi bi-moon-stars-fill"></i> Dark Mode';
    }
    applyTheme(localStorage.getItem('theme') || 'dark');

    darkModeToggle.addEventListener('click', () => {
        const newTheme = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
        if (myChart) renderCharts(lastTasks);
    });

    // ==========================================
    // Sidebar View Switching
    // ==========================================
    const navItems = document.querySelectorAll('.nav-links li');
    const views = document.querySelectorAll('.view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const targetId = item.getAttribute('data-view');
            views.forEach(v => v.classList.remove('active-view'));
            document.getElementById(targetId)?.classList.add('active-view');
            if (targetId === 'view-analytics') renderCharts(lastTasks);
        });
    });

    // ==========================================
    // Pomodoro Timer
    // ==========================================
    const timeDisplay = document.getElementById('timeDisplay');
    const startTimerBtn = document.getElementById('startTimerBtn');
    const resetTimerBtn = document.getElementById('resetTimerBtn');
    const TOTAL_TIME = 25 * 60;
    let timeLeft = TOTAL_TIME, timerInterval, isRunning = false;

    function updateTimerDisplay() {
        const m = Math.floor(timeLeft / 60), s = timeLeft % 60;
        timeDisplay.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }

    startTimerBtn.addEventListener('click', () => {
        if (isRunning) {
            clearInterval(timerInterval);
            startTimerBtn.textContent = 'Resume';
            isRunning = false;
        } else {
            isRunning = true;
            startTimerBtn.textContent = 'Pause';
            timerInterval = setInterval(() => {
                timeLeft--;
                updateTimerDisplay();
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    isRunning = false;
                    startTimerBtn.textContent = 'Start';
                    alert('Session complete! Take a break.');
                    timeLeft = TOTAL_TIME;
                    updateTimerDisplay();
                    let streak = parseInt(document.getElementById('streakCount').innerText) || 0;
                    document.getElementById('streakCount').textContent = `${streak + 1} Day Streak`;
                }
            }, 1000);
        }
    });

    resetTimerBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        isRunning = false;
        timeLeft = TOTAL_TIME;
        updateTimerDisplay();
        startTimerBtn.textContent = 'Start';
    });

    // ==========================================
    // Auto-Schedule Button
    // ==========================================
    document.getElementById('aiRecommendBtn')?.addEventListener('click', function() {
        this.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Sorting...';
        this.disabled = true;
        setTimeout(() => {
            this.innerHTML = '<i class="bi bi-check2-circle"></i> Optimized!';
            this.classList.replace('btn-primary', 'btn-success');
            fetchTasks();
        }, 2000);
    });

    // ==========================================
    // Tasks API
    // ==========================================
    let lastTasks = [];

    async function fetchTasks() {
        try {
            const res = await fetch('/api/tasks');
            const data = await res.json();
            if (data.success) {
                lastTasks = data.data;
                renderTaskList(lastTasks);
                renderDashboardStats(lastTasks);
                renderDashboardPreview(lastTasks);
            }
        } catch (err) {
            document.getElementById('taskList').innerHTML = '<div class="alert alert-danger">Database offline.</div>';
        }
    }

    function renderTaskList(tasks) {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;
        if (tasks.length === 0) {
            taskList.innerHTML = '<div class="text-center text-muted py-5">No tasks yet. Add one!</div>';
            return;
        }
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const date = new Date(task.deadline).toLocaleDateString();
            const done = task.status === 'Completed';
            const el = document.createElement('div');
            el.className = `task-item priority-${task.priority} d-flex justify-content-between align-items-center p-3`;
            el.style.opacity = done ? '0.5' : '1';
            el.innerHTML = `
                <div class="d-flex align-items-center gap-3">
                    <input class="form-check-input" style="width:1.25rem;height:1.25rem;cursor:pointer;" type="checkbox" ${done ? 'checked' : ''} 
                        onchange="toggleTask('${task._id}', this.checked)">
                    <div>
                        <h6 class="mb-1 fw-bold ${done ? 'text-decoration-line-through text-muted' : ''}">${task.title}</h6>
                        <small class="text-muted"><i class="bi bi-journal-text"></i> ${task.subject} • <i class="bi bi-clock"></i> ${task.estimatedHours}h</small>
                    </div>
                </div>
                <div class="text-end">
                    <span class="badge bg-secondary mb-1">${date}</span><br>
                    <button class="btn btn-sm text-danger p-0 border-0" onclick="deleteTask('${task._id}')"><i class="bi bi-trash"></i></button>
                </div>`;
            taskList.appendChild(el);
        });
    }

    function renderDashboardStats(tasks) {
        const total = tasks.length;
        const done = tasks.filter(t => t.status === 'Completed').length;
        const hrs = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
        document.getElementById('statTotal').textContent = total;
        document.getElementById('statDone').textContent = done;
        document.getElementById('statHours').textContent = hrs + 'h';
        document.getElementById('analyticsCompletion').textContent = total ? Math.round((done/total)*100) + '%' : '0%';
        document.getElementById('analyticsDone').textContent = done;
        document.getElementById('analyticsHrs').textContent = hrs + 'h';
    }

    function renderDashboardPreview(tasks) {
        const preview = document.getElementById('dashboardTaskPreview');
        if (!preview) return;
        const highPriority = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').slice(0, 3);
        if (highPriority.length === 0) {
            preview.innerHTML = '<p class="text-muted small mb-0">No high priority tasks. Great job!</p>';
            return;
        }
        preview.innerHTML = highPriority.map(t => `
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <div>
                    <span class="fw-bold">${t.title}</span>
                    <small class="text-muted d-block">${t.subject} • ${t.estimatedHours}h</small>
                </div>
                <span class="badge bg-danger">${new Date(t.deadline).toLocaleDateString()}</span>
            </div>`).join('');
    }

    document.getElementById('taskForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newTask = {
            title: document.getElementById('title').value,
            subject: document.getElementById('subject').value,
            estimatedHours: parseFloat(document.getElementById('estimatedHours').value),
            deadline: document.getElementById('deadline').value,
            priority: document.getElementById('priority').value
        };
        const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTask) });
        if ((await res.json()).success) { e.target.reset(); fetchTasks(); }
    });

    window.toggleTask = async (id, checked) => {
        await fetch(`/api/tasks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: checked ? 'Completed' : 'Pending' }) });
        fetchTasks();
    };

    window.deleteTask = async (id) => {
        if (confirm('Delete task?')) { await fetch(`/api/tasks/${id}`, { method: 'DELETE' }); fetchTasks(); }
    };

    // ==========================================
    // Calendar Sync
    // ==========================================
    document.getElementById('syncCalendarBtn')?.addEventListener('click', async () => {
        const data = (await (await fetch('/api/tasks')).json());
        if (data.data.length === 0) return alert('No tasks to sync!');
        let ics = "BEGIN:VCALENDAR\nVERSION:2.0\n";
        data.data.forEach(t => {
            const d = new Date(t.deadline).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            ics += `BEGIN:VEVENT\nDTSTART:${d}\nDTEND:${d}\nSUMMARY:${t.title} (${t.subject})\nEND:VEVENT\n`;
        });
        ics += "END:VCALENDAR";
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
        a.download = 'study_schedule.ics';
        a.click();
    });

    // ==========================================
    // Notes
    // ==========================================
    const notesArea = document.getElementById('notesArea');
    if (notesArea) {
        notesArea.value = localStorage.getItem('study_notes') || '';
        notesArea.addEventListener('input', () => localStorage.setItem('study_notes', notesArea.value));
    }
    document.getElementById('clearNotesBtn')?.addEventListener('click', () => {
        if (confirm('Clear all notes?')) { notesArea.value = ''; localStorage.removeItem('study_notes'); }
    });

    // ==========================================
    // Flashcards
    // ==========================================
    function renderFlashcards() {
        const cards = JSON.parse(localStorage.getItem('flashcards') || '[]');
        const list = document.getElementById('flashcardList');
        if (!list) return;
        if (cards.length === 0) { list.innerHTML = '<p class="text-muted small">No flashcards yet.</p>'; return; }
        list.innerHTML = cards.map((c, i) => `
            <div class="p-2 mb-2 border rounded">
                <p class="fw-bold small mb-1">Q: ${c.q}</p>
                <p class="text-muted small mb-1">A: ${c.a}</p>
                <button class="btn btn-sm text-danger p-0 border-0" onclick="deleteFlashcard(${i})"><i class="bi bi-trash"></i> Remove</button>
            </div>`).join('');
    }

    document.getElementById('saveFlashcardBtn')?.addEventListener('click', () => {
        const q = document.getElementById('flashQ').value.trim();
        const a = document.getElementById('flashA').value.trim();
        if (!q || !a) return alert('Please fill in both fields.');
        const cards = JSON.parse(localStorage.getItem('flashcards') || '[]');
        cards.push({ q, a });
        localStorage.setItem('flashcards', JSON.stringify(cards));
        document.getElementById('flashQ').value = '';
        document.getElementById('flashA').value = '';
        renderFlashcards();
    });

    window.deleteFlashcard = (index) => {
        const cards = JSON.parse(localStorage.getItem('flashcards') || '[]');
        cards.splice(index, 1);
        localStorage.setItem('flashcards', JSON.stringify(cards));
        renderFlashcards();
    };

    // ==========================================
    // Charts
    // ==========================================
    let myChart = null, subjectChart = null;

    function renderCharts(tasks) {
        const dark = htmlEl.getAttribute('data-theme') === 'dark';
        const tColor = dark ? '#f8fafc' : '#0f172a';
        const gColor = dark ? '#334155' : '#e2e8f0';
        const total = tasks.length;
        const done = tasks.filter(t => t.status === 'Completed').length;
        const pending = total - done;

        // Bar chart - completion
        const ctx1 = document.getElementById('progressChart')?.getContext('2d');
        if (ctx1) {
            if (myChart) myChart.destroy();
            myChart = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: ['Completed', 'Pending', 'Total Hours'],
                    datasets: [{ data: [done, pending, tasks.reduce((s, t) => s + t.estimatedHours, 0)], backgroundColor: ['#10b981', '#f59e0b', '#4f46e5'], borderRadius: 6 }]
                },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { grid: { color: gColor }, ticks: { color: tColor } }, x: { grid: { display: false }, ticks: { color: tColor } } } }
            });
        }

        // Subject hours chart
        const ctx2 = document.getElementById('subjectChart')?.getContext('2d');
        if (ctx2 && tasks.length > 0) {
            const subjectMap = {};
            tasks.forEach(t => { subjectMap[t.subject] = (subjectMap[t.subject] || 0) + t.estimatedHours; });
            if (subjectChart) subjectChart.destroy();
            subjectChart = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(subjectMap),
                    datasets: [{ data: Object.values(subjectMap), backgroundColor: ['#4f46e5','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'], borderWidth: 0 }]
                },
                options: { responsive: true, plugins: { legend: { labels: { color: tColor } } } }
            });
        }
    }

    // ==========================================
    // Init
    // ==========================================
    fetchTasks();
    renderFlashcards();
});
