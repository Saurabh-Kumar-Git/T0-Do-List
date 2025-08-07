class TaskManager {
        constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    this.users = JSON.parse(localStorage.getItem('users')) || [];
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    this.taskIdCounter = parseInt(localStorage.getItem('taskIdCounter')) || 1;

    this.initializeEventListeners();
    this.checkAuthStatus();
            }

    initializeEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

                // Signup form
                document.getElementById('signupForm').addEventListener('submit', (e) => {
        e.preventDefault();
    this.handleSignup();
                });

                // Navigation between login/signup
                document.getElementById('showSignupLink').addEventListener('click', (e) => {
        e.preventDefault();
    this.showSignup();
                });

                document.getElementById('showLoginLink').addEventListener('click', (e) => {
        e.preventDefault();
    this.showLogin();
                });

                // Task form
                document.getElementById('taskForm').addEventListener('submit', (e) => {
        e.preventDefault();
    this.addTask();
                });

                // Control buttons
                document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
                document.getElementById('sortSelect').addEventListener('change', () => this.renderTasks());
                document.getElementById('filterSelect').addEventListener('change', () => this.renderTasks());
                document.getElementById('clearCompletedBtn').addEventListener('click', () => this.clearCompleted());
            }

    checkAuthStatus() {
                if (this.currentUser) {
        this.showTaskManager();
                } else {
        this.showLogin();
                }
            }

    handleLogin() {
                const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');

                // Check if user exists and password matches
                const user = this.users.find(u => u.email === email && u.password === password);

    if (user) {
        this.currentUser = { email, name: email.split('@')[0] };
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    this.showTaskManager();
    errorDiv.style.display = 'none';
    // Clear form
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
                } else {
        errorDiv.style.display = 'block';
                }
            }

    handleSignup() {
                const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const errorDiv = document.getElementById('signupErrorMessage');
    const successDiv = document.getElementById('signupSuccessMessage');

    // Reset messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    // Validation
    if (!email || password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters.';
    errorDiv.style.display = 'block';
    return;
                }

    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match.';
    errorDiv.style.display = 'block';
    return;
                }

                if (this.users.find(u => u.email === email)) {
        errorDiv.textContent = 'Email already exists.';
    errorDiv.style.display = 'block';
    return;
                }

    // Save new user
    this.users.push({email, password});
    localStorage.setItem('users', JSON.stringify(this.users));

    // Show success message and redirect
    successDiv.style.display = 'block';

    // Clear signup form
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('confirmPassword').value = '';

                // Pre-fill login form and redirect after delay
                setTimeout(() => {
        document.getElementById('email').value = email;
    document.getElementById('password').value = password;
    this.showLogin();
                }, 2000);
            }

    showLogin() {
        document.getElementById('loginPage').style.display = 'block';
    document.getElementById('signupPage').style.display = 'none';
    document.getElementById('taskManager').style.display = 'none';
            }

    showSignup() {
        document.getElementById('loginPage').style.display = 'none';
    document.getElementById('signupPage').style.display = 'block';
    document.getElementById('taskManager').style.display = 'none';
            }

    logout() {
        this.currentUser = null;
    localStorage.removeItem('currentUser');
    this.showLogin();
    // Clear forms
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
            }

    showTaskManager() {
        document.getElementById('loginPage').style.display = 'none';
    document.getElementById('signupPage').style.display = 'none';
    document.getElementById('taskManager').style.display = 'block';

    // Update user info
    const userAvatar = document.getElementById('userAvatar');
    const userEmail = document.getElementById('userEmail');

    userAvatar.textContent = this.currentUser.name.charAt(0).toUpperCase();
    userEmail.textContent = this.currentUser.email;

    this.renderTasks();
            }

    addTask() {
                const input = document.getElementById('taskInput');
    const taskText = input.value.trim();

    if (taskText) {
                    const task = {
        id: this.taskIdCounter++,
    text: taskText,
    completed: false,
    createdAt: new Date().toISOString(),
    user: this.currentUser.email
                    };

    this.tasks.unshift(task);
    this.saveTasks();
    input.value = '';
    this.renderTasks();
                }
            }

    toggleTask(id) {
                const task = this.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;
    this.saveTasks();
    this.renderTasks();
                }
            }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveTasks();
    this.renderTasks();
            }

    editTask(id) {
                const task = this.tasks.find(t => t.id === id);
    if (task) {
                    const newText = prompt('Edit task:', task.text);
    if (newText && newText.trim()) {
        task.text = newText.trim();
    task.updatedAt = new Date().toISOString();
    this.saveTasks();
    this.renderTasks();
                    }
                }
            }

    clearCompleted() {
                if (confirm('Are you sure you want to delete all completed tasks?')) {
        this.tasks = this.tasks.filter(t => !t.completed);
    this.saveTasks();
    this.renderTasks();
                }
            }

    getFilteredAndSortedTasks() {
                const userTasks = this.tasks.filter(t => t.user === this.currentUser.email);
    const filter = document.getElementById('filterSelect').value;
    const sort = document.getElementById('sortSelect').value;

    // Filter tasks
    let filteredTasks = userTasks;
    if (filter === 'pending') {
        filteredTasks = userTasks.filter(t => !t.completed);
                } else if (filter === 'completed') {
        filteredTasks = userTasks.filter(t => t.completed);
                }

                // Sort tasks
                filteredTasks.sort((a, b) => {
                    switch (sort) {
                        case 'oldest':
    return new Date(a.createdAt) - new Date(b.createdAt);
    case 'alphabetical':
    return a.text.localeCompare(b.text);
    case 'completed':
    return b.completed - a.completed;
    case 'pending':
    return a.completed - b.completed;
    default: // newest
    return new Date(b.createdAt) - new Date(a.createdAt);
                    }
                });

    return filteredTasks;
            }

    renderTasks() {
                const taskList = document.getElementById('taskList');
                const userTasks = this.tasks.filter(t => t.user === this.currentUser.email);
    const filteredTasks = this.getFilteredAndSortedTasks();

    // Update stats
    const totalTasks = userTasks.length;
                const pendingTasks = userTasks.filter(t => !t.completed).length;
                const completedTasks = userTasks.filter(t => t.completed).length;

    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;
    document.getElementById('completedTasks').textContent = completedTasks;

    // Render tasks
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon">📝</div>
                            <h3>No tasks found!</h3>
                            <p>Try adjusting your filters or add a new task.</p>
                        </div>
                    `;
                } else {
        taskList.innerHTML = filteredTasks.map(task => `
                        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                                   onchange="taskManager.toggleTask(${task.id})">
                            <div class="task-text">${this.escapeHtml(task.text)}</div>
                            <div class="task-date">${this.formatDate(task.createdAt)}</div>
                            <div class="task-actions">
                                <button class="edit-btn" onclick="taskManager.editTask(${task.id})">Edit</button>
                                <button class="delete-btn" onclick="taskManager.deleteTask(${task.id})">Delete</button>
                            </div>
                        </div>
                    `).join('');
                }
            }

    formatDate(dateString) {
                const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }

    escapeHtml(text) {
                const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
            }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    localStorage.setItem('taskIdCounter', this.taskIdCounter.toString());
            }
        }

    // Initialize the app
    const taskManager = new TaskManager();