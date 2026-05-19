import type * as React from 'react';
import { Check, UserRound } from 'lucide-react';
import type { UserIdentity, UserIdentityMode } from './types';

interface UserIdentityPanelProps {
  mode: UserIdentityMode;
  userIdInput: string;
  userIdWarning: string;
  duplicateCheckMessage: string;
  currentUser: UserIdentity | null;
  isUserIdAvailable: boolean;
  onUserIdInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckDuplicate: () => void;
  onCreateUser: () => void;
  onAccessExistingUser: () => void;
  onSwitchToCreateUser: () => void;
  onSwitchToAccessUser: () => void;
}

const UserIdentityPanel = ({
  mode,
  userIdInput,
  userIdWarning,
  duplicateCheckMessage,
  currentUser,
  isUserIdAvailable,
  onUserIdInputChange,
  onCheckDuplicate,
  onCreateUser,
  onAccessExistingUser,
  onSwitchToCreateUser,
  onSwitchToAccessUser,
}: UserIdentityPanelProps) => {
  const isVerified = currentUser?.id === userIdInput;
  const isCreateMode = mode === 'create';

  if (currentUser) {
    return (
      <section className="max-w-[560px] mx-auto mb-8 text-left bg-card/70 border border-border rounded-xl px-5 py-4 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-[#2E2522] border border-[#44322B]">
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">접속한 사용자</p>
              <p className="text-sm font-bold text-foreground truncate">{currentUser.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSwitchToAccessUser}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer whitespace-nowrap"
          >
            사용자 변경
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[560px] mx-auto mb-8 text-left bg-card border border-border rounded-xl p-5 shadow-xl">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2.5 rounded-lg bg-[#2E2522] border border-[#44322B]">
          <UserRound className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground tracking-tight">사용자 아이디</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {isCreateMode
              ? '영문과 숫자를 조합해 3자 이상으로 입력한 뒤 새 아이디를 생성하세요.'
              : '이미 만든 아이디를 입력해 접속하세요.'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 max-sm:flex-col">
        <input
          type="text"
          value={userIdInput}
          onChange={onUserIdInputChange}
          placeholder="예시) mars01"
          autoComplete="off"
          spellCheck={false}
          className={`flex-1 bg-[#161920] border text-foreground px-4 py-3 rounded-lg text-base focus:outline-none transition-all ${userIdWarning ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'}`}
        />
        <button
          type="button"
          onClick={isCreateMode ? onCheckDuplicate : onAccessExistingUser}
          className="bg-secondary text-foreground border border-border text-sm font-semibold px-4 py-3 rounded-lg hover:bg-neutral-800 transition-all cursor-pointer whitespace-nowrap"
        >
          {isCreateMode ? '중복 확인' : '접속'}
        </button>
        {isCreateMode && isUserIdAvailable && (
          <button
            type="button"
            onClick={onCreateUser}
            className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-3 rounded-lg hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
          >
            계정 생성
          </button>
        )}
      </div>

      <div className="min-h-5 mt-2">
        {userIdWarning && <p className="text-destructive text-xs font-medium">{userIdWarning}</p>}
        {!userIdWarning && duplicateCheckMessage && (
          <p
            className={`text-xs font-medium ${
              isVerified || isUserIdAvailable ? 'text-emerald-500' : 'text-destructive'
            }`}
          >
            {duplicateCheckMessage}
          </p>
        )}
      </div>

      {isCreateMode ? (
        <button
          type="button"
          onClick={onSwitchToAccessUser}
          className="mt-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
        >
          이미 아이디가 있으신가요?
        </button>
      ) : (
        <button
          type="button"
          onClick={onSwitchToCreateUser}
          className="mt-1 text-xs font-semibold text-chart-3 hover:underline transition-all cursor-pointer"
        >
          처음이신가요?
        </button>
      )}
    </section>
  );
};

export default UserIdentityPanel;
