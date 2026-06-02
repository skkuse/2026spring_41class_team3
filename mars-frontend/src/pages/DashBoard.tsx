import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, CheckCircle, Target, Copy, Check } from 'lucide-react';
import { actionItems } from '../components/actionItems/actionItemsData';
import { pastMeetings } from '../components/pastMeetings/pastMeetingsData';
import { getMeeting, getProjectActionItems } from '../lib/api';
import type { ActionItemResponse, MeetingResponse } from '../lib/api';
import { getStoredProjectContext, setStoredProjectContext } from '../lib/projectContext';

interface DashboardMeeting {
    id: string;
    title: string;
    date: string;
    items: number;
    done: number;
    pct: string;
}

const DashBoard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const storedProjectContext = getStoredProjectContext();
    const routeState = location.state as {
        userId?: string;
        userUuid?: string;
        projectId?: string;
        projectCode?: string;
        title?: string;
    } | null;

    const projectCode = routeState?.projectCode ?? storedProjectContext?.projectCode ?? '----------';
    const projectTitle = routeState?.title ?? storedProjectContext?.projectTitle ?? (projectCode !== '----------' ? `프로젝트 ${projectCode}` : 'MARS 메인 프로젝트');
    const userId = routeState?.userId ?? storedProjectContext?.userId ?? 'Guest';
    const userUuid = routeState?.userUuid ?? storedProjectContext?.userUuid ?? '';
    const projectId = routeState?.projectId ?? storedProjectContext?.projectId ?? '';
    
    // 복사 상태 관리 State
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [remoteActionItems, setRemoteActionItems] = useState<ActionItemResponse[]>([]);
    const [remoteMeetings, setRemoteMeetings] = useState<Record<string, MeetingResponse>>({});
    const [hasLoadedRemoteData, setHasLoadedRemoteData] = useState(false);
    const [isDashboardLoading, setIsDashboardLoading] = useState(false);
    const [dashboardErrorMessage, setDashboardErrorMessage] = useState('');

    useEffect(() => {
        if (!projectCode || projectCode === '----------') {
            return;
        }

        setStoredProjectContext({
            userId,
            userUuid,
            projectId,
            projectCode,
            projectTitle,
        });
    }, [projectCode, projectId, projectTitle, userId, userUuid]);

    useEffect(() => {
        if (!projectId) {
            return;
        }

        let isMounted = true;

        const loadDashboardData = async () => {
            setIsDashboardLoading(true);
            setHasLoadedRemoteData(false);
            setDashboardErrorMessage('');

            try {
                const fetchedActionItems = await getProjectActionItems(projectId, {
                    assignee_id: userUuid || undefined,
                    sort: 'created_at_desc',
                });
                const meetingIds = Array.from(new Set(
                    fetchedActionItems
                        .map((item) => item.meeting_id)
                        .filter((meetingId): meetingId is string => Boolean(meetingId)),
                ));

                const fetchedMeetings = await Promise.all(
                    meetingIds.map(async (meetingId) => {
                        try {
                            return [meetingId, await getMeeting(projectId, meetingId)] as const;
                        } catch (error) {
                            console.error('[Dashboard][Meeting:Failed]', {
                                projectId,
                                meetingId,
                                error,
                            });
                            return null;
                        }
                    }),
                );

                if (!isMounted) {
                    return;
                }

                setRemoteActionItems(fetchedActionItems);
                setRemoteMeetings(Object.fromEntries(fetchedMeetings.filter((meeting): meeting is readonly [string, MeetingResponse] => meeting !== null)));
                setHasLoadedRemoteData(true);
            } catch (error) {
                console.error('[Dashboard][ActionItems:Failed]', {
                    projectId,
                    error,
                });

                if (isMounted) {
                    setRemoteActionItems([]);
                    setRemoteMeetings({});
                    setHasLoadedRemoteData(false);
                    setDashboardErrorMessage('대시보드 데이터를 불러오지 못했습니다. 임시 데이터로 표시합니다.');
                }
            } finally {
                if (isMounted) {
                    setIsDashboardLoading(false);
                }
            }
        };

        void loadDashboardData();

        return () => {
            isMounted = false;
        };
    }, [projectId]);

    const dashboardSummary = useMemo(() => {
        const hasRemoteData = hasLoadedRemoteData;
        const dashboardActionItems = hasRemoteData ? remoteActionItems : actionItems;
        const totalActionItems = dashboardActionItems.length;
        const completedActionItems = dashboardActionItems.filter((item) => isCompletedActionItem(item.status)).length;
        const progressRate = totalActionItems === 0 ? 0 : Math.round((completedActionItems / totalActionItems) * 100);

        const recentMeetings = hasRemoteData
            ? buildRemoteMeetingSummaries(remoteActionItems, remoteMeetings)
            : pastMeetings.map((meeting) => {
                const relatedActionItems = dashboardActionItems.filter((item) => item.meeting_id === meeting.id);
                const actionItemCount = relatedActionItems.length || meeting.actionItems;
                const completedCount = relatedActionItems.length
                    ? relatedActionItems.filter((item) => isCompletedActionItem(item.status)).length
                    : meeting.completed;
                const completionRate = actionItemCount === 0 ? 0 : Math.round((completedCount / actionItemCount) * 100);

                return {
                    ...meeting,
                    items: actionItemCount,
                    done: completedCount,
                    pct: `${completionRate}%`,
                };
            })
        ;

        return {
            totalActionItems,
            completedActionItems,
            progressRate,
            recentMeetings: recentMeetings.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4),
        };
    }, [hasLoadedRemoteData, remoteActionItems, remoteMeetings]);

    // 참여 코드 클립보드 복사 함수
    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(projectCode);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('코드 복사에 실패했습니다.', err);
        }
    };

    return (
        <main className="flex-1 p-10 bg-background text-foreground overflow-y-auto w-full max-w-[1200px] font-sans">
            
            {/* ================= HEADER AREA ================= */}
            <header className="flex justify-between items-start mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold font-['Rajdhani'] tracking-tight text-foreground">
                            {projectTitle}
                        </h2>
                        
                        {/* 참여 코드 복사 영역 */}
                        <div className="flex items-center gap-1.5 bg-[#161920] border border-border px-2.5 py-1 rounded-md mt-1 group">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">코드:</span>
                            <span className="text-xs font-mono font-bold text-primary tracking-wider">{projectCode}</span>
                            <button
                                type="button"
                                onClick={handleCopyCode}
                                className="p-1 rounded hover:bg-neutral-800 text-muted-foreground hover:text-foreground transition-all cursor-pointer ml-0.5"
                                title="참여 코드 복사"
                            >
                                {isCopied ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5 transition-transform group-hover:scale-105" />
                                )}
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        <span className="text-primary font-medium">{userId}</span>님, 프로젝트 개요 및 데이터 분석을 확인하세요.
                    </p>
                    {dashboardErrorMessage && (
                        <p className="mt-2 text-xs text-primary">{dashboardErrorMessage}</p>
                    )}
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
                
                {/* 총 액션 아이템 카드 */}
                <div 
                    className="bg-card border border-border rounded-xl p-6 relative flex flex-col justify-between min-h-[140px] cursor-pointer hover:border-primary/50 transition-all group"
                    onClick={() => navigate('/actions')}
                >
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 rounded-lg bg-[#2E2522] border border-[#44322B] group-hover:bg-primary/20 transition-all">
                            <Clock className="w-5 h-5 text-primary" strokeWidth={1.5} />
                        </div>
                        <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                            {isDashboardLoading ? '불러오는 중' : '프로젝트 기준'}
                        </span>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-all">{dashboardSummary.totalActionItems}</h3>
                        <p className="text-xs text-muted-foreground mt-1">총 액션 아이템</p>
                    </div>
                </div>

                {/* 완료된 태스크 카드 */}
                <div 
                    className="bg-card border border-border rounded-xl p-6 relative flex flex-col justify-between min-h-[140px] cursor-pointer hover:border-emerald-500/50 transition-all group"
                    onClick={() => navigate('/actions')}
                >
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 rounded-lg bg-[#222E28] border border-[#2B4436] group-hover:bg-emerald-500/20 transition-all">
                            <CheckCircle className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">달성률 {dashboardSummary.progressRate}%</span>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-bold tracking-tight text-foreground group-hover:text-emerald-500 transition-all">{dashboardSummary.completedActionItems}</h3>
                        <p className="text-xs text-muted-foreground mt-1">완료된 태스크</p>
                    </div>
                </div>

                {/* 진행률 카드 */}
                <div 
                    className="bg-card border border-border rounded-xl p-6 relative flex flex-col justify-between min-h-[140px] cursor-pointer hover:border-primary/50 transition-all group"
                    onClick={() => navigate('/suggestions')}
                >
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 rounded-lg bg-[#2E2522] border border-[#44322B] group-hover:bg-primary/20 transition-all">
                            <Target className="w-5 h-5 text-primary" strokeWidth={1.5} />
                        </div>
                        <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">현재 데이터 기준</span>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-all">{dashboardSummary.progressRate}%</h3>
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
                        onClick={() => navigate('/meetings/past')}
                    >
                        전체 보기
                    </button>
                </div>
                
                {/* 회의 목록 리스트 */}
                <div className="space-y-3">
                    {dashboardSummary.recentMeetings.length > 0 ? dashboardSummary.recentMeetings.map((meeting) => (
                        <div 
                            key={meeting.id} 
                            className="flex items-center justify-between p-4 rounded-xl bg-[#1A1D23]/40 border border-border/60 hover:border-primary/40 cursor-pointer transition-all group"
                            onClick={() => navigate('/meetings/past')}
                        >
                            {/* 제목 및 날짜 */}
                            <div className="w-1/3">
                                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-all">{meeting.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{meeting.date}</p>
                            </div>
                            
                            {/* 수치 메트릭 */}
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
                    )) : (
                        <div className="rounded-xl border border-border/60 bg-[#1A1D23]/40 p-8 text-center text-sm text-muted-foreground">
                            아직 표시할 회의와 액션 아이템이 없습니다.
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

const isCompletedActionItem = (status?: string | null) => {
    const normalizedStatus = status?.toLowerCase();

    return normalizedStatus === 'done' || normalizedStatus === 'completed' || normalizedStatus === 'complete';
};

const buildRemoteMeetingSummaries = (
    dashboardActionItems: ActionItemResponse[],
    meetingMap: Record<string, MeetingResponse>,
): DashboardMeeting[] => {
    const groupedActionItems = dashboardActionItems.reduce<Record<string, ActionItemResponse[]>>((acc, item) => {
        const meetingId = item.meeting_id ?? 'unassigned';
        acc[meetingId] = [...(acc[meetingId] ?? []), item];
        return acc;
    }, {});

    return Object.entries(groupedActionItems).map(([meetingId, meetingActionItems]) => {
        const meeting = meetingMap[meetingId];
        const actionItemCount = meetingActionItems.length;
        const completedCount = meetingActionItems.filter((item) => isCompletedActionItem(item.status)).length;
        const completionRate = actionItemCount === 0 ? 0 : Math.round((completedCount / actionItemCount) * 100);
        const createdAt = meeting?.date ?? meeting?.created_at ?? meetingActionItems[0]?.created_at ?? '';

        return {
            id: meetingId,
            title: meeting?.title ?? meeting?.name ?? meetingActionItems[0]?.description ?? '회의 정보 없음',
            date: formatDashboardDate(createdAt),
            items: actionItemCount,
            done: completedCount,
            pct: `${completionRate}%`,
        };
    });
};

const formatDashboardDate = (value?: string | null) => {
    if (!value) {
        return '날짜 없음';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value.slice(0, 10);
    }

    return date.toISOString().slice(0, 10);
};

export default DashBoard;
