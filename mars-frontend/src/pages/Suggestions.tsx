import * as React from 'react';
import { Lightbulb, ArrowRight, Sparkles, TrendingDown, CheckSquare } from 'lucide-react';

interface SuggestionItem {
    id: number;
    title: string;
    description: string;
    impact: '높음' | '보통' | '낮음';
}

const Suggestions: React.FC = () => {
    const suggestions: SuggestionItem[] = [
        {
            id: 1,
            title: '회의 시간 단축 제안',
            description: '최근 우리 팀의 평균 회의 시간은 65분입니다. 팀원들의 집중도 향상을 위해 다음 회의는 45분 타이머를 설정하고 진행해보는 것을 추천합니다.',
            impact: '높음'
        },
        {
            id: 2,
            title: '액션 아이템 중간 점검',
            description: '회의 종료 3일 후, 배정된 액션 아이템의 진행 상황을 체크할 수 있는 15분짜리 짧은 리마인드 세션을 캘린더에 자동으로 등록할까요?',
            impact: '보통'
        },
        {
            id: 3,
            title: '업무 우선순위 재조정',
            description: '현재 등록된 태스크 중 오직 30%만 높은 우선순위로 지정되어 있습니다. 마감일이 임박한 중요한 업무가 누락되지 않았는지 검토가 필요합니다.',
            impact: '보통'
        }
    ];

    const getImpactStyle = (impact: string) => {
        switch (impact) {
            case '높음':
                return 'text-primary bg-primary/10 border-primary/20'; 
            case '보통':
                return 'text-slate-400 bg-slate-800/40 border-slate-700/30';
            default:
                return 'text-muted-foreground bg-muted/10 border-border';
        }
    };

    return (
        <main className="flex-1 p-10 bg-background text-foreground overflow-y-auto w-full max-w-[1200px] font-sans space-y-6">
            
            {/* ================= 메인 제안 카드 리스트 ================= */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
                
                {/* 헤더 */}
                <div className="flex items-center gap-2 mb-6">
                    <Lightbulb className="w-5 h-5 text-primary" strokeWidth={2} />
                    <h3 className="text-lg font-bold font-['Rajdhani'] tracking-wide text-foreground">
                        AI 회의 분석 및 맞춤 제안
                    </h3>
                </div>
                
                {/* 리스트 */}
                <div className="space-y-4">
                    {suggestions.map((item) => (
                        <div 
                            key={item.id} 
                            className={`flex items-center justify-between p-5 rounded-xl bg-[#1A1D23]/40 border transition-all ${
                                item.impact === '높음' 
                                ? 'border-primary/40 hover:border-primary/60'
                                : 'border-border/60 hover:border-border'
                            }`}
                        >
                            <div className="flex-1 pr-6">
                                <h4 className="text-sm font-semibold text-foreground">
                                    {item.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-4 flex-shrink-0">
                                <span className={`text-[10px] font-bold tracking-wide px-2.5 py-1 rounded border ${getImpactStyle(item.impact)}`}>
                                    {item.impact}
                                </span>
                                {/* 제안을 바로 적용할 수 있는 화살표 버튼 */}
                                <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer">
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


        </main>
    );
};

export default Suggestions;