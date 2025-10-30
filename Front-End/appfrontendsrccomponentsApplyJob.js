import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Upload } from 'lucide-react';
import { toast } from 'sonner';

const ApplyJob = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    cover_letter: ''
  });
  const [resume, setResume] = useState(null);
  const [resumeFileName, setResumeFileName] = useState('');

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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResume(file);
      setResumeFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!resume) {
      toast.error('Please upload your resume');
      return;
    }

    setSubmitting(true);

    try {
      // Upload resume first
      const fileFormData = new FormData();
      fileFormData.append('file', resume);
      
      const uploadResponse = await axios.post(`${API}/upload`, fileFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Submit application
      await axios.post(
        `${API}/applications?resume_filename=${uploadResponse.data.filename}`,
        {
          job_id: jobId,
          ...formData
        }
      );

      toast.success('Application submitted successfully!');
      setTimeout(() => navigate('/jobs'), 2000);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
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
            data-testid="back-job-detail-btn"
            onClick={() => navigate(`/jobs/${jobId}`)} 
            variant="ghost" 
            className="text-white hover:bg-emerald-600 mb-4"
          >
            <ChevronLeft className="mr-2" /> Back to Job Details
          </Button>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Apply for {job.title}
          </h1>
          <p className="text-lg opacity-90">{job.reserve_name}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 bg-white border-emerald-200 shadow-lg" data-testid="application-form">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="full_name" className="text-emerald-800">Full Name *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  data-testid="full-name-input"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="mt-2 border-emerald-200 focus:border-emerald-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-emerald-800">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  data-testid="email-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-2 border-emerald-200 focus:border-emerald-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-emerald-800">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  data-testid="phone-input"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="mt-2 border-emerald-200 focus:border-emerald-500"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-emerald-800">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  data-testid="address-input"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="mt-2 border-emerald-200 focus:border-emerald-500"
                  placeholder="123 Street, City, Country"
                />
              </div>

              <div>
                <Label htmlFor="cover_letter" className="text-emerald-800">Cover Letter *</Label>
                <Textarea
                  id="cover_letter"
                  name="cover_letter"
                  data-testid="cover-letter-input"
                  value={formData.cover_letter}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="mt-2 border-emerald-200 focus:border-emerald-500"
                  placeholder="Tell us why you're interested in this position..."
                />
              </div>

              <div>
                <Label htmlFor="resume" className="text-emerald-800">Resume/CV *</Label>
                <div className="mt-2">
                  <label 
                    htmlFor="resume" 
                    className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-emerald-300 rounded-lg cursor-pointer hover:border-emerald-500 transition-all"
                    data-testid="resume-upload-label"
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-emerald-700">
                        {resumeFileName ? resumeFileName : 'Click to upload your resume'}
                      </p>
                      <p className="text-sm text-emerald-500 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                    </div>
                  </label>
                  <input
                    id="resume"
                    type="file"
                    data-testid="resume-input"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                data-testid="submit-application-btn"
                disabled={submitting}
                size="lg" 
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-lg py-6 rounded-full shadow-lg"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplyJob;