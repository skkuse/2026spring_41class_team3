import * as React from 'react';
import { Lightbulb } from 'lucide-react';

interface SuggestionItem {
    id: number;
    title: string;
    description: string;
    impact: 'High Impact' | 'Medium Impact' | 'Low Impact';
}

const Suggestions: React.FC = () => {
    const suggestions: SuggestionItem[] = [
        {
            id: 1,
            title: 'Reduce Meeting Duration',
            description: 'Your meetings average 65 minutes. Consider 45-minute timeslots to improve focus.',
            impact: 'High Impact'
        },
        {
            id: 2,
            title: 'Action Item Follow-up',
            description: 'Schedule a 15-minute check-in 3 days after each meeting to review progress.',
            impact: 'Medium Impact'
        },
        {
            id: 3,
            title: 'Priority Distribution',
            description: 'Only 30% of tasks are marked high priority. Consider reassessing task urgency.',
            impact: 'Medium Impact'
        }
    ];

    const getImpactStyle = (impact: string) => {
        switch (impact) {
            case 'High Impact':
                return 'text-primary bg-primary/10 border-primary/20'; 
            case 'Medium Impact':
                return 'text-slate-400 bg-slate-800/40 border-slate-700/30'; 
            default:
                return 'text-muted-foreground bg-muted/10 border-border';
        }
    };

    return (
        <main className="flex-1 p-10 bg-background text-foreground overflow-y-auto w-full max-w-[1200px] font-sans">
            
            {/* 시안 상단 영역의 카드 박스 시작 */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
                
                {/* 헤더 타이틀 영역 (전구 아이콘 + 제목) */}
                <div className="flex items-center gap-2 mb-6">
                    <Lightbulb className="w-5 h-5 text-primary" strokeWidth={2} />
                    <h3 className="text-lg font-bold font-['Rajdhani'] tracking-wide text-foreground">
                        Next Meeting Suggestions
                    </h3>
                </div>
                
                {/* 제안 목록 리스트 반복 출력 */}
                <div className="space-y-4">
                    {suggestions.map((item) => (
                        <div 
                            key={item.id} 
                            className={`flex items-start justify-between p-5 rounded-xl bg-[#1A1D23]/40 border transition-all ${
                                item.impact === 'High Impact' 
                                ? 'border-primary/40 hover:border-primary/60' 
                                : 'border-border/60 hover:border-border'
                            }`}
                        >
                            {/* 왼쪽: 제목 및 설명글 */}
                            <div className="flex-1 pr-6">
                                <h4 className="text-sm font-semibold text-foreground font-sans">
                                    {item.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1.5 font-sans leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                            
                            {/* 오른쪽: 임팩트 배지 배정 */}
                            <div className="flex-shrink-0">
                                <span className={`text-[10px] font-bold font-sans tracking-wide px-2.5 py-1 rounded border uppercase ${getImpactStyle(item.impact)}`}>
                                    {item.impact}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                
            </div>
        </main>
    );
};

export default Suggestions;