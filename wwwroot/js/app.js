const { useState, useEffect } = React;

// API Configuration
const API_BASE_URL = '/api';
axios.defaults.baseURL = API_BASE_URL;

// Main App Component
const App = () => {
    const { user, token } = useAuth();
    const [showLogin, setShowLogin] = useState(true);

    if (!token) {
        return (
            <div>
                {showLogin ? (
                    <Login onSwitchToRegister={() => setShowLogin(false)} />
                ) : (
                    <Register onSwitchToLogin={() => setShowLogin(true)} />
                )}
            </div>
        );
    }

    return user?.role === 'Admin' ? <AdminDashboard /> : <StudentDashboard />;
};

// Render the app
ReactDOM.render(
    <AuthProvider>
        <App />
    </AuthProvider>,
    document.getElementById('root')
); 