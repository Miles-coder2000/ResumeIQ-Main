import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter';
import Navbar from '~/components/Navbar';
import ResumeComparison from '~/components/ResumeComparison';

export const meta = () => ([
    { title: 'ResumeIQ | Resume Comparison' },
    { name: 'description', content: 'Compare your resumes to track improvements' },
]);

const ComparisonPage = () => {
    const { auth, isLoading } = usePuterStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate('/auth?next=/comparison');
        }
    }, [isLoading, auth.isAuthenticated, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!auth.isAuthenticated) {
        return null;
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
            <Navbar />
            <section className="main-section">
                <div className="w-full max-w-6xl mx-auto">
                    <div className="page-heading py-16">
                        <h1>Resume Comparison</h1>
                        <h2>Compare different versions of your resume to track improvements</h2>
                    </div>
                    <ResumeComparison />
                </div>
            </section>
        </main>
    );
};

export default ComparisonPage;