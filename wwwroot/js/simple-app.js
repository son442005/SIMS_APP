// Simple SIMS App - No React, just vanilla JavaScript
const API_BASE_URL = '/api';
axios.defaults.baseURL = API_BASE_URL;

// Global state
let currentUser = null;
let currentToken = null;

// DOM elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const dashboard = document.getElementById('dashboard');
const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');
const showRegisterBtn = document.getElementById('showRegisterBtn');
const showLoginBtn = document.getElementById('showLoginBtn');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('SIMS App initialized');
    
    // Check if user is already logged in
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
        console.log('Found saved login data');
        currentToken = savedToken;
        currentUser = JSON.parse(savedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
        showDashboard();
    } else {
        console.log('No saved login data, showing login form');
        showLoginForm();
    }
    
    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Login form
    loginFormElement.addEventListener('submit', handleLogin);
    showRegisterBtn.addEventListener('click', showRegisterForm);
    
    // Register form
    registerFormElement.addEventListener('submit', handleRegister);
    showLoginBtn.addEventListener('click', showLoginForm);
}

async function handleLogin(e) {
    e.preventDefault();
    console.log('=== Login Attempt ===');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginButton = document.getElementById('loginButton');
    const loginButtonText = document.getElementById('loginButtonText');
    const errorMessage = document.getElementById('errorMessage');
    
    console.log('Username:', username);
    console.log('Password length:', password.length);
    
    // Show loading
    loginButton.disabled = true;
    loginButtonText.textContent = 'Signing in...';
    hideError('errorMessage');
    
    try {
        console.log('Making API call to /auth/login...');
        const response = await axios.post('/auth/login', { username, password });
        console.log('API Response received:', response.data);
        
        const { token, username: userUsername, role, userId } = response.data;
        
        // Save login data
        currentToken = token;
        currentUser = { username: userUsername, role, userId };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(currentUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('Login successful:', currentUser);
        console.log('Token set:', token ? 'YES' : 'NO');
        console.log('Authorization header set:', axios.defaults.headers.common['Authorization'] ? 'YES' : 'NO');
        
        showDashboard();
        
    } catch (error) {
        console.error('=== Login Error ===');
        console.error('Error object:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        
        const message = error.response?.data?.message || 'Login failed';
        showError('errorMessage', message);
    } finally {
        // Reset button
        loginButton.disabled = false;
        loginButtonText.textContent = 'Sign in';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    console.log('=== Register Attempt ===');
    
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        studentId: document.getElementById('studentId').value,
        username: document.getElementById('regUsername').value,
        password: document.getElementById('regPassword').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        address: document.getElementById('address').value
    };
    
    console.log('Form data:', formData);
    
    const registerButton = document.getElementById('registerButton');
    const registerButtonText = document.getElementById('registerButtonText');
    
    // Show loading
    registerButton.disabled = true;
    registerButtonText.textContent = 'Registering...';
    hideError('registerErrorMessage');
    
    try {
        console.log('Making API call to /auth/register...');
        const response = await axios.post('/auth/register', {
            ...formData,
            dateOfBirth: new Date(formData.dateOfBirth).toISOString()
        });
        console.log('API Response received:', response.data);
        
        const { token, username: userUsername, role, userId } = response.data;
        
        // Save login data
        currentToken = token;
        currentUser = { username: userUsername, role, userId };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(currentUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('Registration successful:', currentUser);
        showDashboard();
        
    } catch (error) {
        console.error('=== Register Error ===');
        console.error('Error object:', error);
        console.error('Error response:', error.response?.data);
        
        const message = error.response?.data?.message || 'Registration failed';
        showError('registerErrorMessage', message);
    } finally {
        // Reset button
        registerButton.disabled = false;
        registerButtonText.textContent = 'Register';
    }
}

function showLoginForm() {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    dashboard.classList.add('hidden');
}

function showRegisterForm() {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    dashboard.classList.add('hidden');
}

function showDashboard() {
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    dashboard.classList.remove('hidden');
    
    if (currentUser.role === 'Admin') {
        loadAdminDashboard();
    } else {
        loadStudentDashboard();
    }
}

async function loadAdminDashboard() {
    console.log('Loading Admin Dashboard...');
    
    try {
        const [studentsRes, coursesRes, enrollmentsRes] = await Promise.all([
            axios.get('/students'),
            axios.get('/courses'),
            axios.get('/courses/enrollments')
        ]);
        
        const students = studentsRes.data;
        const courses = coursesRes.data;
        const enrollments = enrollmentsRes.data;
        
        dashboard.innerHTML = `
            <div class="min-h-screen bg-gray-100">
                <nav class="bg-white shadow-sm">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex justify-between h-16">
                            <div class="flex items-center">
                                <h1 class="text-xl font-semibold text-gray-900">SIMS Admin Dashboard</h1>
                            </div>
                            <div class="flex items-center">
                                <span class="mr-4 text-sm text-gray-600">Welcome, ${currentUser.username}</span>
                                <button onclick="logout()" class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div class="px-4 py-6 sm:px-0">
                        <!-- Stats Cards -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div class="bg-white overflow-hidden shadow rounded-lg">
                                <div class="p-5">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0">
                                            <div class="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                                                <span class="text-white font-bold">S</span>
                                            </div>
                                        </div>
                                        <div class="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt class="text-sm font-medium text-gray-500 truncate">Students</dt>
                                                <dd class="text-lg font-medium text-gray-900">${students.length}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-white overflow-hidden shadow rounded-lg">
                                <div class="p-5">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0">
                                            <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                                <span class="text-white font-bold">C</span>
                                            </div>
                                        </div>
                                        <div class="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt class="text-sm font-medium text-gray-500 truncate">Courses</dt>
                                                <dd class="text-lg font-medium text-gray-900">${courses.length}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-white overflow-hidden shadow rounded-lg">
                                <div class="p-5">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0">
                                            <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                                                <span class="text-white font-bold">E</span>
                                            </div>
                                        </div>
                                        <div class="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt class="text-sm font-medium text-gray-500 truncate">Enrollments</dt>
                                                <dd class="text-lg font-medium text-gray-900">${enrollments.length}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tabs -->
                        <div class="border-b border-gray-200">
                            <nav class="-mb-px flex space-x-8">
                                <button onclick="showTab('students')" id="studentsTab" class="py-2 px-1 border-b-2 font-medium text-sm border-indigo-500 text-indigo-600">
                                    Students (${students.length})
                                </button>
                                <button onclick="showTab('courses')" id="coursesTab" class="py-2 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
                                    Courses (${courses.length})
                                </button>
                                <button onclick="showTab('enrollments')" id="enrollmentsTab" class="py-2 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
                                    Enrollments (${enrollments.length})
                                </button>
                            </nav>
                        </div>

                        <!-- Tab Content -->
                        <div id="tabContent" class="mt-6">
                            <!-- Students Tab -->
                            <div id="studentsContent" class="tab-content">
                                <div class="flex justify-between items-center mb-4">
                                    <h2 class="text-lg font-medium text-gray-900">Students Management</h2>
                                    <button onclick="showCreateStudentForm()" class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                        Add Student
                                    </button>
                                </div>
                                <div class="bg-white shadow overflow-hidden sm:rounded-md">
                                    <ul class="divide-y divide-gray-200">
                                        ${students.map(student => `
                                            <li class="px-6 py-4">
                                                <div class="flex items-center justify-between">
                                                    <div>
                                                        <h3 class="text-sm font-medium text-gray-900">
                                                            ${student.firstName} ${student.lastName}
                                                        </h3>
                                                        <p class="text-sm text-gray-500">${student.email}</p>
                                                        <p class="text-sm text-gray-500">Student ID: ${student.studentId}</p>
                                                        <p class="text-sm text-gray-500">Username: ${student.username}</p>
                                                    </div>
                                                    <div class="flex space-x-2">
                                                        <button onclick="editStudent(${student.id})" class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                                                            Edit
                                                        </button>
                                                        <button onclick="deleteStudent(${student.id})" class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            </div>

                            <!-- Courses Tab -->
                            <div id="coursesContent" class="tab-content hidden">
                                <div class="flex justify-between items-center mb-4">
                                    <h2 class="text-lg font-medium text-gray-900">Courses Management</h2>
                                    <button onclick="showCreateCourseForm()" class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                        Add Course
                                    </button>
                                </div>
                                <div class="bg-white shadow overflow-hidden sm:rounded-md">
                                    <ul class="divide-y divide-gray-200">
                                        ${courses.map(course => `
                                            <li class="px-6 py-4">
                                                <div class="flex items-center justify-between">
                                                    <div>
                                                        <h3 class="text-sm font-medium text-gray-900">
                                                            ${course.name} (${course.code})
                                                        </h3>
                                                        <p class="text-sm text-gray-500">Credits: ${course.credits}</p>
                                                        <p class="text-sm text-gray-500">Instructor: ${course.instructor || 'TBD'}</p>
                                                    </div>
                                                    <div class="flex space-x-2">
                                                        <button onclick="editCourse(${course.id})" class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                                                            Edit
                                                        </button>
                                                        <button onclick="deleteCourse(${course.id})" class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            </div>

                            <!-- Enrollments Tab -->
                            <div id="enrollmentsContent" class="tab-content hidden">
                                <div class="flex justify-between items-center mb-4">
                                    <h2 class="text-lg font-medium text-gray-900">Enrollments Management</h2>
                                    <button onclick="showCreateEnrollmentForm()" class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                        Enroll Student
                                    </button>
                                </div>
                                <div class="bg-white shadow overflow-hidden sm:rounded-md">
                                    <ul class="divide-y divide-gray-200">
                                        ${enrollments.map(enrollment => `
                                            <li class="px-6 py-4">
                                                <div class="flex items-center justify-between">
                                                    <div>
                                                        <h3 class="text-sm font-medium text-gray-900">
                                                            ${enrollment.studentName}
                                                        </h3>
                                                        <p class="text-sm text-gray-500">
                                                            ${enrollment.courseName} (${enrollment.courseCode})
                                                        </p>
                                                        <p class="text-sm text-gray-500">
                                                            Enrolled: ${new Date(enrollment.enrolledAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div class="flex space-x-2">
                                                        <button onclick="removeEnrollment(${enrollment.id})" class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Store data globally for use in forms
        window.adminData = { students, courses, enrollments };
        
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        dashboard.innerHTML = `
            <div class="min-h-screen bg-gray-100 flex items-center justify-center">
                <div class="text-center">
                    <h2 class="text-xl font-semibold text-gray-900">Error loading dashboard</h2>
                    <p class="text-gray-500">${error.message}</p>
                    <button onclick="logout()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded">Logout</button>
                </div>
            </div>
        `;
    }
}

async function loadStudentDashboard() {
    console.log('Loading Student Dashboard...');
    
    try {
        const response = await axios.get('/students/my-courses');
        console.log('My courses response:', response.data);
        
        const courses = response.data;
        
        dashboard.innerHTML = `
            <div class="min-h-screen bg-gray-100">
                <nav class="bg-white shadow-sm">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex justify-between h-16">
                            <div class="flex items-center">
                                <h1 class="text-xl font-semibold text-gray-900">SIMS Student Dashboard</h1>
                            </div>
                            <div class="flex items-center">
                                <span class="mr-4 text-sm text-gray-600">Welcome, ${currentUser.username} (ID: ${currentUser.userId})</span>
                                <button onclick="logout()" class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div class="px-4 py-6 sm:px-0">
                        <h2 class="text-lg font-medium text-gray-900 mb-4">My Courses</h2>
                        
                        <div class="bg-white shadow overflow-hidden sm:rounded-md">
                            ${courses.length === 0 ? `
                                <div class="px-6 py-4 text-center text-gray-500">
                                    You are not enrolled in any courses yet.
                                    <br>
                                    <small class="text-xs text-gray-400">
                                        Debug: Found ${courses.length} courses | User: ${currentUser.username} | ID: ${currentUser.userId}
                                    </small>
                                </div>
                            ` : `
                                <ul class="divide-y divide-gray-200">
                                    ${courses.map(course => `
                                        <li class="px-6 py-4">
                                            <div class="flex items-center justify-between">
                                                <div>
                                                    <h3 class="text-sm font-medium text-gray-900">
                                                        ${course.courseName} (${course.courseCode})
                                                    </h3>
                                                    <p class="text-sm text-gray-500">
                                                        Enrolled: ${new Date(course.enrolledAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div class="text-sm text-gray-500">
                                                    ${course.grade ? `Grade: ${course.grade}` : 'No grade yet'}
                                                </div>
                                            </div>
                                        </li>
                                    `).join('')}
                                </ul>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading student dashboard:', error);
        dashboard.innerHTML = `
            <div class="min-h-screen bg-gray-100 flex items-center justify-center">
                <div class="text-center">
                    <h2 class="text-xl font-semibold text-gray-900">Error loading courses</h2>
                    <p class="text-gray-500">${error.message}</p>
                    <button onclick="logout()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded">Logout</button>
                </div>
            </div>
        `;
    }
}

function logout() {
    console.log('Logging out...');
    currentUser = null;
    currentToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    showLoginForm();
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.classList.remove('hidden');
}

function hideError(elementId) {
    const element = document.getElementById(elementId);
    element.classList.add('hidden');
}

// Tab management
function showTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('[id$="Tab"]').forEach(tab => {
        tab.classList.remove('border-indigo-500', 'text-indigo-600');
        tab.classList.add('border-transparent', 'text-gray-500');
    });
    
    // Show selected tab content
    document.getElementById(tabName + 'Content').classList.remove('hidden');
    
    // Add active class to selected tab
    document.getElementById(tabName + 'Tab').classList.remove('border-transparent', 'text-gray-500');
    document.getElementById(tabName + 'Tab').classList.add('border-indigo-500', 'text-indigo-600');
}

// Student CRUD operations
function showCreateStudentForm() {
    const modal = createModal('Create New Student', `
        <form id="createStudentForm" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <input type="text" id="newFirstName" required placeholder="First Name" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <input type="text" id="newLastName" required placeholder="Last Name" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
            <input type="email" id="newEmail" required placeholder="Email" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <input type="text" id="newStudentId" required placeholder="Student ID" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <input type="text" id="newUsername" required placeholder="Username" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <input type="password" id="newPassword" required placeholder="Password" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <input type="tel" id="newPhoneNumber" placeholder="Phone Number (optional)" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <input type="date" id="newDateOfBirth" required class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <textarea id="newAddress" placeholder="Address (optional)" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
        </form>
    `);
    
    document.getElementById('createStudentForm').addEventListener('submit', handleCreateStudent);
}

async function handleCreateStudent(e) {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('newFirstName').value,
        lastName: document.getElementById('newLastName').value,
        email: document.getElementById('newEmail').value,
        studentId: document.getElementById('newStudentId').value,
        username: document.getElementById('newUsername').value,
        password: document.getElementById('newPassword').value,
        phoneNumber: document.getElementById('newPhoneNumber').value,
        dateOfBirth: document.getElementById('newDateOfBirth').value,
        address: document.getElementById('newAddress').value
    };
    
    try {
        const response = await axios.post('/students', {
            ...formData,
            dateOfBirth: new Date(formData.dateOfBirth).toISOString()
        });
        
        closeModal();
        loadAdminDashboard(); // Reload dashboard
        showSuccess('Student created successfully!');
        
    } catch (error) {
        showError('modalError', error.response?.data?.message || 'Error creating student');
    }
}

function editStudent(studentId) {
    const student = window.adminData.students.find(s => s.id === studentId);
    if (!student) return;
    
    const modal = createModal('Edit Student', `
        <form id="editStudentForm" class="space-y-4">
            <input type="hidden" id="editStudentId" value="${student.id}">
            <div class="grid grid-cols-2 gap-4">
                <input type="text" id="editFirstName" value="${student.firstName}" required placeholder="First Name" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <input type="text" id="editLastName" value="${student.lastName}" required placeholder="Last Name" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
            <input type="email" id="editEmail" value="${student.email}" required placeholder="Email" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <input type="text" id="editStudentId" value="${student.studentId}" required placeholder="Student ID" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <input type="tel" id="editPhoneNumber" value="${student.phoneNumber || ''}" placeholder="Phone Number (optional)" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <input type="date" id="editDateOfBirth" value="${student.dateOfBirth.split('T')[0]}" required class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <textarea id="editAddress" placeholder="Address (optional)" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md">${student.address || ''}</textarea>
        </form>
    `);
    
    document.getElementById('editStudentForm').addEventListener('submit', handleEditStudent);
}

async function handleEditStudent(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('editStudentId').value;
    const formData = {
        firstName: document.getElementById('editFirstName').value,
        lastName: document.getElementById('editLastName').value,
        email: document.getElementById('editEmail').value,
        studentId: document.getElementById('editStudentId').value,
        phoneNumber: document.getElementById('editPhoneNumber').value,
        dateOfBirth: document.getElementById('editDateOfBirth').value,
        address: document.getElementById('editAddress').value
    };
    
    try {
        await axios.put(`/students/${studentId}`, {
            ...formData,
            dateOfBirth: new Date(formData.dateOfBirth).toISOString()
        });
        
        closeModal();
        loadAdminDashboard(); // Reload dashboard
        showSuccess('Student updated successfully!');
        
    } catch (error) {
        showError('modalError', error.response?.data?.message || 'Error updating student');
    }
}

async function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
        await axios.delete(`/students/${studentId}`);
        loadAdminDashboard(); // Reload dashboard
        showSuccess('Student deleted successfully!');
        
    } catch (error) {
        showError('modalError', error.response?.data?.message || 'Error deleting student');
    }
}

// Course CRUD operations
function showCreateCourseForm() {
    const modal = createModal('Create New Course', `
        <form id="createCourseForm" class="space-y-4">
            <input type="text" id="newCourseName" required placeholder="Course Name" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <input type="text" id="newCourseCode" required placeholder="Course Code" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <textarea id="newCourseDescription" placeholder="Description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
            <input type="number" id="newCourseCredits" value="3" required placeholder="Credits" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <input type="text" id="newCourseInstructor" placeholder="Instructor" class="w-full px-3 py-2 border border-gray-300 rounded-md">
        </form>
    `);
    
    document.getElementById('createCourseForm').addEventListener('submit', handleCreateCourse);
}

async function handleCreateCourse(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('newCourseName').value,
        code: document.getElementById('newCourseCode').value,
        description: document.getElementById('newCourseDescription').value,
        credits: parseInt(document.getElementById('newCourseCredits').value),
        instructor: document.getElementById('newCourseInstructor').value
    };
    
    try {
        await axios.post('/courses', formData);
        
        closeModal();
        loadAdminDashboard(); // Reload dashboard
        showSuccess('Course created successfully!');
        
    } catch (error) {
        showError('modalError', error.response?.data?.message || 'Error creating course');
    }
}

function editCourse(courseId) {
    const course = window.adminData.courses.find(c => c.id === courseId);
    if (!course) return;
    
    const modal = createModal('Edit Course', `
        <form id="editCourseForm" class="space-y-4">
            <input type="hidden" id="editCourseId" value="${course.id}">
            <input type="text" id="editCourseName" value="${course.name}" required placeholder="Course Name" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <input type="text" id="editCourseCode" value="${course.code}" required placeholder="Course Code" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <textarea id="editCourseDescription" placeholder="Description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md">${course.description || ''}</textarea>
            <input type="number" id="editCourseCredits" value="${course.credits}" required placeholder="Credits" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <input type="text" id="editCourseInstructor" value="${course.instructor || ''}" placeholder="Instructor" class="w-full px-3 py-2 border border-gray-300 rounded-md">
        </form>
    `);
    
    document.getElementById('editCourseForm').addEventListener('submit', handleEditCourse);
}

async function handleEditCourse(e) {
    e.preventDefault();
    
    const courseId = document.getElementById('editCourseId').value;
    const formData = {
        name: document.getElementById('editCourseName').value,
        code: document.getElementById('editCourseCode').value,
        description: document.getElementById('editCourseDescription').value,
        credits: parseInt(document.getElementById('editCourseCredits').value),
        instructor: document.getElementById('editCourseInstructor').value
    };
    
    try {
        await axios.put(`/courses/${courseId}`, formData);
        
        closeModal();
        loadAdminDashboard(); // Reload dashboard
        showSuccess('Course updated successfully!');
        
    } catch (error) {
        showError('modalError', error.response?.data?.message || 'Error updating course');
    }
}

async function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
        await axios.delete(`/courses/${courseId}`);
        loadAdminDashboard(); // Reload dashboard
        showSuccess('Course deleted successfully!');
        
    } catch (error) {
        showError('modalError', error.response?.data?.message || 'Error deleting course');
    }
}

// Enrollment operations
function showCreateEnrollmentForm() {
    const students = window.adminData.students;
    const courses = window.adminData.courses;
    
    const modal = createModal('Enroll Student in Course', `
        <form id="createEnrollmentForm" class="space-y-4">
            <select id="enrollmentStudentId" required class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Select Student</option>
                ${students.map(student => `
                    <option value="${student.id}">${student.firstName} ${student.lastName} (${student.studentId})</option>
                `).join('')}
            </select>
            <select id="enrollmentCourseId" required class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Select Course</option>
                ${courses.map(course => `
                    <option value="${course.id}">${course.name} (${course.code})</option>
                `).join('')}
            </select>
        </form>
    `);
    
    document.getElementById('createEnrollmentForm').addEventListener('submit', handleCreateEnrollment);
}

async function handleCreateEnrollment(e) {
    e.preventDefault();
    
    const formData = {
        studentId: parseInt(document.getElementById('enrollmentStudentId').value),
        courseId: parseInt(document.getElementById('enrollmentCourseId').value)
    };
    
    try {
        await axios.post('/courses/enroll', formData);
        
        closeModal();
        loadAdminDashboard(); // Reload dashboard
        showSuccess('Student enrolled successfully!');
        
    } catch (error) {
        showError('modalError', error.response?.data?.message || 'Error enrolling student');
    }
}

async function removeEnrollment(enrollmentId) {
    if (!confirm('Are you sure you want to remove this enrollment?')) return;
    
    try {
        await axios.delete(`/courses/enrollments/${enrollmentId}`);
        loadAdminDashboard(); // Reload dashboard
        showSuccess('Enrollment removed successfully!');
        
    } catch (error) {
        showError('modalError', error.response?.data?.message || 'Error removing enrollment');
    }
}

// Modal utilities
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    modal.innerHTML = `
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <h3 class="text-lg font-medium mb-4">${title}</h3>
                <div id="modalError" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"></div>
                ${content}
                <div class="flex space-x-2 mt-4">
                    <button type="submit" form="${content.includes('id="') ? content.match(/id="([^"]+)"/)[1] : ''}" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        Save
                    </button>
                    <button onclick="closeModal()" class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

function closeModal() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        modal.remove();
    }
}

function showSuccess(message) {
    // Create a simple success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 