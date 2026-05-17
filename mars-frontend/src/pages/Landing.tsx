import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, Zap, X } from 'lucide-react';

const Landing: React.FC = () => {
    const navigate = useNavigate();
    
    // 팝업창(모달) 오픈 상태 관리
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    // 10자리 숫자 프로젝트 코드 저장 상태
    const [projectCode, setProjectCode] = useState<string>('');
    // [신규] 에러 메시지 텍스트 상태 관리
    const [errorMessage, setErrorMessage] = useState<string>('');

    // [Create New Project] 버튼: 바로 대시보드로 이동
    const handleCreateProject = () => {
        console.log('[Landing][API] 프로젝트 생성 버튼 클릭');
        navigate('/dashboard');
    };

    // [Join with Project Code] 버튼: 모달 팝업 오픈
    const handleOpenJoinModal = () => {
        console.log('[Landing] 프로젝트 코드 입장 모달 열기');
        setErrorMessage(''); // 열 때 에러 메시지 초기화
        setProjectCode('');   // 입력창 초기화
        setIsModalOpen(true);
    };

    // 모달 내 폼 제출 처리
    const handleJoinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // 1. 아예 입력을 안 했을 때
        if (!projectCode) {
            setErrorMessage('프로젝트 코드를 입력해 주세요.');
            return;
        }

        // 2. 10자리가 안 될 때
        if (projectCode.length !== 10) {
            setErrorMessage('코드는 정확히 10자리 숫자여야 합니다.');
            return;
        }
        
        // 검증 통과 시 대시보드로 이동
        setErrorMessage('');
        console.log('[Landing][API] 프로젝트 코드로 입장 요청', {
            projectCode,
        });
        setIsModalOpen(false);
        navigate('/dashboard');
    };

    // 사용자가 글자를 타이핑할 때 호출되는 함수
    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 필터링
        setProjectCode(value);
        
        // 사용자가 다시 타이핑하기 시작하면 아래 에러 메시지를 자연스럽게 지워줌
        if (value.length === 10) {
            setErrorMessage('');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 box-border font-sans relative">
          
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
                
                {/* 상단 액션 버튼 그룹 */}
                <div className="flex gap-4 justify-center mb-20 max-sm:flex-col max-sm:items-stretch max-sm:max-w-[300px] max-sm:mx-auto">
                    <button 
                        className="bg-primary text-primary-foreground font-semibold px-7 py-3 rounded-md hover:opacity-90 transition-all transform hover:-translate-y-0.5 cursor-pointer" 
                        onClick={handleCreateProject}
                    >
                        Create New Project
                    </button>
                    <button 
                        className="bg-secondary text-foreground border border-border font-semibold px-7 py-3 rounded-md hover:bg-neutral-800 transition-all transform hover:-translate-y-0.5 cursor-pointer" 
                        onClick={handleOpenJoinModal}
                    >
                        Join with Project Code
                    </button>
                </div>
                
                {/* 서비스 주요 특장점 그리드 카드 */}
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

            {/* ================= 프로젝트 코드 입력 팝업창 (Modal) ================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-border w-full max-w-[420px] p-6 rounded-xl shadow-2xl relative">
                        
                        {/* 닫기 버튼 */}
                        <button 
                            type="button"
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-md hover:bg-muted transition-all"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* 모달 헤더 헤딩 */}
                        <div className="mb-5">
                            <h3 className="text-xl font-bold font-['Rajdhani'] tracking-wide text-foreground">Join Existing Project</h3>
                            <p className="text-xs text-muted-foreground mt-1">공유받은 10자리 숫자 코드를 입력해 주세요.</p>
                        </div>

                        {/* 폼 및 인풋 필드 */}
                        <form onSubmit={handleJoinSubmit} className="space-y-4">
                            <div>
                                <input 
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={10}
                                    placeholder="0000000000"
                                    value={projectCode}
                                    onChange={handleCodeChange}
                                    className={`w-full bg-[#161920] border text-foreground px-4 py-3 rounded-lg text-lg focus:outline-none tracking-[0.2em] font-mono text-center transition-all ${
                                        errorMessage 
                                        ? 'border-destructive/80 focus:border-destructive' 
                                        : 'border-border focus:border-primary'
                                    }`}
                                    autoFocus
                                />
                                
                                <div className="h-5 mt-1.5 text-left">
                                    {errorMessage && (
                                        <p className="text-destructive text-xs font-medium flex items-center gap-1 pl-1">
                                            {errorMessage}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {/* 바텀 제어 버튼 */}
                            <div className="flex gap-3 pt-1">
                                <button 
                                    type="button"
                                    className="flex-1 bg-secondary text-foreground border border-border text-sm font-semibold py-2.5 rounded-lg hover:bg-neutral-800 cursor-pointer transition-all"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    취소
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 bg-primary text-primary-foreground text-sm font-semibold py-2.5 rounded-lg hover:opacity-90 cursor-pointer transition-all"
                                >
                                    프로젝트 입장
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

        </div>
    );
};

export default Landing;
