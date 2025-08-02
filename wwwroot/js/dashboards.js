// Admin Dashboard Component
const AdminDashboard = () => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('students');
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [studentsRes, coursesRes, enrollmentsRes] = await Promise.all([
                axios.get('/students'),
                axios.get('/courses'),
                axios.get('/courses/enrollments')
            ]);
            setStudents(studentsRes.data);
            setCourses(coursesRes.data);
            setEnrollments(enrollmentsRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        }
        setLoading(false);
    };

    const handleLogout = () => {
        logout();
    };

    // Filter and pagination logic
    const getFilteredItems = (items) => {
        if (!searchTerm) return items;
        return items.filter(item =>
            Object.values(item).some(value =>
                value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    };

    const getPaginatedItems = (items) => {
        const filtered = getFilteredItems(items);
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filtered.slice(startIndex, startIndex + itemsPerPage);
    };

    const totalPages = (items) => {
        return Math.ceil(getFilteredItems(items).length / itemsPerPage);
    };

    const renderPagination = (items) => {
        const total = totalPages(items);
        if (total <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredItems(items).length)} of {getFilteredItems(items).length} results
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                        Page {currentPage} of {total}
                    </span>
                    <button
                        onClick={() => setCurrentPage(Math.min(total, currentPage + 1))}
                        disabled={currentPage === total}
                        className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">SIMS Admin Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('students')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'students'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Students ({students.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('courses')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'courses'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Courses ({courses.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('enrollments')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'enrollments'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Enrollments ({enrollments.length})
                            </button>
                        </nav>
                    </div>

                    {loading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : (
                        <div className="mt-6">
                            {activeTab === 'students' && (
                                <StudentsTab
                                    students={getPaginatedItems(students)}
                                    onRefresh={loadData}
                                    pagination={renderPagination(students)}
                                />
                            )}
                            {activeTab === 'courses' && (
                                <CoursesTab
                                    courses={getPaginatedItems(courses)}
                                    onRefresh={loadData}
                                    pagination={renderPagination(courses)}
                                />
                            )}
                            {activeTab === 'enrollments' && (
                                <EnrollmentsTab
                                    enrollments={getPaginatedItems(enrollments)}
                                    onRefresh={loadData}
                                    pagination={renderPagination(enrollments)}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Students Tab Component
const StudentsTab = ({ students, onRefresh, pagination }) => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        studentId: '',
        username: '',
        password: '',
        phoneNumber: '',
        dateOfBirth: '',
        address: ''
    });

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/students', {
                ...formData,
                dateOfBirth: new Date(formData.dateOfBirth).toISOString()
            });
            setShowCreateForm(false);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                studentId: '',
                username: '',
                password: '',
                phoneNumber: '',
                dateOfBirth: '',
                address: ''
            });
            onRefresh();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating student');
        }
    };

    const handleEditStudent = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/students/${editingStudent.id}`, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                studentId: formData.studentId,
                phoneNumber: formData.phoneNumber,
                dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
                address: formData.address
            });
            setShowEditForm(false);
            setEditingStudent(null);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                studentId: '',
                username: '',
                password: '',
                phoneNumber: '',
                dateOfBirth: '',
                address: ''
            });
            onRefresh();
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating student');
        }
    };

    const handleDeleteStudent = async (studentId) => {
        if (confirm('Are you sure you want to delete this student?')) {
            try {
                await axios.delete(`/students/${studentId}`);
                onRefresh();
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting student');
            }
        }
    };

    const openEditForm = (student) => {
        setEditingStudent(student);
        setFormData({
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            studentId: student.studentId,
            username: student.username,
            password: '',
            phoneNumber: student.phoneNumber || '',
            dateOfBirth: student.dateOfBirth.split('T')[0],
            address: student.address || ''
        });
        setShowEditForm(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Students Management</h2>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Add Student
                </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-medium mb-4">Create New Student</h3>
                        <form onSubmit={handleCreateStudent} className="space-y-4">
                            <input
                                type="text"
                                required
                                placeholder="First Name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                            <input
                                type="text"
                                required
                                placeholder="Last Name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                            <input
                                type="email"
                                required
                                placeholder="Email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <input
                                type="text"
                                required
                                placeholder="Student ID"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.studentId}
                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                            />
                            <input
                                type="text"
                                required
                                placeholder="Username"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                            <input
                                type="password"
                                required
                                placeholder="Password"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number (optional)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            />
                            <input
                                type="date"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            />
                            <textarea
                                placeholder="Address (optional)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows="3"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                            <div className="flex space-x-2">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Create
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Form */}
            {showEditForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-medium mb-4">Edit Student</h3>
                        <form onSubmit={handleEditStudent} className="space-y-4">
                            <input
                                type="text"
                                required
                                placeholder="First Name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                            <input
                                type="text"
                                required
                                placeholder="Last Name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                            <input
                                type="email"
                                required
                                placeholder="Email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <input
                                type="text"
                                required
                                placeholder="Student ID"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.studentId}
                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number (optional)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            />
                            <input
                                type="date"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            />
                            <textarea
                                placeholder="Address (optional)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows="3"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                            <div className="flex space-x-2">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Update
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowEditForm(false)}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {students.length === 0 ? (
                    <div className="px-6 py-4 text-center text-gray-500">
                        No students found.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {students.map((student) => (
                            <li key={student.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {student.firstName} {student.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-500">{student.email}</p>
                                        <p className="text-sm text-gray-500">Student ID: {student.studentId}</p>
                                        <p className="text-sm text-gray-500">Username: {student.username}</p>
                                        {student.phoneNumber && (
                                            <p className="text-sm text-gray-500">Phone: {student.phoneNumber}</p>
                                        )}
                                        {student.address && (
                                            <p className="text-sm text-gray-500">Address: {student.address}</p>
                                        )}
                                        <p className="text-sm text-gray-500">
                                            Created: {new Date(student.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => openEditForm(student)}
                                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteStudent(student.id)}
                                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {pagination}
        </div>
    );
};

// Courses Tab Component
const CoursesTab = ({ courses, onRefresh, pagination }) => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        credits: 3,
        instructor: ''
    });

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        console.log('Creating course with data:', formData);
        try {
            const response = await axios.post('/courses', formData);
            console.log('Course created successfully:', response.data);
            setShowCreateForm(false);
            setFormData({
                name: '',
                code: '',
                description: '',
                credits: 3,
                instructor: ''
            });
            onRefresh();
        } catch (error) {
            console.error('Error creating course:', error);
            console.error('Error response:', error.response?.data);
            alert(error.response?.data?.message || 'Error creating course');
        }
    };

    const handleEditCourse = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/courses/${editingCourse.id}`, formData);
            setShowEditForm(false);
            setEditingCourse(null);
            setFormData({
                name: '',
                code: '',
                description: '',
                credits: 3,
                instructor: ''
            });
            onRefresh();
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating course');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (confirm('Are you sure you want to delete this course?')) {
            try {
                await axios.delete(`/courses/${courseId}`);
                onRefresh();
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting course');
            }
        }
    };

    const openEditForm = (course) => {
        setEditingCourse(course);
        setFormData({
            name: course.name,
            code: course.code,
            description: course.description || '',
            credits: course.credits,
            instructor: course.instructor || ''
        });
        setShowEditForm(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Courses Management</h2>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Add Course
                </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-medium mb-4">Create New Course</h3>
                        <form onSubmit={handleCreateCourse} className="space-y-4">
                            <input
                                type="text"
                                required
                                placeholder="Course Name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                type="text"
                                required
                                placeholder="Course Code"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            />
                            <textarea
                                placeholder="Description"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            <input
                                type="number"
                                required
                                placeholder="Credits"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.credits}
                                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                            />
                            <input
                                type="text"
                                placeholder="Instructor"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.instructor}
                                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                            />
                            <div className="flex space-x-2">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Create
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Form */}
            {showEditForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-medium mb-4">Edit Course</h3>
                        <form onSubmit={handleEditCourse} className="space-y-4">
                            <input
                                type="text"
                                required
                                placeholder="Course Name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                type="text"
                                required
                                placeholder="Course Code"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            />
                            <textarea
                                placeholder="Description"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            <input
                                type="number"
                                required
                                placeholder="Credits"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.credits}
                                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                            />
                            <input
                                type="text"
                                placeholder="Instructor"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.instructor}
                                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                            />
                            <div className="flex space-x-2">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Update
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowEditForm(false)}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {courses.length === 0 ? (
                    <div className="px-6 py-4 text-center text-gray-500">
                        No courses found.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {courses.map((course) => (
                            <li key={course.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {course.name} ({course.code})
                                        </h3>
                                        {course.description && (
                                            <p className="text-sm text-gray-500">{course.description}</p>
                                        )}
                                        <p className="text-sm text-gray-500">
                                            Credits: {course.credits} | Instructor: {course.instructor || 'TBD'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Created: {new Date(course.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => openEditForm(course)}
                                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCourse(course.id)}
                                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {pagination}
        </div>
    );
};

// Enrollments Tab Component
const EnrollmentsTab = ({ enrollments, onRefresh, pagination }) => {
    const [showEnrollForm, setShowEnrollForm] = useState(false);
    const [formData, setFormData] = useState({
        studentId: '',
        courseId: ''
    });
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        loadStudentsAndCourses();
    }, []);

    const loadStudentsAndCourses = async () => {
        try {
            const [studentsRes, coursesRes] = await Promise.all([
                axios.get('/students'),
                axios.get('/courses')
            ]);
            setStudents(studentsRes.data);
            setCourses(coursesRes.data);
        } catch (error) {
            console.error('Error loading students and courses:', error);
        }
    };

    const handleEnrollStudent = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/courses/enroll', {
                studentId: parseInt(formData.studentId),
                courseId: parseInt(formData.courseId)
            });
            setShowEnrollForm(false);
            setFormData({ studentId: '', courseId: '' });
            onRefresh();
        } catch (error) {
            alert(error.response?.data?.message || 'Error enrolling student');
        }
    };

    const handleRemoveEnrollment = async (enrollmentId) => {
        if (confirm('Are you sure you want to remove this enrollment?')) {
            try {
                await axios.delete(`/courses/enrollments/${enrollmentId}`);
                onRefresh();
            } catch (error) {
                alert(error.response?.data?.message || 'Error removing enrollment');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Enrollments Management</h2>
                <button
                    onClick={() => setShowEnrollForm(true)}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Enroll Student
                </button>
            </div>

            {showEnrollForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-medium mb-4">Enroll Student in Course</h3>
                        <form onSubmit={handleEnrollStudent} className="space-y-4">
                            <select
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.studentId}
                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                            >
                                <option value="">Select Student</option>
                                {students.map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.firstName} {student.lastName} ({student.studentId})
                                    </option>
                                ))}
                            </select>
                            <select
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.courseId}
                                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                            >
                                <option value="">Select Course</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.name} ({course.code})
                                    </option>
                                ))}
                            </select>
                            <div className="flex space-x-2">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Enroll
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowEnrollForm(false)}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {enrollments.length === 0 ? (
                    <div className="px-6 py-4 text-center text-gray-500">
                        No enrollments found.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {enrollments.map((enrollment) => (
                            <li key={enrollment.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {enrollment.studentName}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {enrollment.courseName} ({enrollment.courseCode})
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                        </p>
                                        {enrollment.grade && (
                                            <p className="text-sm text-gray-500">
                                                Grade: {enrollment.grade} {enrollment.letterGrade ? `(${enrollment.letterGrade})` : ''}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleRemoveEnrollment(enrollment.id)}
                                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {pagination}
        </div>
    );
};

// Student Dashboard Component
const StudentDashboard = () => {
    const { logout, user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadMyCourses();
    }, []);

    const loadMyCourses = async () => {
        setLoading(true);
        try {
            console.log('=== Loading courses debug ===');
            console.log('User object:', user);
            console.log('User ID:', user?.userId);
            console.log('Authorization header:', axios.defaults.headers.common['Authorization']);
            console.log('Token from localStorage:', localStorage.getItem('token'));

            const response = await axios.get('/students/my-courses');
            console.log('API Response:', response.data);
            setCourses(response.data);
        } catch (error) {
            console.error('=== Error loading courses ===');
            console.error('Error object:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error headers:', error.response?.headers);

            // If unauthorized, try to refresh token or redirect to login
            if (error.response?.status === 401) {
                console.log('Unauthorized - clearing auth data');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
            }
        }
        setLoading(false);
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">SIMS Student Dashboard</h1>
                        </div>
                        <div className="flex items-center">
                            <div className="mr-4 text-sm text-gray-600">
                                Welcome, {user?.username} (ID: {user?.userId})
                            </div>
                            <button
                                onClick={handleLogout}
                                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">My Courses</h2>

                    {loading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            {courses.length === 0 ? (
                                <div className="px-6 py-4 text-center text-gray-500">
                                    You are not enrolled in any courses yet.
                                    <br />
                                    <small className="text-xs text-gray-400">
                                        Debug: Found {courses.length} courses | User: {user?.username} | ID: {user?.userId}
                                    </small>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {courses.map((course) => (
                                        <li key={course.id} className="px-6 py-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900">
                                                        {course.courseName} ({course.courseCode})
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {course.grade ? `Grade: ${course.grade}` : 'No grade yet'}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 