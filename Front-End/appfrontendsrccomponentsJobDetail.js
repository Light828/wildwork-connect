import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Briefcase, Calendar, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

const JobDetail = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const response = await axios.get(`${API}/jobs/${jobId}`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-emerald-600 text-lg">Loading...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-emerald-600 text-lg mb-4">Job not found</p>
          <Button onClick={() => navigate('/jobs')} className="bg-emerald-700 hover:bg-emerald-800">
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-emerald-700 text-white py-12">
        <div className="container mx-auto px-4">
          <Button 
            data-testid="back-jobs-btn"
            onClick={() => navigate('/jobs')} 
            variant="ghost" 
            className="text-white hover:bg-emerald-600 mb-4"
          >
            <ChevronLeft className="mr-2" /> Back to Jobs
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-white border-emerald-200 shadow-lg" data-testid="job-detail-card">
            <h1 className="text-4xl font-bold text-emerald-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              {job.title}
            </h1>
            
            <div className="flex flex-wrap gap-4 mb-6 text-emerald-600">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{job.reserve_name}</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                <span>{job.employment_type}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {job.salary_range && (
              <div className="mb-6">
                <p className="text-emerald-800 font-semibold text-lg">Salary: {job.salary_range}</p>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-emerald-900 mb-3">Location</h2>
              <p className="text-emerald-700">{job.location}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-emerald-900 mb-3">Job Description</h2>
              <p className="text-emerald-700 whitespace-pre-wrap">{job.description}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-emerald-900 mb-3">Requirements</h2>
              <p className="text-emerald-700 whitespace-pre-wrap">{job.requirements}</p>
            </div>

            <Button 
              data-testid="apply-now-btn"
              onClick={() => navigate(`/apply/${job.id}`)} 
              size="lg" 
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-lg py-6 rounded-full shadow-lg"
            >
              Apply Now
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;