import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, credentials);
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setUser(user);
      toast.success('Login successful!');
      
      if (user.is_admin) {
        navigate('/admin');
      } else {
        toast.error('Access denied. Admin privileges required.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Button 
          data-testid="back-home-login-btn"
          onClick={() => navigate('/')} 
          variant="ghost" 
          className="text-emerald-700 hover:bg-emerald-100 mb-4"
        >
          <ChevronLeft className="mr-2" /> Back to Home
        </Button>
        
        <Card className="p-8 bg-white border-emerald-200 shadow-xl" data-testid="login-card">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
            Admin Login
          </h1>
          <p className="text-emerald-600 text-center mb-6">Access the admin dashboard</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-emerald-800">Username</Label>
              <Input
                id="username"
                name="username"
                data-testid="username-input"
                value={credentials.username}
                onChange={handleInputChange}
                required
                className="mt-2 border-emerald-200 focus:border-emerald-500"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-emerald-800">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                data-testid="password-input"
                value={credentials.password}
                onChange={handleInputChange}
                required
                className="mt-2 border-emerald-200 focus:border-emerald-500"
                placeholder="Enter your password"
              />
            </div>

            <Button 
              type="submit" 
              data-testid="login-submit-btn"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-6 rounded-full mt-6"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;