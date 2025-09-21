import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, FileText, Target, Award, Users, Calendar } from 'lucide-react';
import { usePuterStore } from '~/lib/puter';

interface DashboardStats {
  totalResumes: number;
  averageScore: number;
  improvementRate: number;
  lastAnalyzed: string;
}

interface SkillData {
  name: string;
  count: number;
  color: string;
}

interface ScoreHistory {
  date: string;
  score: number;
}

const Dashboard = () => {
  const { kv } = usePuterStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalResumes: 0,
    averageScore: 0,
    improvementRate: 0,
    lastAnalyzed: 'Never'
  });
  const [skillsData, setSkillsData] = useState<SkillData[]>([]);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const resumeData = (await kv.list('resume:*', true)) as KVItem[];
      const parsedResumes = resumeData?.map((resume) => JSON.parse(resume.value) as Resume) || [];
      
      setResumes(parsedResumes);
      
      // Calculate stats
      const totalResumes = parsedResumes.length;
      const averageScore = totalResumes > 0 
        ? Math.round(parsedResumes.reduce((sum, resume) => sum + resume.feedback.overallScore, 0) / totalResumes)
        : 0;
      
      // Calculate improvement rate (comparing first and last resume)
      const improvementRate = totalResumes > 1 
        ? parsedResumes[parsedResumes.length - 1].feedback.overallScore - parsedResumes[0].feedback.overallScore
        : 0;

      const lastAnalyzed = totalResumes > 0 
        ? new Date().toLocaleDateString()
        : 'Never';

      setStats({
        totalResumes,
        averageScore,
        improvementRate,
        lastAnalyzed
      });

      // Generate skills data (mock data for now)
      const mockSkillsData: SkillData[] = [
        { name: 'JavaScript', count: 8, color: '#8884d8' },
        { name: 'React', count: 6, color: '#82ca9d' },
        { name: 'Python', count: 4, color: '#ffc658' },
        { name: 'Node.js', count: 5, color: '#ff7300' },
        { name: 'SQL', count: 3, color: '#00ff88' }
      ];
      setSkillsData(mockSkillsData);

      // Generate score history
      const mockScoreHistory: ScoreHistory[] = parsedResumes.map((resume, index) => ({
        date: `Resume ${index + 1}`,
        score: resume.feedback.overallScore
      }));
      setScoreHistory(mockScoreHistory);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${
          trend === 'up' ? 'bg-green-100 dark:bg-green-900' :
          trend === 'down' ? 'bg-red-100 dark:bg-red-900' :
          'bg-blue-100 dark:bg-blue-900'
        }`}>
          <Icon className={`w-6 h-6 ${
            trend === 'up' ? 'text-green-600 dark:text-green-400' :
            trend === 'down' ? 'text-red-600 dark:text-red-400' :
            'text-blue-600 dark:text-blue-400'
          }`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileText}
          title="Total Resumes"
          value={stats.totalResumes}
          subtitle="Analyzed resumes"
          trend="neutral"
        />
        <StatCard
          icon={Target}
          title="Average Score"
          value={`${stats.averageScore}/100`}
          subtitle="Overall performance"
          trend={stats.averageScore > 70 ? 'up' : stats.averageScore > 50 ? 'neutral' : 'down'}
        />
        <StatCard
          icon={TrendingUp}
          title="Improvement"
          value={stats.improvementRate > 0 ? `+${stats.improvementRate}` : stats.improvementRate}
          subtitle="Points gained"
          trend={stats.improvementRate > 0 ? 'up' : stats.improvementRate < 0 ? 'down' : 'neutral'}
        />
        <StatCard
          icon={Calendar}
          title="Last Analysis"
          value={stats.lastAnalyzed}
          subtitle="Most recent"
          trend="neutral"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score History Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Score Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scoreHistory}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" className="text-sm" />
              <YAxis domain={[0, 100]} className="text-sm" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#8884d8" 
                strokeWidth={3}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Skills Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={skillsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {skillsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Scores Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={resumes.length > 0 ? [{
            name: 'Latest Resume',
            'Tone & Style': resumes[resumes.length - 1]?.feedback.toneAndStyle.score || 0,
            'Content': resumes[resumes.length - 1]?.feedback.content.score || 0,
            'Structure': resumes[resumes.length - 1]?.feedback.structure.score || 0,
            'Skills': resumes[resumes.length - 1]?.feedback.skills.score || 0,
            'ATS': resumes[resumes.length - 1]?.feedback.ATS.score || 0
          }] : []}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="Tone & Style" fill="#8884d8" />
            <Bar dataKey="Content" fill="#82ca9d" />
            <Bar dataKey="Structure" fill="#ffc658" />
            <Bar dataKey="Skills" fill="#ff7300" />
            <Bar dataKey="ATS" fill="#00ff88" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;