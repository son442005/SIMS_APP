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
document.addEventListener('DOMContentLoaded', function () {
    console.log('SIMS App initialized');

    // Check URL parameters for force logout
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('logout') === 'true') {
        console.log('Force logout requested');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Remove logout parameter from URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check if user is already logged in
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
        console.log('Found saved login data');
        try {
            currentToken = savedToken;
            currentUser = JSON.parse(savedUser);
            axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;

            // Verify token is still valid by making a test API call
            verifyTokenAndShowDashboard();
        } catch (error) {
            console.log('Invalid saved data, clearing and showing login');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showLoginForm();
        }
    } else {
        console.log('No saved login data, showing login form');
        showLoginForm();
    }

    // Setup event listeners
    setupEventListeners();
});

// Verify token validity
async function verifyTokenAndShowDashboard() {
    try {
        // Try to make a simple API call to verify token
        const response = await axios.get('/courses');
        if (response.status === 200) {
            console.log('Token verified, showing dashboard');
            showDashboard();
        } else {
            throw new Error('Token verification failed');
        }
    } catch (error) {
        console.log('Token verification failed:', error.response?.status);
        // Token is invalid, clear storage and show login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        currentToken = null;
        currentUser = null;
        delete axios.defaults.headers.common['Authorization'];
        showLoginForm();
    }
}



// Client-side validation for registration form
function validateRegistrationForm(formData) {
    const errors = [];

    // Required fields validation
    if (!formData.firstName) {
        errors.push('First Name is required');
    } else if (formData.firstName.length > 100) {
        errors.push('First Name must be less than 100 characters');
    }

    if (!formData.lastName) {
        errors.push('Last Name is required');
    } else if (formData.lastName.length > 100) {
        errors.push('Last Name must be less than 100 characters');
    }

    if (!formData.email) {
        errors.push('Email is required');
    } else if (!isValidEmail(formData.email)) {
        errors.push('Please enter a valid email address');
    } else if (formData.email.length > 100) {
        errors.push('Email must be less than 100 characters');
    }

    if (!formData.studentId) {
        errors.push('Student ID is required');
    } else if (formData.studentId.length > 20) {
        errors.push('Student ID must be less than 20 characters');
    }

    if (!formData.username) {
        errors.push('Username is required');
    } else if (formData.username.length > 50) {
        errors.push('Username must be less than 50 characters');
    } else if (formData.username.length < 3) {
        errors.push('Username must be at least 3 characters');
    }

    if (!formData.password) {
        errors.push('Password is required');
    }

    if (!formData.dateOfBirth) {
        errors.push('Date of Birth is required');
    } else {
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        if (age < 16 || age > 100) {
            errors.push('Age must be between 16 and 100 years');
        }
    }

    // Optional fields validation
    if (formData.phoneNumber && formData.phoneNumber.length > 20) {
        errors.push('Phone Number must be less than 20 characters');
    }

    if (formData.address && formData.address.length > 200) {
        errors.push('Address must be less than 200 characters');
    }

    return errors;
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

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

        const { token, username: userUsername, role, userId, studentId } = response.data;

        // Save login data
        currentToken = token;
        currentUser = { username: userUsername, role, userId, studentId };
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
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        studentId: document.getElementById('studentId').value.trim(),
        username: document.getElementById('regUsername').value.trim(),
        password: document.getElementById('regPassword').value,
        phoneNumber: document.getElementById('phoneNumber').value.trim(),
        dateOfBirth: document.getElementById('dateOfBirth').value,
        address: document.getElementById('address').value.trim()
    };

    console.log('Form data:', formData);

    // Client-side validation
    const validationErrors = validateRegistrationForm(formData);
    if (validationErrors.length > 0) {
        showError('registerErrorMessage', validationErrors.join('\n'));
        return;
    }

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

        const { token, username: userUsername, role, userId, studentId } = response.data;

        // Save login data
        currentToken = token;
        currentUser = { username: userUsername, role, userId, studentId };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(currentUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        console.log('Registration successful:', currentUser);
        showDashboard();

    } catch (error) {
        console.error('=== Register Error ===');
        console.error('Error object:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error status text:', error.response?.statusText);

        let message = 'Registration failed';

        if (error.response?.data?.message) {
            // Backend trả về message cụ thể
            message = error.response.data.message;
        } else if (error.response?.data?.errors) {
            // Validation errors từ ASP.NET Core
            const errors = error.response.data.errors;
            const errorMessages = [];

            for (const field in errors) {
                if (errors[field] && Array.isArray(errors[field])) {
                    errorMessages.push(`${field}: ${errors[field].join(', ')}`);
                }
            }

            if (errorMessages.length > 0) {
                message = errorMessages.join('\n');
            }
        } else if (error.response?.status === 400) {
            message = 'Invalid registration data. Please check all fields.';
        } else if (error.response?.status === 409) {
            message = 'Username, email or student ID already exists.';
        } else if (error.response?.status === 422) {
            message = 'Validation failed. Please check your input data.';
        } else if (error.response?.status >= 500) {
            message = 'Server error occurred. Please try again later.';
        } else if (error.request) {
            message = 'Network error. Please check your connection.';
        }

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
    } else if (currentUser.role === 'Teacher') {
        loadTeacherDashboard();
    } else {
        loadStudentDashboard();
    }
}

async function loadAdminDashboard() {
    console.log('Loading Admin Dashboard...');

    try {
        const [studentsRes, teachersRes, coursesRes, enrollmentsRes] = await Promise.all([
            axios.get('/students'),
            axios.get('/teachers'),
            axios.get('/courses'),
            axios.get('/courses/enrollments')
        ]);

        const students = studentsRes.data;
        const teachers = teachersRes.data;
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
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                                                <span class="text-white font-bold">T</span>
                                            </div>
                                        </div>
                                        <div class="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt class="text-sm font-medium text-gray-500 truncate">Teachers</dt>
                                                <dd class="text-lg font-medium text-gray-900">${teachers.length}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-white overflow-hidden shadow rounded-lg">
                                <div class="p-5">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0">
                                            <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
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
                                <button onclick="showTab('teachers')" id="teachersTab" class="py-2 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
                                    Teachers (${teachers.length})
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

                            <!-- Teachers Tab -->
                            <div id="teachersContent" class="tab-content hidden">
                                <div class="flex justify-between items-center mb-4">
                                    <h2 class="text-lg font-medium text-gray-900">Teachers Management</h2>
                                    <button onclick="showCreateTeacherForm()" class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                        Add Teacher
                                    </button>
                                </div>
                                <div class="bg-white shadow overflow-hidden sm:rounded-md">
                                    <ul class="divide-y divide-gray-200">
                                        ${teachers.map(teacher => `
                                            <li class="px-6 py-4">
                                                <div class="flex items-center justify-between">
                                                    <div>
                                                        <h3 class="text-sm font-medium text-gray-900">
                                                            ${teacher.firstName} ${teacher.lastName}
                                                        </h3>
                                                        <p class="text-sm text-gray-500">${teacher.email}</p>

                                                        ${teacher.department ? `<p class="text-sm text-gray-500">Department: ${teacher.department}</p>` : ''}
                                                        ${teacher.specialization ? `<p class="text-sm text-gray-500">Specialization: ${teacher.specialization}</p>` : ''}
                                                    </div>
                                                    <div class="flex space-x-2">
                                                        <button onclick="editTeacher(${teacher.id})" class="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700">
                                                            Edit
                                                        </button>
                                                        <button onclick="deleteTeacher(${teacher.id})" class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
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
                                                        <p class="text-sm text-gray-500">Teacher: ${course.teacherName || 'Not Assigned'}</p>
                                                    </div>
                                                    <div class="flex space-x-2">
                                                        <button onclick="editCourse(${course.id})" class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                                                            Edit
                                                        </button>
                                                        ${!course.teacherName ? `<button onclick="assignTeacherToCourse(${course.id})" class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                                                            Assign Teacher
                                                        </button>` : ''}
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
                                
                                <!-- Course Filter -->
                                <div class="mb-4 flex items-center space-x-4 bg-yellow-100 p-3 rounded">
                                    <label class="text-sm font-medium text-gray-700">🔍 Filter by Course:</label>
                                    <select id="courseFilter" onchange="filterEnrollmentsByCourse()" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="">All Courses</option>
                                        ${courses.map(course => `
                                            <option value="${course.id}">${course.code} - ${course.name}</option>
                                        `).join('')}
                                    </select>
                                    <span id="filterInfo" class="text-sm text-gray-600 font-bold">Filter ready!</span>
                                </div>
                                <div class="bg-white shadow overflow-hidden sm:rounded-md">
                                    <ul id="enrollmentsList" class="divide-y divide-gray-200">
                                        ${enrollments.map(enrollment => `
                                            <li class="enrollment-item px-6 py-4" data-course-id="${enrollment.courseId}">
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
                                                        ${enrollment.grade ? `
                                                            <p class="text-sm text-gray-500">
                                                                Grade: ${enrollment.grade} ${enrollment.letterGrade ? `(${enrollment.letterGrade})` : ''}
                                                            </p>
                                                        ` : ''}
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
        window.adminData = { students, teachers, courses, enrollments };

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

async function loadTeacherDashboard() {
    console.log('Loading Teacher Dashboard...');

    try {
        const response = await axios.get('/teachers/my-courses');
        const courses = response.data;

        dashboard.innerHTML = `
            <div class="min-h-screen bg-gray-100">
                <nav class="bg-white shadow-sm">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex justify-between h-16">
                            <div class="flex items-center">
                                <h1 class="text-xl font-semibold text-gray-900">SIMS Teacher Dashboard</h1>
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
                        <!-- Stats Card -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div class="bg-white overflow-hidden shadow rounded-lg">
                                <div class="p-5">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0">
                                            <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                                <span class="text-white font-bold">C</span>
                                            </div>
                                        </div>
                                        <div class="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt class="text-sm font-medium text-gray-500 truncate">Assigned Courses</dt>
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
                                            <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                                <span class="text-white font-bold">S</span>
                                            </div>
                                        </div>
                                        <div class="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt class="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                                                <dd class="text-lg font-medium text-gray-900">${courses.reduce((total, course) => total + course.enrolledStudentsCount, 0)}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Course List -->
                        <div class="bg-white shadow overflow-hidden sm:rounded-md">
                            <div class="px-4 py-5 sm:px-6">
                                <h3 class="text-lg leading-6 font-medium text-gray-900">My Courses</h3>
                                <p class="mt-1 max-w-2xl text-sm text-gray-500">Courses assigned to you</p>
                            </div>
                            ${courses.length > 0 ? `
                                <ul class="divide-y divide-gray-200">
                                    ${courses.map(course => `
                                        <li class="px-6 py-4">
                                            <div class="flex items-center justify-between">
                                                <div>
                                                    <h3 class="text-sm font-medium text-gray-900">
                                                        ${course.name} (${course.code})
                                                    </h3>
                                                    <p class="text-sm text-gray-500">${course.description || 'No description'}</p>
                                                    <p class="text-sm text-gray-500">Credits: ${course.credits}</p>
                                                    <p class="text-sm text-gray-500">Enrolled Students: ${course.enrolledStudentsCount}</p>
                                                </div>
                                                                                                <div class="flex items-center space-x-2">
                                                    <span class="text-sm text-gray-500">Created: ${new Date(course.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </li>
                                    `).join('')}
                                </ul>
                            ` : `
                                <div class="px-6 py-4 text-center">
                                    <p class="text-gray-500">No courses assigned yet.</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error loading teacher dashboard:', error);
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
                        <!-- Student Information -->
                        <div class="bg-white shadow rounded-lg p-6 mb-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p class="text-sm text-gray-600">Student ID</p>
                                    <p class="text-lg font-semibold text-gray-900">${currentUser.studentId || 'N/A'}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-600">Username</p>
                                    <p class="text-lg font-semibold text-gray-900">${currentUser.username}</p>
                                </div>
                            </div>
                        </div>
                        
                        <h2 class="text-lg font-medium text-gray-900 mb-4">My Courses</h2>
                        
                        <div class="bg-white shadow overflow-hidden sm:rounded-md">
                            ${courses.length === 0 ? `
                                <div class="px-6 py-4 text-center text-gray-500">
                                    You are not enrolled in any courses yet.
                                    <br>

                                </div>
                            ` : `
                                <ul class="divide-y divide-gray-200">
                                    ${courses.map(course => `
                                        <li class="px-6 py-6 border-b border-gray-200">
                                            <div class="space-y-4">
                                                <!-- Course Header -->
                                                <div class="flex items-center justify-between">
                                                    <div class="flex items-center space-x-3">
                                                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <span class="text-blue-600 font-bold text-lg">${course.courseCode.charAt(0)}</span>
                                                        </div>
                                                        <div>
                                                            <h3 class="text-lg font-semibold text-gray-900">
                                                                ${course.courseName}
                                                            </h3>
                                                            <p class="text-sm text-gray-600 font-medium">
                                                                Course Code: ${course.courseCode}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div class="text-right">
                                                        <div class="text-2xl font-bold text-blue-600">
                                                            ${course.grade ? course.grade : '--'}
                                                        </div>
                                                        <div class="text-xs text-gray-500">
                                                            ${course.grade ? 'Grade' : 'No Grade'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <!-- Course Details -->
                                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                                                    <div class="space-y-2">
                                                        <div class="flex items-center space-x-2">
                                                            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                            </svg>
                                                            <span class="text-sm font-medium text-gray-700">Enrollment Date</span>
                                                        </div>
                                                        <p class="text-sm text-gray-600">
                                                            ${new Date(course.enrolledAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}
                                                        </p>
                                                    </div>

                                                    <div class="space-y-2">
                                                        <div class="flex items-center space-x-2">
                                                            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                            </svg>
                                                            <span class="text-sm font-medium text-gray-700">Status</span>
                                                        </div>
                                                        <p class="text-sm text-gray-600">
                                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Enrolled
                                                            </span>
                                                        </p>
                                                    </div>

                                                    <div class="space-y-2">
                                                        <div class="flex items-center space-x-2">
                                                            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                                            </svg>
                                                            <span class="text-sm font-medium text-gray-700">Student</span>
                                                        </div>
                                                        <p class="text-sm text-gray-600">${course.studentName}</p>
                                                    </div>
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

    // Handle multiple line messages
    if (message.includes('\n')) {
        // Replace newlines with <br> tags for HTML display
        element.innerHTML = message.replace(/\n/g, '<br>');
    } else {
        element.textContent = message;
    }

    element.classList.remove('hidden');

    // Auto-hide after 10 seconds for better UX
    setTimeout(() => {
        hideError(elementId);
    }, 10000);
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
    const teachers = window.adminData.teachers || [];
    console.log('Available teachers for course assignment:', teachers);

    const teacherOptions = teachers.map(teacher =>
        `<option value="${teacher.id}">${teacher.firstName} ${teacher.lastName} (${teacher.teacherId})</option>`
    ).join('');

    const modal = createModal('Create New Course', `
        <form id="createCourseForm" class="space-y-4">
            <input type="text" id="newCourseName" required placeholder="Course Name" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <input type="text" id="newCourseCode" required placeholder="Course Code" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <textarea id="newCourseDescription" placeholder="Description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
            <input type="number" id="newCourseCredits" value="3" required placeholder="Credits" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <select id="newCourseTeacherId" required class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Select Teacher (Required)</option>
                ${teacherOptions}
            </select>
        </form>
    `);

    document.getElementById('createCourseForm').addEventListener('submit', handleCreateCourse);
}

async function handleCreateCourse(e) {
    e.preventDefault();

    const teacherId = document.getElementById('newCourseTeacherId').value;
    const formData = {
        name: document.getElementById('newCourseName').value,
        code: document.getElementById('newCourseCode').value,
        description: document.getElementById('newCourseDescription').value,
        credits: parseInt(document.getElementById('newCourseCredits').value),
        teacherId: parseInt(teacherId)
    };

    console.log('Creating course with data:', formData);

    try {
        await axios.post('/courses', formData);

        closeModal();
        loadAdminDashboard(); // Reload dashboard
        showSuccess('Course created successfully!');

    } catch (error) {
        console.error('Error creating course:', error);
        showError('modalError', error.response?.data?.message || 'Error creating course');
    }
}

function editCourse(courseId) {
    const course = window.adminData.courses.find(c => c.id === courseId);
    if (!course) return;

    const teachers = window.adminData.teachers || [];
    const teacherOptions = teachers.map(teacher =>
        `<option value="${teacher.id}" ${course.teacherId === teacher.id ? 'selected' : ''}>${teacher.firstName} ${teacher.lastName} (${teacher.teacherId})</option>`
    ).join('');

    const modal = createModal('Edit Course', `
        <form id="editCourseForm" class="space-y-4">
            <input type="hidden" id="editCourseId" value="${course.id}">
            <input type="text" id="editCourseName" value="${course.name}" required placeholder="Course Name" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <input type="text" id="editCourseCode" value="${course.code}" required placeholder="Course Code" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <textarea id="editCourseDescription" placeholder="Description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md">${course.description || ''}</textarea>
            <input type="number" id="editCourseCredits" value="${course.credits}" required placeholder="Credits" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <select id="editCourseTeacherId" required class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Select Teacher (Required)</option>
                ${teacherOptions}
            </select>
        </form>
    `);

    document.getElementById('editCourseForm').addEventListener('submit', handleEditCourse);
}

async function handleEditCourse(e) {
    e.preventDefault();

    const courseId = document.getElementById('editCourseId').value;
    const teacherId = document.getElementById('editCourseTeacherId').value;
    const formData = {
        name: document.getElementById('editCourseName').value,
        code: document.getElementById('editCourseCode').value,
        description: document.getElementById('editCourseDescription').value,
        credits: parseInt(document.getElementById('editCourseCredits').value),
        teacherId: parseInt(teacherId)
    };

    console.log('Updating course with data:', formData);

    try {
        await axios.put(`/courses/${courseId}`, formData);

        closeModal();
        loadAdminDashboard(); // Reload dashboard
        showSuccess('Course updated successfully!');

    } catch (error) {
        console.error('Error updating course:', error);
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

function filterEnrollmentsByCourse() {
    console.log('🔄 SIMS Filter function called!');
    const courseFilter = document.getElementById('courseFilter');
    const filterInfo = document.getElementById('filterInfo');
    const enrollmentItems = document.querySelectorAll('.enrollment-item');

    console.log('📊 Found elements:', {
        courseFilter: courseFilter ? 'FOUND' : 'NOT FOUND',
        filterInfo: filterInfo ? 'FOUND' : 'NOT FOUND',
        enrollmentItems: enrollmentItems.length + ' items'
    });

    const selectedCourseId = courseFilter.value;
    let visibleCount = 0;

    console.log('🎯 Selected Course ID:', selectedCourseId || 'All Courses');

    enrollmentItems.forEach(item => {
        const itemCourseId = item.getAttribute('data-course-id');

        if (!selectedCourseId || itemCourseId === selectedCourseId) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });

    // Update filter info
    if (selectedCourseId) {
        const selectedOption = courseFilter.options[courseFilter.selectedIndex];
        const courseName = selectedOption.text;
        filterInfo.textContent = `Showing ${visibleCount} student(s) enrolled in ${courseName}`;
    } else {
        filterInfo.textContent = '';
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

// Teacher Management Functions
function showCreateTeacherForm() {
    console.log('🎯 SIMS Create Teacher Form called!');

    const content = `
        <form id="createTeacherForm" onsubmit="handleCreateTeacher(event)">
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">First Name</label>
                        <input id="teacherFirstName" type="text" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Last Name</label>
                        <input id="teacherLastName" type="text" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input id="teacherEmail" type="email" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2">
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Teacher ID</label>
                        <input id="teacherTeacherId" type="text" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Username</label>
                        <input id="teacherUsername" type="text" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700">Password</label>
                    <input id="teacherPassword" type="password" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2">
                </div>
            </div>
        </form>
    `;

    createModal('Add New Teacher', content);
}

async function handleCreateTeacher(e) {
    e.preventDefault();
    console.log('=== Create Teacher Attempt ===');

    const formData = {
        firstName: document.getElementById('teacherFirstName').value.trim(),
        lastName: document.getElementById('teacherLastName').value.trim(),
        email: document.getElementById('teacherEmail').value.trim(),
        teacherId: document.getElementById('teacherTeacherId').value.trim(),
        username: document.getElementById('teacherUsername').value.trim(),
        password: document.getElementById('teacherPassword').value
    };

    console.log('Teacher form data:', formData);

    try {
        console.log('Sending POST request to /teachers...');
        const response = await axios.post('/teachers', formData);
        console.log('Teacher created successfully:', response.data);

        closeModal();
        showSuccess('Teacher created successfully!');
        loadAdminDashboard(); // Reload dashboard

    } catch (error) {
        console.error('=== ERROR DETAILS ===');
        console.error('Error object:', error);
        console.error('Error message:', error.message);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        console.error('Error headers:', error.response?.headers);

        let errorMessage = 'Error creating teacher';

        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.data?.errors) {
            // Handle validation errors
            const errors = error.response.data.errors;
            const errorList = Object.keys(errors).map(key => `${key}: ${errors[key].join(', ')}`).join('\n');
            errorMessage = `Validation errors:\n${errorList}`;
        } else if (error.message) {
            errorMessage = error.message;
        }

        console.error('Final error message:', errorMessage);
        showError('modalError', errorMessage);
    }
}

function editTeacher(teacherId) {
    console.log('Edit teacher:', teacherId);

    const teacher = window.adminData.teachers.find(t => t.id === teacherId);
    if (!teacher) {
        console.error('Teacher not found');
        return;
    }

    const content = `
        <form id="editTeacherForm" onsubmit="handleEditTeacher(event, ${teacherId})">
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">First Name</label>
                        <input id="editTeacherFirstName" type="text" required value="${teacher.firstName}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Last Name</label>
                        <input id="editTeacherLastName" type="text" required value="${teacher.lastName}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input id="editTeacherEmail" type="email" required value="${teacher.email}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700">Teacher ID</label>
                    <input id="editTeacherTeacherId" type="text" required value="${teacher.teacherId}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2">
                </div>
            </div>
        </form>
    `;

    createModal('Edit Teacher', content);
}

async function handleEditTeacher(e, teacherId) {
    e.preventDefault();
    console.log('=== Edit Teacher Attempt ===', teacherId);

    const formData = {
        firstName: document.getElementById('editTeacherFirstName').value.trim(),
        lastName: document.getElementById('editTeacherLastName').value.trim(),
        email: document.getElementById('editTeacherEmail').value.trim(),
        teacherId: document.getElementById('editTeacherTeacherId').value.trim()
    };

    console.log('Teacher edit data:', formData);

    try {
        await axios.put(`/teachers/${teacherId}`, formData);
        console.log('Teacher updated successfully');

        closeModal();
        showSuccess('Teacher updated successfully!');
        loadAdminDashboard(); // Reload dashboard

    } catch (error) {
        console.error('Error updating teacher:', error);
        const message = error.response?.data?.message || 'Error updating teacher';
        showError('modalError', message);
    }
}

async function deleteTeacher(teacherId) {
    if (!confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
        return;
    }

    console.log('Delete teacher:', teacherId);

    try {
        await axios.delete(`/teachers/${teacherId}`);
        console.log('Teacher deleted successfully');

        showSuccess('Teacher deleted successfully!');
        loadAdminDashboard(); // Reload dashboard

    } catch (error) {
        console.error('Error deleting teacher:', error);
        const message = error.response?.data?.message || 'Error deleting teacher';
        alert(message);
    }
}

async function assignTeacherToCourse(courseId) {
    const teachers = window.adminData.teachers || [];
    if (teachers.length === 0) {
        alert('No teachers available. Please add a teacher first.');
        return;
    }

    const teacherOptions = teachers.map(teacher =>
        `<option value="${teacher.id}">${teacher.firstName} ${teacher.lastName} (${teacher.teacherId})</option>`
    ).join('');

    const content = `
        <form id="assignTeacherForm" onsubmit="handleAssignTeacher(event, ${courseId})">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Select Teacher</label>
                    <select id="assignTeacherId" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2">
                        <option value="">Choose a teacher...</option>
                        ${teacherOptions}
                    </select>
                </div>
            </div>
        </form>
    `;

    createModal('Assign Teacher to Course', content);
}

async function handleAssignTeacher(e, courseId) {
    e.preventDefault();

    const teacherId = document.getElementById('assignTeacherId').value;
    if (!teacherId) {
        alert('Please select a teacher');
        return;
    }

    try {
        await axios.post(`/courses/${courseId}/assign-teacher`, { teacherId: parseInt(teacherId) });

        closeModal();
        showSuccess('Teacher assigned successfully!');
        loadAdminDashboard(); // Reload dashboard

    } catch (error) {
        console.error('Error assigning teacher:', error);
        const message = error.response?.data?.message || 'Error assigning teacher';
        showError('modalError', message);
    }
}



