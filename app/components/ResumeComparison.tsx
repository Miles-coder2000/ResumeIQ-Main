import { useState, useEffect } from 'react';
import { usePuterStore } from '~/lib/puter';
import ScoreCircle from './ScoreCircle';

interface ComparisonData {
  resume1: Resume | null;
  resume2: Resume | null;
  improvements: {
    category: string;
    oldScore: number;
    newScore: number;
    change: number;
  }[];
}

const ResumeComparison = () => {
  const { kv, fs } = usePuterStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume1, setSelectedResume1] = useState<string>('');
  const [selectedResume2, setSelectedResume2] = useState<string>('');
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [resumeImages, setResumeImages] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadResumes = async () => {
      const resumeData = (await kv.list('resume:*', true)) as KVItem[];
      const parsedResumes = resumeData?.map(item => JSON.parse(item.value) as Resume) || [];
      setResumes(parsedResumes);

      // Load images for all resumes
      const images: { [key: string]: string } = {};
      for (const resume of parsedResumes) {
        try {
          const blob = await fs.read(resume.imagePath);
          if (blob) {
            images[resume.id] = URL.createObjectURL(blob);
          }
        } catch (error) {
          console.error(`Error loading image for resume ${resume.id}:`, error);
        }
      }
      setResumeImages(images);
    };

    loadResumes();
  }, [kv, fs]);

  const handleCompare = async () => {
    if (!selectedResume1 || !selectedResume2) return;

    setLoading(true);
    
    const resume1 = resumes.find(r => r.id === selectedResume1);
    const resume2 = resumes.find(r => r.id === selectedResume2);

    if (!resume1 || !resume2) {
      setLoading(false);
      return;
    }

    // Calculate improvements
    const improvements = [
      {
        category: 'Overall Score',
        oldScore: resume1.feedback?.overallScore || 0,
        newScore: resume2.feedback?.overallScore || 0,
        change: (resume2.feedback?.overallScore || 0) - (resume1.feedback?.overallScore || 0)
      },
      {
        category: 'ATS Score',
        oldScore: resume1.feedback?.ATS?.score || 0,
        newScore: resume2.feedback?.ATS?.score || 0,
        change: (resume2.feedback?.ATS?.score || 0) - (resume1.feedback?.ATS?.score || 0)
      },
      {
        category: 'Tone & Style',
        oldScore: resume1.feedback?.toneAndStyle?.score || 0,
        newScore: resume2.feedback?.toneAndStyle?.score || 0,
        change: (resume2.feedback?.toneAndStyle?.score || 0) - (resume1.feedback?.toneAndStyle?.score || 0)
      },
      {
        category: 'Content',
        oldScore: resume1.feedback?.content?.score || 0,
        newScore: resume2.feedback?.content?.score || 0,
        change: (resume2.feedback?.content?.score || 0) - (resume1.feedback?.content?.score || 0)
      },
      {
        category: 'Structure',
        oldScore: resume1.feedback?.structure?.score || 0,
        newScore: resume2.feedback?.structure?.score || 0,
        change: (resume2.feedback?.structure?.score || 0) - (resume1.feedback?.structure?.score || 0)
      },
      {
        category: 'Skills',
        oldScore: resume1.feedback?.skills?.score || 0,
        newScore: resume2.feedback?.skills?.score || 0,
        change: (resume2.feedback?.skills?.score || 0) - (resume1.feedback?.skills?.score || 0)
      }
    ];

    setComparison({
      resume1,
      resume2,
      improvements
    });

    setLoading(false);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return (
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    }
    if (change < 0) {
      return (
        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Resume Comparison</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              First Resume (Baseline)
            </label>
            <select
              value={selectedResume1}
              onChange={(e) => setSelectedResume1(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a resume...</option>
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.companyName || 'Resume'} {resume.jobTitle && `- ${resume.jobTitle}`} 
                  (Score: {resume.feedback?.overallScore || 0})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Second Resume (Comparison)
            </label>
            <select
              value={selectedResume2}
              onChange={(e) => setSelectedResume2(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a resume...</option>
              {resumes.filter(r => r.id !== selectedResume1).map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.companyName || 'Resume'} {resume.jobTitle && `- ${resume.jobTitle}`} 
                  (Score: {resume.feedback?.overallScore || 0})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={!selectedResume1 || !selectedResume2 || loading}
          className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
        >
          {loading ? 'Comparing...' : 'Compare Resumes'}
        </button>
      </div>

      {comparison && (
        <div className="space-y-8">
          {/* Resume Previews */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {comparison.resume1?.companyName || 'Resume 1'}
                </h3>
                <ScoreCircle score={comparison.resume1?.feedback?.overallScore || 0} />
              </div>
              {resumeImages[comparison.resume1?.id || ''] && (
                <div className="gradient-border">
                  <img
                    src={resumeImages[comparison.resume1?.id || '']}
                    alt="Resume 1 preview"
                    className="w-full h-64 object-cover object-top rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {comparison.resume2?.companyName || 'Resume 2'}
                </h3>
                <ScoreCircle score={comparison.resume2?.feedback?.overallScore || 0} />
              </div>
              {resumeImages[comparison.resume2?.id || ''] && (
                <div className="gradient-border">
                  <img
                    src={resumeImages[comparison.resume2?.id || '']}
                    alt="Resume 2 preview"
                    className="w-full h-64 object-cover object-top rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Comparison Results */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Score Comparison</h3>
            
            <div className="space-y-4">
              {comparison.improvements.map((improvement, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {improvement.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600 dark:text-gray-400">
                      {improvement.oldScore} → {improvement.newScore}
                    </span>
                    
                    <div className={`flex items-center space-x-1 ${getChangeColor(improvement.change)}`}>
                      {getChangeIcon(improvement.change)}
                      <span className="font-medium">
                        {improvement.change > 0 ? '+' : ''}{improvement.change}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Summary</h4>
              <p className="text-blue-800 dark:text-blue-200">
                {comparison.improvements[0].change > 0 
                  ? `Great improvement! Your overall score increased by ${comparison.improvements[0].change} points.`
                  : comparison.improvements[0].change < 0
                  ? `Your overall score decreased by ${Math.abs(comparison.improvements[0].change)} points. Consider reviewing the feedback.`
                  : 'No change in overall score. Both resumes perform similarly.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeComparison;