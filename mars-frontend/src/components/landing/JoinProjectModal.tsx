import type * as React from 'react';
import { ArrowRight, X } from 'lucide-react';

interface JoinProjectModalProps {
  projectCode: string;
  errorMessage: string;
  isLoading: boolean;
  onClose: () => void;
  onProjectCodeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
}

const JoinProjectModal = ({
  projectCode,
  errorMessage,
  isLoading,
  onClose,
  onProjectCodeChange,
  onSubmit,
}: JoinProjectModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border w-full max-w-[440px] p-6 rounded-xl shadow-2xl relative animate-fade-in">
        <button
          type="button"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-md hover:bg-muted transition-all"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">프로젝트 참여하기</h3>
            <p className="text-xs text-muted-foreground mt-1">
              공유받은 10자리 코드를 입력하세요.
            </p>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-muted-foreground ml-1">회의 코드 (10자리 숫자)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder="0000000000"
              value={projectCode}
              onChange={onProjectCodeChange}
              className="w-full bg-[#161920] border border-border text-foreground px-4 py-2.5 rounded-lg text-lg focus:outline-none focus:border-primary tracking-[0.15em] font-mono text-center transition-all"
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="h-5 text-left">
            {errorMessage && <p className="text-destructive text-xs font-medium pl-1">{errorMessage}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading || projectCode.length !== 10}
            className="w-full bg-primary text-primary-foreground text-sm font-semibold py-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? '프로젝트 조회 및 입장 중...' : '프로젝트 입장'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinProjectModal;
