import { ArrowRight, Check, Copy, FolderPlus } from 'lucide-react';

interface ProjectCreatedModalProps {
  projectId: string;
  isCopied: boolean;
  onCopyProjectId: () => void;
  onEnterDashboard: () => void;
}

const ProjectCreatedModal = ({
  projectId,
  isCopied,
  onCopyProjectId,
  onEnterDashboard,
}: ProjectCreatedModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="bg-card border border-border w-full max-w-[460px] p-7 rounded-xl shadow-2xl text-center relative animate-fade-in border-t-4 border-t-primary">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FolderPlus className="w-6 h-6 text-primary" />
        </div>

        <h3 className="text-2xl font-bold tracking-tight text-foreground mb-1">프로젝트 생성 완료!</h3>
        <p className="text-sm text-muted-foreground mb-6">
          생성된 프로젝트 ID를 확인해 주세요.
        </p>

        <div className="bg-[#161920] border border-border rounded-lg p-4 flex items-center justify-between mb-6 group">
          <span className="text-sm font-mono font-bold text-primary pl-2 break-all text-left">
            {projectId}
          </span>
          <button
            type="button"
            onClick={onCopyProjectId}
            className="bg-secondary hover:bg-neutral-800 text-foreground border border-border p-2.5 rounded-md cursor-pointer transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500">복사됨</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-muted-foreground" />
                <span>ID 복사</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={onEnterDashboard}
          className="w-full bg-primary text-primary-foreground text-sm font-semibold py-3.5 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          대시보드로 입장하기
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProjectCreatedModal;
