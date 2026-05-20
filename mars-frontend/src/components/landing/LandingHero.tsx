import { PlusCircle } from 'lucide-react';
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
}: LandingHeroProps) => {
  const isUserReady = currentUser !== null;

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
        <div className="flex gap-5 justify-center mb-24 max-sm:flex-col max-sm:items-stretch">
          <button
            type="button"
            className="bg-primary text-primary-foreground font-semibold px-10 py-4 rounded-lg hover:opacity-90 text-base cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed min-w-[220px]"
            onClick={onCreateProjectClick}
            disabled={!isUserReady}
          >
            <PlusCircle className="w-4 h-4" />
            새 프로젝트 생성
          </button>
          <button
            type="button"
            className="bg-secondary text-foreground border border-border font-semibold px-10 py-4 rounded-lg hover:bg-neutral-800 text-base cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-w-[220px]"
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
