import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, Zap } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-height-screen bg-background text-foreground flex flex-col items-center justify-center p-8 box-border font-sans">
            <header className="text-center mb-12">
                <h1 className="text-6xl font-extrabold tracking-wider m-0 bg-gradient-to-r from-[#FF8A65] to-primary bg-clip-text text-transparent font-['Rajdhani']">
                    MARS
                </h1>
                <p className="text-muted-foreground text-lg mt-2">
                    Minutes to Action & Review System
                </p>
            </header>
            
            <main className="max-w-[900px] w-full text-center">
                <h2 className="text-4xl font-bold mb-4 font-['Rajdhani']">Turn Meetings into Action</h2>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-[600px] mx-auto mb-10">
                    Extract action items, track execution, and improve productivity with AI-powered workflow management
                </p>
                
                <div className="flex gap-4 justify-center mb-20 max-sm:flex-col max-sm:items-stretch max-sm:max-w-[300px] max-sm:mx-auto">
                    <button className="bg-primary text-primary-foreground font-semibold px-7 py-3 rounded-md hover:opacity-90 transition-all transform hover:-translate-y-0.5 cursor-pointer" onClick={handleStart}>
                        Create New Project
                    </button>
                    <button className="bg-secondary text-foreground border border-border font-semibold px-7 py-3 rounded-md hover:bg-neutral-800 transition-all transform hover:-translate-y-0.5 cursor-pointer" onClick={handleStart}>
                        Join with Project Code
                    </button>
                </div>
                
                <div className="grid grid-cols-3 gap-6 w-full max-md:grid-cols-1">
                    {/* 카드 1 */}
                    <div className="bg-card border border-border rounded-lg p-8 text-center transition-all hover:border-primary hover:-translate-y-1">
                        <div className="w-11 h-11 mx-auto mb-5 flex items-center justify-center rounded-md bg-[#1F1D1C] border border-[#3A2A24]">
                            <Target className="w-6 h-6 text-primary" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-foreground font-['Rajdhani']">Action Item Extraction</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            AI-powered extraction of actionable tasks from meeting notes
                        </p>
                    </div>
                    
                    {/* 카드 2 */}
                    <div className="bg-card border border-border rounded-lg p-8 text-center transition-all hover:border-primary hover:-translate-y-1">
                        <div className="w-11 h-11 mx-auto mb-5 flex items-center justify-center rounded-md bg-[#1F1D1C] border border-[#3A2A24]">
                            <TrendingUp className="w-6 h-6 text-primary" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-foreground font-['Rajdhani']">Execution Tracking</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Monitor progress and completion rates in real-time
                        </p>
                    </div>
                    
                    {/* 카드 3 */}
                    <div className="bg-card border border-border rounded-lg p-8 text-center transition-all hover:border-primary hover:-translate-y-1">
                        <div className="w-11 h-11 mx-auto mb-5 flex items-center justify-center rounded-md bg-[#1F1D1C] border border-[#3A2A24]">
                            <Zap className="w-6 h-6 text-primary" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-foreground font-['Rajdhani']">Next Meeting Suggestions</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Get intelligent recommendations for improving productivity
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Landing;