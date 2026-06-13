import { CheckCircle2, FileText, FolderOpen, PlusCircle, UsersRound } from 'lucide-react';
import type * as React from 'react';
import UserIdentityPanel from './UserIdentityPanel';
import type { UserIdentity, UserIdentityMode } from './types';

interface LandingHeroProps {
  identityMode: UserIdentityMode;
  userIdInput: string;
  userNameInput: string;
  userIdWarning: string;
  duplicateCheckMessage: string;
  currentUser: UserIdentity | null;
  isUserIdAvailable: boolean;
  isLoading: boolean;
  onUserIdInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUserNameInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckDuplicate: () => void;
  onCreateUser: () => void;
  onAccessExistingUser: () => void;
  onSwitchToCreateUser: () => void;
  onSwitchToAccessUser: () => void;
  onCreateProjectClick: () => void;
  onJoinProjectClick: () => void;
  onOpenExistingProjectsClick: () => void;
}

const LandingHero = ({
  identityMode,
  userIdInput,
  userNameInput,
  userIdWarning,
  duplicateCheckMessage,
  currentUser,
  isUserIdAvailable,
  isLoading,
  onUserIdInputChange,
  onUserNameInputChange,
  onCheckDuplicate,
  onCreateUser,
  onAccessExistingUser,
  onSwitchToCreateUser,
  onSwitchToAccessUser,
  onCreateProjectClick,
  onJoinProjectClick,
  onOpenExistingProjectsClick,
}: LandingHeroProps) => {
  const isUserReady = currentUser !== null;
  const featureHighlights = [
    { icon: FileText, label: '회의록 분석' },
    { icon: CheckCircle2, label: '액션 아이템 추출' },
    { icon: UsersRound, label: '담당자·마감일 추적' },
  ];

  return (
    <>
      <header className="mb-8 flex flex-col items-center text-center">
        <h1 className="m-0 font-['Rajdhani'] text-7xl font-extrabold uppercase leading-none tracking-[0.12em] bg-gradient-to-r from-[#FF8A65] to-primary bg-clip-text text-transparent max-sm:text-6xl">
          MARS
        </h1>
        <p className="mt-4 text-sm font-semibold tracking-[0.18em] text-muted-foreground/70 max-sm:text-xs">
          Minutes to Action & Review System
        </p>
      </header>

      <main className="max-w-[1000px] w-full text-center">
        {/* <p className="mx-auto mb-5 max-w-[720px] text-balance text-[1.35rem] font-semibold leading-8 tracking-tight text-foreground max-sm:text-xl max-sm:leading-7">
          회의록에서 할 일을 추출해 담당자와 마감일까지 이어주는 AI 회의 실행 관리 서비스
        </p> */}
        <div className="mb-11 flex flex-wrap items-center justify-center gap-3">
          {featureHighlights.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/70 px-4 py-2 text-sm font-medium leading-none text-muted-foreground"
            >
              <Icon className="size-4 text-primary" strokeWidth={1.8} />
              {label}
            </span>
          ))}
        </div>
        <UserIdentityPanel
          mode={identityMode}
          userIdInput={userIdInput}
          userNameInput={userNameInput}
          userIdWarning={userIdWarning}
          duplicateCheckMessage={duplicateCheckMessage}
          currentUser={currentUser}
          isUserIdAvailable={isUserIdAvailable}
          isLoading={isLoading}
          onUserIdInputChange={onUserIdInputChange}
          onUserNameInputChange={onUserNameInputChange}
          onCheckDuplicate={onCheckDuplicate}
          onCreateUser={onCreateUser}
          onAccessExistingUser={onAccessExistingUser}
          onSwitchToCreateUser={onSwitchToCreateUser}
          onSwitchToAccessUser={onSwitchToAccessUser}
        />
        <div className="flex flex-wrap gap-4 justify-center mb-24 max-sm:flex-col max-sm:items-stretch">
          <button
            type="button"
            className="bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-lg hover:opacity-90 text-base cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed min-w-[210px]"
            onClick={onCreateProjectClick}
            disabled={!isUserReady}
          >
            <PlusCircle className="w-4 h-4" />
            새 프로젝트 생성
          </button>
          <button
            type="button"
            className="bg-card text-foreground border border-primary/40 font-semibold px-8 py-4 rounded-lg hover:border-primary hover:bg-muted text-base cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-w-[210px] flex items-center justify-center gap-2 transition-all"
            onClick={onOpenExistingProjectsClick}
            disabled={!isUserReady}
          >
            <FolderOpen className="w-4 h-4" />
            기존 프로젝트 접속
          </button>
          <button
            type="button"
            className="bg-secondary text-foreground border border-border font-semibold px-8 py-4 rounded-lg hover:bg-neutral-800 text-base cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-w-[210px]"
            onClick={onJoinProjectClick}
            disabled={!isUserReady}
          >
            프로젝트 코드로 참여
          </button>
        </div>
      </main>
    </>
  );
};

export default LandingHero;
