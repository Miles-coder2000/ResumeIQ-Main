import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter';
import Navbar from '~/components/Navbar';
import AIChat from '~/components/AIChat';

export const meta = () => ([
    { title: 'ResumeIQ | AI Assistant' },
    { name: 'description', content: 'Get personalized career and resume advice from our AI assistant' },
]);

const ChatPage = () => {
    const { auth, isLoading } = usePuterStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate('/auth?next=/chat');
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
                <div className="w-full max-w-4xl mx-auto">
                    <div className="page-heading py-16">
                        <h1>AI Career Assistant</h1>
                        <h2>Get personalized advice for your resume and career development</h2>
                    </div>
                    <AIChat />
                </div>
            </section>
        </main>
    );
};

export default ChatPage;