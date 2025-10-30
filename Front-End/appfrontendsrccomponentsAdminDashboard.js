import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Code, Mail, Phone, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API}/applications`);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-emerald-700 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Admin Dashboard
              </h1>
              <p className="text-emerald-100">Welcome, {user?.username}</p>
            </div>
            <div className="flex gap-3">
              <Button 
                data-testid="view-source-code-btn"
                onClick={() => navigate('/admin/source-code')} 
                variant="outline" 
                className="border-white text-white hover:bg-emerald-600"
              >
                <Code className="mr-2" /> View Source Code
              </Button>
              <Button 
                data-testid="logout-btn"
                onClick={handleLogout} 
                variant="outline" 
                className="border-white text-white hover:bg-emerald-600"
              >
                <LogOut className="mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="applications" data-testid="applications-tab">Applications ({applications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-emerald-600">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-emerald-600 text-lg">No applications yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {applications.map(app => (
                  <Card key={app.id} className="p-6 border-emerald-200 bg-white" data-testid={`application-card-${app.id}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-emerald-900 mb-1">{app.full_name}</h3>
                        <p className="text-sm text-emerald-600">Job ID: {app.job_id}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-emerald-700">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{app.email}</span>
                      </div>
                      <div className="flex items-center text-emerald-700">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{app.phone}</span>
                      </div>
                      <div className="flex items-center text-emerald-700">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(app.applied_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-emerald-700">
                        <FileText className="w-4 h-4 mr-2" />
                        <span>Resume: {app.resume_path}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-semibold text-emerald-800 mb-1">Address:</p>
                      <p className="text-emerald-700">{app.address}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-emerald-800 mb-1">Cover Letter:</p>
                      <p className="text-emerald-700 whitespace-pre-wrap">{app.cover_letter}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;