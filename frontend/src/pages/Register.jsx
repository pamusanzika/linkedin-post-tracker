import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../utils/api';
import AuthForm from '../components/AuthForm';

const Register = () => {
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleRegister = async (email, password) => {
    try {
      setError('');
      const data = await auth.register(email, password);
      login(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="page-container">
      <div className="auth-page">
        <AuthForm mode="register" onSubmit={handleRegister} error={error} />
        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
