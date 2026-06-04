import { AlertTriangle, X } from 'lucide-react';

interface DeadlineValidationPopoverProps {
  message: string;
  onClose: () => void;
}

const DeadlineValidationPopover = ({ message, onClose }: DeadlineValidationPopoverProps) => {
  return (
    <div className="absolute left-0 top-full z-40 mt-3 w-[min(360px,calc(100vw-48px))] animate-fade-in">
      <div className="relative flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 pr-10 shadow-2xl">
        <span className="absolute -top-2 left-8 h-4 w-4 rotate-45 border-l border-t border-border bg-card" />

        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <AlertTriangle className="h-5 w-5" />
        </div>

        <p className="pt-1 text-sm font-medium leading-6 text-foreground">
          {message}
        </p>

        <button
          type="button"
          className="absolute right-2.5 top-2.5 cursor-pointer rounded-md p-1 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          onClick={onClose}
          aria-label="안내 닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DeadlineValidationPopover;
