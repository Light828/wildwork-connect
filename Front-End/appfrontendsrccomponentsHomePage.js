import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Users, Briefcase, ChevronRight } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const reserves = [
    { name: 'Mhalamhala Reserve', description: 'Experience pristine wilderness and diverse wildlife' },
    { name: 'Elephant Reserve', description: 'Home to majestic elephants and conservation efforts' },
    { name: 'Sibambile Reserve', description: 'Discover unique ecosystems and rare species' },
    { name: 'Manyeleti Reserve', description: 'An unfenced paradise for wildlife enthusiasts' },
    { name: 'Morning Site Reserve', description: 'Where nature awakens with breathtaking beauty' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyZDUwMTYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnptMCAxMGMwLTEuMS0uOS0yLTItMnMtMiAuOS0yIDIgLjkgMiAyIDIgMi0uOSAyLTJ6TTI0IDE0YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnptMCAxMGMwLTEuMS0uOS0yLTItMnMtMiAuOS0yIDIgLjkgMiAyIDIgMi0uOSAyLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-emerald-900 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Wildlife Reserve Careers
            </h1>
            <p className="text-lg sm:text-xl text-emerald-700 mb-8 max-w-2xl mx-auto">
              Join our team of dedicated conservationists and wildlife professionals across five premier reserves
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                data-testid="view-jobs-btn"
                onClick={() => navigate('/jobs')} 
                size="lg" 
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-6 text-lg rounded-full shadow-lg"
              >
                View Job Openings <ChevronRight className="ml-2" />
              </Button>
              <Button 
                data-testid="admin-login-btn"
                onClick={() => navigate('/login')} 
                size="lg" 
                variant="outline"
                className="border-2 border-emerald-700 text-emerald-700 hover:bg-emerald-50 px-8 py-6 text-lg rounded-full"
              >
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <MapPin className="w-8 h-8 text-emerald-700" />
              </div>
              <h3 className="text-3xl font-bold text-emerald-900 mb-2">5</h3>
              <p className="text-emerald-600">Premier Reserves</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-emerald-700" />
              </div>
              <h3 className="text-3xl font-bold text-emerald-900 mb-2">200+</h3>
              <p className="text-emerald-600">Team Members</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <Briefcase className="w-8 h-8 text-emerald-700" />
              </div>
              <h3 className="text-3xl font-bold text-emerald-900 mb-2">15+</h3>
              <p className="text-emerald-600">Open Positions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reserves Section */}
      <div className="py-20 bg-gradient-to-b from-white to-emerald-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-emerald-900 mb-12" style={{ fontFamily: 'Playfair Display, serif' }}>
            Our Reserves
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {reserves.map((reserve, index) => (
              <Card key={index} className="p-6 hover:shadow-xl transition-all duration-300 border-emerald-200 bg-white" data-testid={`reserve-card-${index}`}>
                <h3 className="text-xl font-bold text-emerald-800 mb-3">{reserve.name}</h3>
                <p className="text-emerald-600 text-sm">{reserve.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-emerald-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join our mission to protect and preserve wildlife for future generations
          </p>
          <Button 
            data-testid="explore-careers-btn"
            onClick={() => navigate('/jobs')} 
            size="lg" 
            className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-6 text-lg rounded-full shadow-lg"
          >
            Explore Careers
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;