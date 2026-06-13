import { ArrowRight, FolderOpen, X } from 'lucide-react';
import type { UserProjectResponse } from '../../lib/api';

interface ExistingProjectsModalProps {
  projects: UserProjectResponse[];
  errorMessage: string;
  isLoading: boolean;
  onClose: () => void;
  onSelectProject: (project: UserProjectResponse) => void;
}

const ExistingProjectsModal = ({
  projects,
  errorMessage,
  isLoading,
  onClose,
  onSelectProject,
}: ExistingProjectsModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[520px] rounded-xl border border-border bg-card p-6 shadow-2xl animate-fade-in">
        <button
          type="button"
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          onClick={onClose}
          aria-label="기존 프로젝트 목록 닫기"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 pr-8">
          <h3 className="text-xl font-bold tracking-tight text-foreground">기존 프로젝트 접속하기</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            참여 중인 프로젝트를 선택해 바로 이어서 작업하세요.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-border bg-secondary/50 p-8 text-center text-sm text-muted-foreground">
            프로젝트 목록을 불러오는 중입니다.
          </div>
        ) : errorMessage ? (
          <div className="rounded-lg border border-destructive/40 bg-secondary/40 p-8 text-center text-sm font-medium text-destructive">
            {errorMessage}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-secondary/40 p-8 text-center text-sm text-muted-foreground">
            아직 참여 중인 프로젝트가 없습니다.
          </div>
        ) : (
          <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-secondary px-4 py-3 text-left transition hover:border-primary/50 hover:bg-muted"
                onClick={() => onSelectProject(project)}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#44322B] bg-[#2E2522]">
                    <FolderOpen className="h-4 w-4 text-primary" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {project.name}
                    </span>
                    <span className="mt-1 block font-mono text-xs tracking-[0.12em] text-muted-foreground">
                      {project.project_code}
                    </span>
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 min-h-5" />
      </div>
    </div>
  );
};

export default ExistingProjectsModal;
