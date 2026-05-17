import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, Target } from 'lucide-react';

interface Meeting {
    id: number;
    title: string;
    date: string;
    items: number;
    done: number;
    pct: string;
}

const DashBoard: React.FC = () => {
    const navigate = useNavigate();

    // 임시 미팅 데이터 목록
    const meetings: Meeting[] = [
        { id: 1, title: 'Q2 프로젝트 기획 회의', date: '2026-04-12', items: 8, done: 5, pct: '62.5%' },
        { id: 2, title: '제품 로드맵 검토', date: '2026-04-10', items: 12, done: 9, pct: '75%' },
        { id: 3, title: '팀 주간 미팅', date: '2026-04-08', items: 6, done: 6, pct: '100%' },
        { id: 4, title: '고객 피드백 세션', date: '2026-04-05', items: 15, done: 12, pct: '80%' },
    ];

    return (
        <main className="flex-1 p-10 bg-background text-foreground overflow-y-auto w-full max-w-[1200px] font-sans">
            
            {/* ================= HEADER AREA ================= */}
            <header className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-3xl font-bold font-['Rajdhani'] tracking-tight text-foreground">프로젝트 이름</h2>
                    <p className="text-sm text-muted-foreground mt-1">프로젝트 개요 및 데이터 분석</p>
                </div>
                
                {/* Start New Meeting 버튼 -> meeting */}
                <button 
                    className="bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm hover:opacity-90 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                    onClick={() => navigate('/meeting/new')}
                >
                    + 새 회의 시작
                </button>
            </header>

            {/* ================= STATS CARDS AREA ================= */}
            <section className="grid grid-cols-3 gap-5 mb-8 max-md:grid-cols-1">
                
                {/* 총 액션 아이템 카드 클릭 -> /action 경로로 이동 */}
                <div 
                    className="bg-card border border-border rounded-xl p-6 relative flex flex-col justify-between min-h-[140px] cursor-pointer hover:border-primary/50 transition-all group"
                    onClick={() => navigate('/actions')}
                >
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 rounded-lg bg-[#2E2522] border border-[#44322B] group-hover:bg-primary/20 transition-all">
                            <Clock className="w-5 h-5 text-primary" strokeWidth={1.5} />
                        </div>
                        <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">이번 주 +12개</span>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-all">47</h3>
                        <p className="text-xs text-muted-foreground mt-1">총 액션 아이템</p>
                    </div>
                </div>

                {/* 완료된 태스크 카드 클릭 -> /action 경로로 이동 */}
                <div 
                    className="bg-card border border-border rounded-xl p-6 relative flex flex-col justify-between min-h-[140px] cursor-pointer hover:border-emerald-500/50 transition-all group"
                    onClick={() => navigate('/actions')}
                >
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 rounded-lg bg-[#222E28] border border-[#2B4436] group-hover:bg-emerald-500/20 transition-all">
                            <CheckCircle className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">달성률 68%</span>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-bold tracking-tight text-foreground group-hover:text-emerald-500 transition-all">32</h3>
                        <p className="text-xs text-muted-foreground mt-1">완료된 태스크</p>
                    </div>
                </div>

                {/* 진행률 카드 클릭 -> /suggestions 경로로 이동 */}
                <div 
                    className="bg-card border border-border rounded-xl p-6 relative flex flex-col justify-between min-h-[140px] cursor-pointer hover:border-primary/50 transition-all group"
                    onClick={() => navigate('/suggestions')}
                >
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 rounded-lg bg-[#2E2522] border border-[#44322B] group-hover:bg-primary/20 transition-all">
                            <Target className="w-5 h-5 text-primary" strokeWidth={1.5} />
                        </div>
                        <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">지난주 대비 +5%</span>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-all">68%</h3>
                        <p className="text-xs text-muted-foreground mt-1">전체 진행률</p>
                    </div>
                </div>

            </section>

            {/* ================= RECENT MEETINGS AREA ================= */}
            <section className="bg-card border border-border rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold font-['Rajdhani'] text-foreground">최근 회의 목록</h3>
                    
                    <button 
                        className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                        onClick={() => navigate('/meeting/new')}
                    >
                        전체 보기
                    </button>
                </div>
                
                {/* 회의 목록 리스트 */}
                <div className="space-y-3">
                    {meetings.map((meeting) => (
                        <div 
                            key={meeting.id} 
                            className="flex items-center justify-between p-4 rounded-xl bg-[#1A1D23]/40 border border-border/60 hover:border-primary/40 cursor-pointer transition-all group"
                            onClick={() => navigate('/meeting/new')}
                        >
                            {/* 제목 및 날짜 */}
                            <div className="w-1/3">
                                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-all">{meeting.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{meeting.date}</p>
                            </div>
                            
                            {/* 수치 메트릭 (Items / Done) */}
                            <div className="flex items-center gap-6 text-center text-xs font-mono w-1/3 justify-center">
                                <div>
                                    <div className="text-foreground font-bold">{meeting.items}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase mt-0.5 font-sans">할 일</div>
                                </div>
                                <div>
                                    <div className="text-primary font-bold">{meeting.done}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase mt-0.5 font-sans">완료</div>
                                </div>
                            </div>

                            {/* 게이지바 영역 */}
                            <div className="w-1/4 flex items-center justify-end">
                                <div className="w-32 bg-[#23272F] h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-primary h-full rounded-full" 
                                        style={{ width: meeting.pct }}
                                    ></div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default DashBoard;