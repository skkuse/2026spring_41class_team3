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
    // 에러 메시지 텍스트 상태 관리
    const [errorMessage, setErrorMessage] = useState<string>('');

    // [새 프로젝트 생성] 버튼 -> 대시보드로 이동
    const handleCreateProject = () => {
        navigate('/dashboard');
    };

    // [프로젝트 코드로 참여] 버튼 -> 모달 팝업 오픈
    const handleOpenJoinModal = () => {
        setErrorMessage(''); // 열 때 에러 메시지 초기화
        setProjectCode('');   // 입력창 초기화
        setIsModalOpen(true);
    };

    // 모달 내 폼 제출 처리
    const handleJoinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!projectCode) {
            setErrorMessage('프로젝트 코드를 입력해 주세요.');
            return;
        }

        if (projectCode.length !== 10) {
            setErrorMessage('코드는 정확히 10자리 숫자여야 합니다.');
            return;
        }
        
        setErrorMessage('');
        console.log(`입장 프로젝트 코드: ${projectCode}`);
        setIsModalOpen(false);
        navigate('/dashboard');
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 필터링
        setProjectCode(value);
        
        if (value.length === 10) {
            setErrorMessage('');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 box-border font-sans relative">
          
            {/* ================= HEADER AREA ================= */}
            <header className="text-center mb-10">
                <h1 className="text-6xl font-extrabold tracking-wider m-0 bg-gradient-to-r from-[#FF8A65] to-primary bg-clip-text text-transparent font-['Rajdhani'] uppercase">
                    MARS
                </h1>
                <p className="text-muted-foreground/80 text-sm mt-3 tracking-wide">
                    Minutes to Action & Review System
                </p>
            </header>
            
            {/* ================= MAIN CONTENT AREA ================= */}
            <main className="max-w-[1000px] w-full text-center">
                {/* 레퍼런스의 크고 신뢰감 있는 볼드 텍스트 느낌을 그대로 살렸습니다. */}
                <h2 className="text-5xl font-bold mb-5 tracking-tight text-foreground">
                    회의를 실행으로 전환하세요
                </h2>
                
                {/* 모던하고 군더더기 없는 한 줄 서브 카피 */}
                <p className="text-muted-foreground/80 text-base max-w-[800px] mx-auto mb-12 tracking-tight font-normal">
                    AI 기반 워크플로우 관리로 액션 아이템을 추출하고, 실행을 추적하며, 생산성을 향상시킵니다
                </p>
                
                {/* 메인 동작 버튼 영역 */}
                <div className="flex gap-4 justify-center mb-24 max-sm:flex-col max-sm:items-stretch max-sm:max-w-[300px] max-sm:mx-auto">
                    <button 
                        className="bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-md hover:opacity-90 transition-all transform hover:-translate-y-0.5 cursor-pointer text-sm" 
                        onClick={handleCreateProject}
                    >
                        새 프로젝트 생성
                    </button>
                    <button 
                        className="bg-secondary text-foreground border border-border font-semibold px-8 py-3.5 rounded-md hover:bg-neutral-800 transition-all transform hover:-translate-y-0.5 cursor-pointer text-sm" 
                        onClick={handleOpenJoinModal}
                    >
                        프로젝트 코드로 참여
                    </button>
                </div>
                
                {/* ================= FEATURE CARDS SECTION ================= */}
                {/* 레퍼런스 스타일의 차분한 테두리와 일관된 레이아웃을 반영했습니다. */}
                <div className="grid grid-cols-3 gap-6 w-full max-md:grid-cols-1">
                    
                    {/* 카드 1: 액션 아이템 추출 */}
                    <div className="bg-[#111318]/50 border border-border/70 rounded-xl p-8 text-center transition-all hover:border-primary/50">
                        <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center rounded-xl bg-[#1E1614] border border-[#3E241C]">
                            <Target className="w-5 h-5 text-primary" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-bold mb-3 text-foreground tracking-tight">액션 아이템 추출</h3>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed tracking-tight">
                            AI 기반 회의록에서 실행 가능한 작업 자동 추출
                        </p>
                    </div>
                    
                    {/* 카드 2: 실행 추적 */}
                    <div className="bg-[#111318]/50 border border-border/70 rounded-xl p-8 text-center transition-all hover:border-primary/50">
                        <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center rounded-xl bg-[#1E1614] border border-[#3E241C]">
                            <TrendingUp className="w-5 h-5 text-primary" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-bold mb-3 text-foreground tracking-tight">실행 추적</h3>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed tracking-tight">
                            실시간으로 진행 상황과 완료율 모니터링
                        </p>
                    </div>
                    
                    {/* 카드 3: 다음 회의 제안 */}
                    <div className="bg-[#111318]/50 border border-border/70 rounded-xl p-8 text-center transition-all hover:border-primary/50">
                        <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center rounded-xl bg-[#1E1614] border border-[#3E241C]">
                            <Zap className="w-5 h-5 text-primary" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-bold mb-3 text-foreground tracking-tight">다음 회의 제안</h3>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed tracking-tight">
                            생산성 향상을 위한 AI 기반 인사이트 제공
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

                        {/* 모달 헤더 */}
                        <div className="mb-5">
                            <h3 className="text-xl font-bold tracking-tight text-foreground">기존 프로젝트 참여</h3>
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
                                    className="flex-1 bg-secondary text-foreground border border-border text-sm font-semibold py-2.5 rounded-lg hover:bg-neutral-800 transition-all cursor-pointer"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    취소
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 bg-primary text-primary-foreground text-sm font-semibold py-2.5 rounded-lg hover:opacity-90 transition-all cursor-pointer"
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