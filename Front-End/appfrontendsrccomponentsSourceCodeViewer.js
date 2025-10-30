import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const SourceCodeViewer = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [sourceFiles, setSourceFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [copiedFile, setCopiedFile] = useState(null);

  useEffect(() => {
    fetchSourceCode();
  }, []);

  const fetchSourceCode = async () => {
    try {
      const response = await axios.get(`${API}/source-code`);
      setSourceFiles(response.data.source_files);
    } catch (error) {
      console.error('Error fetching source code:', error);
      toast.error('Failed to load source code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (content, fileName) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(fileName);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const getFileLanguage = (filePath) => {
    if (filePath.endsWith('.py')) return 'python';
    if (filePath.endsWith('.js')) return 'javascript';
    if (filePath.endsWith('.css')) return 'css';
    if (filePath.endsWith('.json')) return 'json';
    if (filePath.endsWith('.txt') || filePath.endsWith('.env')) return 'text';
    return 'text';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-emerald-600 text-lg">Loading source code...</p>
      </div>
    );
  }

  const backendFiles = Object.keys(sourceFiles).filter(f => f.includes('/backend/'));
  const frontendFiles = Object.keys(sourceFiles).filter(f => f.includes('/frontend/'));

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-emerald-700 text-white py-8">
        <div className="container mx-auto px-4">
          <Button 
            data-testid="back-admin-btn"
            onClick={() => navigate('/admin')} 
            variant="ghost" 
            className="text-white hover:bg-emerald-600 mb-4"
          >
            <ChevronLeft className="mr-2" /> Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
            Source Code Viewer
          </h1>
          <p className="text-emerald-100 mt-2">View all website source files</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="backend" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="backend" data-testid="backend-tab">Backend ({backendFiles.length})</TabsTrigger>
            <TabsTrigger value="frontend" data-testid="frontend-tab">Frontend ({frontendFiles.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="backend">
            <div className="space-y-6">
              {backendFiles.map(filePath => (
                <Card key={filePath} className="p-6 border-emerald-200 bg-white" data-testid={`code-card-${filePath}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-emerald-900">{filePath}</h3>
                    <Button
                      data-testid={`copy-btn-${filePath}`}
                      onClick={() => copyToClipboard(sourceFiles[filePath], filePath)}
                      variant="outline"
                      size="sm"
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    >
                      {copiedFile === filePath ? (
                        <><Check className="w-4 h-4 mr-2" /> Copied</>
                      ) : (
                        <><Copy className="w-4 h-4 mr-2" /> Copy</>
                      )}
                    </Button>
                  </div>
                  <pre className="overflow-x-auto bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <code>{sourceFiles[filePath]}</code>
                  </pre>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="frontend">
            <div className="space-y-6">
              {frontendFiles.map(filePath => (
                <Card key={filePath} className="p-6 border-emerald-200 bg-white" data-testid={`code-card-${filePath}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-emerald-900">{filePath}</h3>
                    <Button
                      data-testid={`copy-btn-${filePath}`}
                      onClick={() => copyToClipboard(sourceFiles[filePath], filePath)}
                      variant="outline"
                      size="sm"
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    >
                      {copiedFile === filePath ? (
                        <><Check className="w-4 h-4 mr-2" /> Copied</>
                      ) : (
                        <><Copy className="w-4 h-4 mr-2" /> Copy</>
                      )}
                    </Button>
                  </div>
                  <pre className="overflow-x-auto bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <code>{sourceFiles[filePath]}</code>
                  </pre>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SourceCodeViewer;