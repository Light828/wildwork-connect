import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, Briefcase, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

const JobListings = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedReserve, setSelectedReserve] = useState('all');
  const [loading, setLoading] = useState(true);

  const reserves = [
    'Mhalamhala Reserve',
    'Elephant Reserve',
    'Sibambile Reserve',
    'Manyeleti Reserve',
    'Morning Site Reserve'
  ];

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedReserve === 'all') {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(jobs.filter(job => job.reserve_name === selectedReserve));
    }
  }, [selectedReserve, jobs]);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API}/jobs`);
      setJobs(response.data);
      setFilteredJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load job listings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-emerald-700 text-white py-12">
        <div className="container mx-auto px-4">
          <Button 
            data-testid="back-home-btn"
            onClick={() => navigate('/')} 
            variant="ghost" 
            className="text-white hover:bg-emerald-600 mb-4"
          >
            <ChevronLeft className="mr-2" /> Back to Home
          </Button>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Job Openings
          </h1>
          <p className="text-lg opacity-90">Find your perfect role in wildlife conservation</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
              <label className="block text-sm font-medium text-emerald-700 mb-2">Filter by Reserve</label>
              <Select value={selectedReserve} onValueChange={setSelectedReserve}>
                <SelectTrigger data-testid="reserve-filter" className="w-full">
                  <SelectValue placeholder="All Reserves" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reserves</SelectItem>
                  {reserves.map(reserve => (
                    <SelectItem key={reserve} value={reserve}>{reserve}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Job Listings */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-emerald-600">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-emerald-600 text-lg">No jobs available at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map(job => (
                <Card key={job.id} className="p-6 hover:shadow-xl transition-all duration-300 border-emerald-200 bg-white" data-testid={`job-card-${job.id}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-emerald-900 mb-2">{job.title}</h3>
                      <div className="flex items-center text-emerald-600 mb-2">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{job.reserve_name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm text-emerald-600">
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {job.employment_type}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-emerald-700 mb-4 line-clamp-3">{job.description}</p>

                  {job.salary_range && (
                    <p className="text-emerald-800 font-semibold mb-4">Salary: {job.salary_range}</p>
                  )}

                  <Button 
                    data-testid={`view-details-btn-R{job.id}`}
                    onClick={() => navigate(`/jobs/R{job.id}`)} 
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-full"
                  >
                    View Details & Apply
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListings;