import * as React from 'react';
import { 
  Lightbulb, 
  ArrowRight, 
  Calendar, 
  CheckSquare, 
  Target, 
  AlertCircle, 
  AlertTriangle,
  Layers,
  Check
} from 'lucide-react';

interface AgendaSuggestion {
    id: string;             
    project_id: string;     
    title: string;          
    description: string;   
    sourceType: 'INCOMPLETE_TASK' | 'COMPLETED_REVIEW' | 'STRATEGIC_PIVOT'; 
    priority: '높음' | '보통' | '낮음'; 
    eisenhowerQuadrant: '즉시 실행' | '실행 염두' | '빠른 처리 필요' | '후순위'; 
    bertScore: number;    
}

const Suggestions: React.FC = () => {
    const [agendaSuggestions, setAgendaSuggestions] = React.useState<AgendaSuggestion[]>([
        {
            id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
            project_id: 'p9o8n7m6-l5k4-j3i2-h1g0-f9e8d7c6b5a4',
            title: '미완료 액션 아이템: 랜딩 페이지 컴파일 에러 상태 점검',
            description: '이전 회의에서 도출된 랜딩 페이지 상태 관리 정상화 작업이 기한 내 미완료 상태입니다. 차기 회의에서 장애 요인을 식별하고 리소스를 재조정해야 합니다.',
            sourceType: 'INCOMPLETE_TASK',
            priority: '높음',
            eisenhowerQuadrant: '즉시 실행', 
            bertScore: 0.85 
        },
        {
            id: 'b2c3d4e5-f67a-8b9c-0d1e-2f3a4b5c6d7e',
            project_id: 'p9o8n7m6-l5k4-j3i2-h1g0-f9e8d7c6b5a4',
            title: '생산성 피드백: 회의 효율성 제고를 위한 45분 타임박싱 도입',
            description: '최근 3회 간의 평균 회의 시간이 65분으로 측정되었습니다. 팀 집중도 향상을 위해 다음 세션은 의제별 15분, 총 45분 타이머 기반 회의 진행을 제안합니다.',
            sourceType: 'COMPLETED_REVIEW',
            priority: '보통',
            eisenhowerQuadrant: '실행 염두', 
            bertScore: 0.78 // BERT 점수 부족 (0.8 미만) -
        },
        {
            id: 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
            project_id: 'p9o8n7m6-l5k4-j3i2-h1g0-f9e8d7c6b5a4',
            title: '요구사항 변경: 프로젝트 상세 설명 폼 제외에 따른 데이터 명세 정립',
            description: '기획에서 제외된 \'상세 설명\' 데이터 모델 및 API 싱크 정리를 위해 백엔드와 프론트엔드 간 인터페이스 최종 정립이 필요합니다.',
            sourceType: 'STRATEGIC_PIVOT',
            priority: '보통',
            eisenhowerQuadrant: '빠른 처리 필요', 
            bertScore: 0.92 
        }
    ]);

    const [adoptedIds, setAdoptedIds] = React.useState<string[]>([]);

    // 아이젠하워 매트릭스 4분면별 배지 스타일 지정
    const getEisenhowerStyle = (quadrant: string) => {
        switch (quadrant) {
            case '즉시 실행':
                return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            case '실행 염두':
                return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case '빠른 처리 필요':
                return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            default:
                return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    // 제안 원천별 도출 아이콘 매핑
    const getSourceIcon = (type: string) => {
        switch (type) {
            case 'INCOMPLETE_TASK':
                return <CheckSquare className="w-4 h-4 text-rose-400" />;
            case 'COMPLETED_REVIEW':
                return <Target className="w-4 h-4 text-emerald-400" />;
            default:
                return <AlertCircle className="w-4 h-4 text-blue-400" />;
        }
    };

    const handleAdoptAgenda = (item: AgendaSuggestion) => {
        console.log('[Suggestions][API POST] 차기 회의 의제 저장 요청', {
            agenda_id: item.id,
            project_id: item.project_id,
            title: item.title,
            eisenhower_quadrant: item.eisenhowerQuadrant,
            bert_score: item.bertScore
        });

        setAdoptedIds((prev) => 
            prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
        );
    };

    return (
        <main className="flex-1 p-10 bg-background text-foreground overflow-y-auto w-full max-w-[1200px] font-sans space-y-6">
            
            {/* ================= 메인 차기 안건 카드 리스트 ================= */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
                
                {/* 상단 헤더 영역 */}
                <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-primary" strokeWidth={2} />
                        <div>
                            <h3 className="text-lg font-bold tracking-wide text-foreground">
                                AI 기반 차기 회의 안건 자동 제안
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                프로젝트 내 미완료 작업 및 이전 회의 결과를 종합 조회하여 도출된 안건 목록입니다.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-sidebar-accent/30 px-3 py-1.5 rounded-lg border border-border/40">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium">차기 회의 분석 관리</span>
                    </div>
                </div>
                
                {/* 안건 리스트 섹션 */}
                <div className="space-y-4">
                    {agendaSuggestions.map((item) => {
                        const isAdopted = adoptedIds.includes(item.id);
                        return (
                            <div 
                                key={item.id} 
                                className={`flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl bg-sidebar/30 border transition-all gap-4 ${
                                    isAdopted
                                    ? 'border-primary/60 bg-primary/5'
                                    : item.priority === '높음' 
                                    ? 'border-amber-500/30 hover:border-amber-500/50'
                                    : 'border-border/60 hover:border-border'
                                }`}
                            >
                                {/* 안건 상세 정보 */}
                                <div className="flex-1 pr-2">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        {getSourceIcon(item.sourceType)}
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mr-2">
                                            {item.sourceType === 'INCOMPLETE_TASK' && '미완료 작업 기반'}
                                            {item.sourceType === 'COMPLETED_REVIEW' && '생산성 피드백 연계'}
                                            {item.sourceType === 'STRATEGIC_PIVOT' && '요구사항 변경 감지'}
                                        </span>
                                        
                                        {item.bertScore < 0.8 && (
                                            <span className="inline-flex items-center gap-1 text-[10px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-medium">
                                                <AlertTriangle className="w-3 h-3" />
                                                맥락 일치도 낮음 (검증 점수: {item.bertScore})
                                            </span>
                                        )}

                                        {isAdopted && (
                                            <span className="inline-flex items-center gap-1 text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30 font-semibold">
                                                <Check className="w-3 h-3" />
                                                차기 의제 데이터 저장 완료
                                            </span>
                                        )}
                                    </div>
                                    <h4 className={`text-sm font-semibold tracking-tight transition-colors ${isAdopted ? 'text-primary' : 'text-foreground'}`}>
                                        {item.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-[900px]">
                                        {item.description}
                                    </p>
                                </div>
                                
                                {/* 우선순위, 매트릭스 태그 및 데이터 저장/채택 버튼 */}
                                <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0 border-t md:border-t-0 border-border/40 pt-3 md:pt-0">
                                    <div className="flex items-center gap-2">
                                        {/* 아이젠하워 매트릭스 매핑 배지 */}
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wide px-2.5 py-1 rounded border ${getEisenhowerStyle(item.eisenhowerQuadrant)}`}>
                                            <Layers className="w-2.5 h-2.5" />
                                            {item.eisenhowerQuadrant}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground bg-muted/20 border border-border px-2 py-1 rounded font-medium">
                                            중요도 {item.priority}
                                        </span>
                                    </div>
                                    
                                    <button
                                        type="button"
                                        title={isAdopted ? "의제 채택 취소" : "차기 회의 의제로 데이터베이스 저장"}
                                        className={`p-2 rounded-lg border transition-all cursor-pointer group flex items-center gap-1 text-xs font-medium ${
                                            isAdopted 
                                            ? 'bg-primary text-primary-foreground border-primary' 
                                            : 'bg-secondary border-border hover:bg-muted text-foreground'
                                        }`}
                                        onClick={() => handleAdoptAgenda(item)}
                                    >
                                        <span className="pl-1 text-[11px]">
                                            {isAdopted ? '채택 완료' : '안건 채택'}
                                        </span>
                                        {isAdopted ? (
                                            <Check className="w-3.5 h-3.5" />
                                        ) : (
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-muted-foreground group-hover:text-primary" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </main>
    );
};

export default Suggestions;