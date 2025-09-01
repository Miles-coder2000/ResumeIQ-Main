import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => ([
    { title: 'Resumind | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading])

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);

            if(!resume) return;

            const data = JSON.parse(resume);

            const resumeBlob = await fs.read(data.resumePath);
            if(!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageBlob = await fs.read(data.imagePath);
            if(!imageBlob) return;
            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            setFeedback(data.feedback);
            console.log({resumeUrl, imageUrl, feedback: data.feedback });
        }

        loadResume();
    }, [id]);

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-col lg:flex-row w-full">
                {/* Resume Preview Section */}
                <section className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:w-1/2 px-4 py-6 lg:px-8 lg:py-8 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white lg:bg-[url('/images/bg-small.svg')] bg-cover">
                    {imageUrl && resumeUrl && (
                        <div className="w-full max-w-2xl mx-auto">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl opacity-75 group-hover:opacity-100 transition duration-200 blur-sm"></div>
                                <div className="relative bg-white rounded-xl shadow-xl overflow-hidden">
                                    <a 
                                        href={resumeUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block"
                                        aria-label="Open resume in new tab"
                                    >
                                        <img
                                            src={imageUrl}
                                            className="w-full h-auto object-contain rounded-xl border border-gray-200"
                                            alt="Resume preview"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition duration-200 opacity-0 group-hover:opacity-100">
                                            <span className="bg-white text-blue-600 font-medium px-4 py-2 rounded-full shadow-lg">
                                                View Full Size
                                            </span>
                                        </div>
                                    </a>
                                </div>
                            </div>
                            <div className="mt-4 text-center text-sm text-gray-500">
                                <p>Tap on the resume to view full size</p>
                                <p className="text-xs mt-1">(Opens in a new tab)</p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Feedback Section */}
                <section className="lg:w-1/2 px-4 py-6 lg:px-8 lg:py-12 bg-white lg:overflow-y-auto lg:h-screen">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Resume Review</h2>
                        {feedback ? (
                            <div className="space-y-8 animate-in fade-in duration-1000">
                                <Summary feedback={feedback} />
                                <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                                <Details feedback={feedback} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <img 
                                    src="/images/resume-scan-2.gif" 
                                    className="w-full max-w-md" 
                                    alt="Analyzing resume..."
                                    loading="lazy"
                                />
                                <p className="mt-4 text-gray-600 text-center">Analyzing your resume. Please wait...</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    )
}
export default Resume
