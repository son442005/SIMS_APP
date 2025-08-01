// Admin Dashboard Component
const AdminDashboard = () => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('students');
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(false);

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

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">SIMS Admin Dashboard</h1>
                        </div>
                        <div className="flex items-center">
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
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('students')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'students'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Students
                            </button>
                            <button
                                onClick={() => setActiveTab('courses')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'courses'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Courses
                            </button>
                            <button
                                onClick={() => setActiveTab('enrollments')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'enrollments'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Enrollments
                            </button>
                        </nav>
                    </div>

                    <div className="mt-6">
                        {loading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : (
                            <>
                                {activeTab === 'students' && <StudentsTab students={students} onRefresh={loadData} />}
                                {activeTab === 'courses' && <CoursesTab courses={courses} onRefresh={loadData} />}
                                {activeTab === 'enrollments' && <EnrollmentsTab enrollments={enrollments} onRefresh={loadData} />}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Students Tab Component
const StudentsTab = ({ students, onRefresh }) => {
    const [showCreateForm, setShowCreateForm] = useState(false);
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

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Students</h2>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Add Student
                </button>
            </div>

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

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {students.map((student) => (
                        <li key={student.id} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">
                                        {student.firstName} {student.lastName}
                                    </h3>
                                    <p className="text-sm text-gray-500">{student.email}</p>
                                    <p className="text-sm text-gray-500">Student ID: {student.studentId}</p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Username: {student.username}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// Courses Tab Component
const CoursesTab = ({ courses, onRefresh }) => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        credits: 3,
        instructor: ''
    });

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/courses', formData);
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
            alert(error.response?.data?.message || 'Error creating course');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Courses</h2>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Add Course
                </button>
            </div>

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

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {courses.map((course) => (
                        <li key={course.id} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">
                                        {course.name} ({course.code})
                                    </h3>
                                    <p className="text-sm text-gray-500">{course.description}</p>
                                    <p className="text-sm text-gray-500">
                                        Credits: {course.credits} | Instructor: {course.instructor || 'TBD'}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// Enrollments Tab Component
const EnrollmentsTab = ({ enrollments, onRefresh }) => {
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

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Enrollments</h2>
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
                <ul className="divide-y divide-gray-200">
                    {enrollments.map((enrollment) => (
                        <li key={enrollment.id} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">
                                        {enrollment.studentName}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {enrollment.courseName} ({enrollment.courseCode})
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {enrollment.grade ? `Grade: ${enrollment.grade}` : 'No grade yet'}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// Student Dashboard Component
const StudentDashboard = () => {
    const { logout } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadMyCourses();
    }, []);

    const loadMyCourses = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/students/my-courses');
            setCourses(response.data);
        } catch (error) {
            console.error('Error loading courses:', error);
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