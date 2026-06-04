import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, CheckCircle, Target, Copy, Check } from 'lucide-react';
import DashboardStatCard from '../components/dashboard/DashboardStatCard';
import RecentMeetingsPanel from '../components/dashboard/RecentMeetingsPanel';
import { buildDashboardSummary } from '../components/dashboard/dashboardSummary';
import { getMeeting, getProjectActionItems } from '../lib/api';
import type { ActionItemResponse, MeetingResponse } from '../lib/api';
import { getStoredProjectContext, setStoredProjectContext } from '../lib/projectContext';

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
    }, [projectId, userUuid]);

    const dashboardSummary = useMemo(() => buildDashboardSummary({
        hasLoadedRemoteData,
        remoteActionItems,
        remoteMeetings,
    }), [hasLoadedRemoteData, remoteActionItems, remoteMeetings]);

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

                <DashboardStatCard
                    icon={Clock}
                    value={dashboardSummary.totalActionItems}
                    label="총 액션 아이템"
                    badge={isDashboardLoading ? '불러오는 중' : '프로젝트 기준'}
                    variant="primary"
                    onClick={() => navigate('/actions')}
                />

                <DashboardStatCard
                    icon={CheckCircle}
                    value={dashboardSummary.completedActionItems}
                    label="완료된 태스크"
                    badge={`달성률 ${dashboardSummary.progressRate}%`}
                    variant="success"
                    onClick={() => navigate('/actions')}
                />

                <DashboardStatCard
                    icon={Target}
                    value={`${dashboardSummary.progressRate}%`}
                    label="전체 진행률"
                    badge="현재 데이터 기준"
                    variant="primary"
                    onClick={() => navigate('/suggestions')}
                />

            </section>

            {/* ================= RECENT MEETINGS AREA ================= */}
            <RecentMeetingsPanel
                meetings={dashboardSummary.recentMeetings}
                onViewAll={() => navigate('/meetings/past')}
            />
        </main>
    );
};

export default DashBoard;
