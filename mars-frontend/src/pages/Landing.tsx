import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, PlusCircle, FolderPlus, ArrowLeft, Copy, Check } from 'lucide-react';

type ViewMode = 'landing' | 'create_project';

interface MockProjectData {
    userId: string;
    projectId: string;
    projectCode: string;
    title: string; 
    role: 'admin';
}

const Landing: React.FC = () => {
    const navigate = useNavigate();
    
    const [viewMode, setViewMode] = useState<ViewMode>('landing');
    const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const [userId, setUserId] = useState<string>('');
    const [projectCode, setProjectCode] = useState<string>('');
    const [creatorId, setCreatorId] = useState<string>('');
    const [newProjectName, setNewProjectName] = useState<string>('');
    
    // 경고 및 에러 메시지 
    const [idWarning, setIdWarning] = useState<string>(''); 
    const [creatorIdWarning, setCreatorIdWarning] = useState<string>(''); 
    const [errorMessage, setErrorMessage] = useState<string>('');

    const [successCode, setSuccessCode] = useState<string>('');
    const [pendingNavigateData, setPendingNavigateData] = useState<MockProjectData | null>(null);

    
    // 유저 ID 입력 제한 (영문, 숫자만 가능하도록 예시 가이드 반영)
    const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUserId(value);
        if (value.length > 0 && value.length < 3) {
            setIdWarning('최소 3글자 이상 입력해 주세요.');
        } else {
            setIdWarning('');
        }
    };

    // 생성하기 관리자 ID 입력 제한
    const handleCreatorIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCreatorId(value);
        if (value.length > 0 && value.length < 3) {
            setCreatorIdWarning('최소 3글자 이상 입력해 주세요.');
        } else {
            setCreatorIdWarning('');
        }
    };

    // 프로젝트 참여 코드 입력 제한 (숫자만 입력 가능)
    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자 제외 문자 제거
        setProjectCode(value);
    };

    // 모달 팝업 오픈
    const handleOpenJoinModal = () => {
        setErrorMessage(''); 
        setProjectCode('');   
        setUserId('');
        setIdWarning('');
        setIsJoinModalOpen(true);
    };

    // 유저 ID와 회의 번호(프로젝트 코드) 통합 검증 후 입장
    const handleJoinSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (idWarning) return; 

        if (!userId || userId.length < 3) {
            setErrorMessage('사용자 ID는 최소 3글자 이상이어야 합니다.');
            return;
        }

        if (projectCode.length !== 10) {
            setErrorMessage('코드는 정확히 10자리 숫자여야 합니다.');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        
        // 가상 연동 데이터 생성 후 이동
        setTimeout(() => {
            setIsLoading(false);
            setIsJoinModalOpen(false);
            navigate('/dashboard', {
                state: {
                    userId: userId,
                    projectCode: projectCode,
                    title: '참여한 협업 프로젝트'
                }
            });
        }, 800);
    };

    // 새 프로젝트 생성 API 제출 핸들러 
    const handleCreateProjectSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (creatorIdWarning) return; 

        if (!creatorId || creatorId.length < 3) {
            setErrorMessage('생성자 ID는 최소 3글자 이상이어야 합니다.');
            return;
        }
        if (!newProjectName.trim()) {
            setErrorMessage('프로젝트 이름을 입력해 주세요.');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        const projectCreateBody = {
            title: newProjectName,
            creator_id: creatorId
        };

        setTimeout(() => {
            setIsLoading(false);
            console.log("POST /projects/ 호출 성공:", projectCreateBody);
            
            const mockProjectId = "7b9e847c-1234-4567-89ab-cdef12345678"; 
            const mockGeneratedCode = "1234567890";

            setSuccessCode(mockGeneratedCode);
            setIsCopied(false);

            setPendingNavigateData({
                userId: creatorId,
                projectId: mockProjectId,
                projectCode: mockGeneratedCode,
                title: newProjectName, 
                role: 'admin'
            });
            
            setIsSuccessModalOpen(true);
        }, 1000);
    };

    // 커스텀 성공 팝업에서 복사 버튼을 눌렀을 때 실행되는 함수
    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(successCode);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); 
        } catch (err) {
            console.error('코드 복사에 실패했습니다.', err);
        }
    };

    // 성공 팝업을 확인하고 대시보드로 이동하는 함수
    const handleCloseSuccessAndNavigate = () => {
        setIsSuccessModalOpen(false);
        if (pendingNavigateData) {
            navigate('/dashboard', { state: pendingNavigateData });
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 box-border font-sans relative">
            
            {viewMode === 'landing' && (
                <>
                    <header className="text-center mb-10">
                        <h1 className="text-6xl font-extrabold tracking-wider m-0 bg-gradient-to-r from-[#FF8A65] to-primary bg-clip-text text-transparent font-['Rajdhani'] uppercase">MARS</h1>
                        <p className="text-muted-foreground/80 text-sm mt-3 tracking-wide">Minutes to Action & Review System</p>
                    </header>
                    
                    <main className="max-w-[1000px] w-full text-center">
                        <h2 className="text-5xl font-bold mb-5 tracking-tight text-foreground">회의를 실행으로 전환하세요</h2>
                        <p className="text-muted-foreground/80 text-base max-w-[800px] mx-auto mb-12 tracking-tight font-normal">
                            AI 기반 워크플로우 관리로 액션 아이템을 추출하고, 실행을 추적하며, 생산성을 향상시킵니다
                        </p>
                        <div className="flex gap-4 justify-center mb-24">
                            <button 
                                type="button"
                                className="bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-md hover:opacity-90 text-sm cursor-pointer flex items-center gap-2 transition-all" 
                                onClick={() => { setViewMode('create_project'); setErrorMessage(''); setCreatorIdWarning(''); setCreatorId(''); setNewProjectName(''); }}
                            >
                                <PlusCircle className="w-4 h-4" />
                                새 프로젝트 생성
                            </button>
                            <button 
                                type="button"
                                className="bg-secondary text-foreground border border-border font-semibold px-8 py-3.5 rounded-md hover:bg-neutral-800 text-sm cursor-pointer" 
                                onClick={handleOpenJoinModal}
                            >
                                프로젝트 코드로 참여
                            </button>
                        </div>
                    </main>

                    {/* 프로젝트 참여 모달*/}
                    {isJoinModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="bg-card border border-border w-full max-w-[440px] p-6 rounded-xl shadow-2xl relative animate-fade-in">
                                
                                <button 
                                    type="button"
                                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-md hover:bg-muted transition-all"
                                    onClick={() => setIsJoinModalOpen(false)}
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <form onSubmit={handleJoinSubmit} className="space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight text-foreground">프로젝트 참여하기</h3>
                                        <p className="text-xs text-muted-foreground mt-1">본인의 고유 ID와 공유받은 10자리 코드를 함께 입력하세요.</p>
                                    </div>

                                    {/* 유저 ID 입력란 */}
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-xs font-semibold text-muted-foreground ml-1">사용자 식별 ID</label>
                                        <input 
                                            type="text"
                                            placeholder="User ID (영문/숫자, 최소 3자)"
                                            value={userId}
                                            onChange={handleIdChange}
                                            autoComplete="off"          
                                            spellCheck={false}          
                                            className={`w-full bg-[#161920] border text-foreground px-4 py-2.5 rounded-lg text-base focus:outline-none transition-all ${idWarning ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'}`}
                                            autoFocus
                                        />
                                        {idWarning && <p className="text-destructive text-xs font-medium pl-1 mt-1">{idWarning}</p>}
                                    </div>

                                    {/* 프로젝트 코드 입력란 */}
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-xs font-semibold text-muted-foreground ml-1">회의 코드 (10자리 숫자)</label>
                                        <input 
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={10}
                                            placeholder="0000000000"
                                            value={projectCode}
                                            onChange={handleCodeChange}
                                            className="w-full bg-[#161920] border border-border text-foreground px-4 py-2.5 rounded-lg text-lg focus:outline-none focus:border-primary tracking-[0.15em] font-mono text-center transition-all"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="h-5 text-left">
                                        {errorMessage && <p className="text-destructive text-xs font-medium pl-1">{errorMessage}</p>}
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={isLoading || userId.length < 3 || projectCode.length !== 10 || !!idWarning}
                                        className="w-full bg-primary text-primary-foreground text-sm font-semibold py-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {isLoading ? '프로젝트 조회 및 입장 중...' : '프로젝트 입장'}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ---------------- 새 프로젝트 생성 입력 창 ---------------- */}
            {viewMode === 'create_project' && (
                <div className="w-full max-w-[560px] bg-card border border-border rounded-xl p-8 shadow-2xl animate-fade-in text-left">
                    <button 
                        type="button" 
                        onClick={() => { setViewMode('landing'); setErrorMessage(''); }}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 cursor-pointer group transition-all"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        메인으로 돌아가기
                    </button>

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <FolderPlus className="w-6 h-6 text-primary" />
                            새로운 프로젝트 개설
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            회의 및 대시보드를 관리할 프로젝트 정보를 기입해 주세요. 생성자는 자동으로 관리자 권한을 부여받습니다.
                        </p>
                    </div>

                    <form onSubmit={handleCreateProjectSubmit} className="space-y-5">
                        {/* 생성자 식별 ID */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">생성자 관리자 ID</label>
                            <input 
                                type="text"
                                placeholder="관리자 ID를 정의해 주세요 (영문/숫자, 최소 3자)"
                                value={creatorId}
                                onChange={handleCreatorIdChange}
                                autoComplete="off"
                                spellCheck={false}
                                className={`w-full bg-[#161920] border text-foreground px-4 py-3 rounded-lg text-base focus:outline-none transition-all ${creatorIdWarning ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'}`}
                                required
                            />
                            {creatorIdWarning && <p className="text-destructive text-xs font-medium pl-1 mt-1">{creatorIdWarning}</p>}
                        </div>

                        {/* 프로젝트 이름 */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">프로젝트 명칭</label>
                            <input 
                                type="text"
                                placeholder="예시) MARS 프론트엔드 개발 스쿼드"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                className="w-full bg-[#161920] border border-border text-foreground px-4 py-3 rounded-lg text-base focus:outline-none focus:border-primary transition-all"
                                required
                            />
                        </div>

                        {/* 에러 노출 구역 */}
                        <div className="min-h-5">
                            {errorMessage && <p className="text-destructive text-sm font-medium pl-1">{errorMessage}</p>}
                        </div>

                        {/* 버튼 그룹 */}
                        <div className="flex gap-3 pt-2">
                            <button 
                                type="button"
                                onClick={() => setViewMode('landing')}
                                className="flex-1 bg-secondary text-foreground border border-border text-sm font-semibold py-3.5 rounded-lg hover:bg-neutral-800 transition-all cursor-pointer text-center"
                                disabled={isLoading}
                            >
                                취소
                            </button>
                            <button 
                                type="submit"
                                disabled={isLoading || !newProjectName.trim() || creatorId.length < 3 || !!creatorIdWarning}
                                className="flex-1 bg-primary text-primary-foreground text-sm font-semibold py-3.5 rounded-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                            >
                                {isLoading ? '프로젝트 생성 중...' : '프로젝트 생성 및 입장'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ---------------- 프로젝트 생성 성공 커스텀 모달 ---------------- */}
            {isSuccessModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
                    <div className="bg-card border border-border w-full max-w-[460px] p-7 rounded-xl shadow-2xl text-center relative animate-fade-in border-t-4 border-t-primary">
                        
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FolderPlus className="w-6 h-6 text-primary" />
                        </div>

                        <h3 className="text-2xl font-bold tracking-tight text-foreground mb-1">프로젝트 생성 완료!</h3>
                        <p className="text-sm text-muted-foreground mb-6">팀원들이 참여할 수 있도록 아래 코드를 공유해 주세요.</p>

                        {/* 코드 표시 및 복사 레이아웃 */}
                        <div className="bg-[#161920] border border-border rounded-lg p-4 flex items-center justify-between mb-6 group">
                            <span className="text-2xl font-mono font-bold tracking-[0.2em] text-primary pl-2">
                                {successCode}
                            </span>
                            <button
                                type="button"
                                onClick={handleCopyCode}
                                className="bg-secondary hover:bg-neutral-800 text-foreground border border-border p-2.5 rounded-md cursor-pointer transition-all flex items-center gap-1.5 text-xs font-semibold"
                            >
                                {isCopied ? (
                                    <>
                                        <Check className="w-4 h-4 text-emerald-500" />
                                        <span className="text-emerald-500">복사됨</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 text-muted-foreground" />
                                        <span>코드 복사</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* 대시보드로 이동 버튼 */}
                        <button
                            type="button"
                            onClick={handleCloseSuccessAndNavigate}
                            className="w-full bg-primary text-primary-foreground text-sm font-semibold py-3.5 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            대시보드로 입장하기
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Landing;