import { PlusCircle } from 'lucide-react';

interface LandingHeroProps {
  onCreateProjectClick: () => void;
  onJoinProjectClick: () => void;
}

const LandingHero = ({ onCreateProjectClick, onJoinProjectClick }: LandingHeroProps) => {
  return (
    <>
      <header className="text-center mb-10">
        <h1 className="text-6xl font-extrabold tracking-wider m-0 bg-gradient-to-r from-[#FF8A65] to-primary bg-clip-text text-transparent font-['Rajdhani'] uppercase">
          MARS
        </h1>
        <p className="text-muted-foreground/80 text-sm mt-3 tracking-wide">
          Minutes to Action & Review System
        </p>
      </header>

      <main className="max-w-[1000px] w-full text-center">
        <h2 className="text-5xl font-bold mb-5 tracking-tight text-foreground">
          회의를 실행으로 전환하세요
        </h2>
        <p className="text-muted-foreground/80 text-base max-w-[800px] mx-auto mb-12 tracking-tight font-normal">
          AI 기반 워크플로우 관리로 액션 아이템을 추출하고, 실행을 추적하며, 생산성을 향상시킵니다
        </p>
        <div className="flex gap-4 justify-center mb-24">
          <button
            type="button"
            className="bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-md hover:opacity-90 text-sm cursor-pointer flex items-center gap-2 transition-all"
            onClick={onCreateProjectClick}
          >
            <PlusCircle className="w-4 h-4" />
            새 프로젝트 생성
          </button>
          <button
            type="button"
            className="bg-secondary text-foreground border border-border font-semibold px-8 py-3.5 rounded-md hover:bg-neutral-800 text-sm cursor-pointer"
            onClick={onJoinProjectClick}
          >
            프로젝트 코드로 참여
          </button>
        </div>
      </main>
    </>
  );
};

export default LandingHero;
