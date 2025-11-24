import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../utils/api';
import AuthForm from '../components/AuthForm';

const Login = () => {
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (email, password) => {
    try {
      setError('');
      const data = await auth.login(email, password);
      login(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="page-container">
      <div className="auth-page">
        <AuthForm mode="login" onSubmit={handleLogin} error={error} />
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
