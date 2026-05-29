import { useRef } from 'react';
import { Calendar } from 'lucide-react';
import DeadlineValidationPopover from './DeadlineValidationPopover';

interface ProjectDeadlineFieldProps {
  deadline: string;
  validationMessage: string;
  isWarningVisible: boolean;
  onDeadlineChange: (deadline: string) => void;
  onCloseWarning: () => void;
}

const getTodayDateInputValue = () => {
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60_000);

  return localToday.toISOString().slice(0, 10);
};

const ProjectDeadlineField = ({
  deadline,
  validationMessage,
  isWarningVisible,
  onDeadlineChange,
  onCloseWarning,
}: ProjectDeadlineFieldProps) => {
  const deadlineInputRef = useRef<HTMLInputElement>(null);
  const minimumDeadline = getTodayDateInputValue();

  const handleOpenPicker = () => {
    if (deadlineInputRef.current?.showPicker) {
      deadlineInputRef.current.showPicker();
      return;
    }

    deadlineInputRef.current?.focus();
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-foreground">마감일</label>
      <div className="relative">
        <input
          ref={deadlineInputRef}
          type="date"
          value={deadline}
          min={minimumDeadline}
          onChange={(event) => onDeadlineChange(event.target.value)}
          className="mars-date-input w-full bg-[#161920] border border-border text-foreground px-4 py-3 pr-11 rounded-lg text-base focus:outline-none focus:border-primary transition-all"
          required
        />
        <button
          type="button"
          onClick={handleOpenPicker}
          className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
          aria-label="마감일 선택"
        >
          <Calendar className="h-5 w-5" />
        </button>
        {isWarningVisible && validationMessage && (
          <DeadlineValidationPopover
            message={validationMessage}
            onClose={onCloseWarning}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectDeadlineField;
