import type * as React from 'react';
import { ArrowLeft, FolderPlus } from 'lucide-react';
import ProjectDeadlineField from './ProjectDeadlineField';

interface CreateProjectFormProps {
  projectName: string;
  projectDescription: string;
  projectType: string;
  projectDeadline: string;
  isProjectDeadlineInvalid: boolean;
  projectDeadlineValidationMessage: string;
  isDeadlineWarningVisible: boolean;
  errorMessage: string;
  isLoading: boolean;
  onBack: () => void;
  onCancel: () => void;
  onProjectNameChange: (projectName: string) => void;
  onProjectDescriptionChange: (description: string) => void;
  onProjectTypeChange: (projectType: string) => void;
  onProjectDeadlineChange: (deadline: string) => void;
  onCloseValidationModal: () => void;
  onSubmit: (event: React.FormEvent) => void;
}

const CreateProjectForm = ({
  projectName,
  projectDescription,
  projectType,
  projectDeadline,
  isProjectDeadlineInvalid,
  projectDeadlineValidationMessage,
  isDeadlineWarningVisible,
  errorMessage,
  isLoading,
  onBack,
  onCancel,
  onProjectNameChange,
  onProjectDescriptionChange,
  onProjectTypeChange,
  onProjectDeadlineChange,
  onCloseValidationModal,
  onSubmit,
}: CreateProjectFormProps) => {
  const isSubmitDisabled =
    isLoading ||
    !projectName.trim() ||
    !projectDescription.trim() ||
    !projectType.trim() ||
    !projectDeadline ||
    isProjectDeadlineInvalid;

  return (
    <div className="w-full max-w-[620px] bg-card border border-border rounded-xl p-8 shadow-2xl animate-fade-in text-left">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 cursor-pointer group transition-all"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        메인으로 돌아가기
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FolderPlus className="w-6 h-6 text-primary" />
          새로운 프로젝트 생성
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          아래의 정보를 입력해 새로운 프로젝트를 생성하세요.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">프로젝트 이름</label>
          <input
            type="text"
            placeholder="예시) MARS 프론트엔드 개발 스쿼드"
            value={projectName}
            onChange={(event) => onProjectNameChange(event.target.value)}
            className="w-full bg-[#161920] border border-border text-foreground px-4 py-3 rounded-lg text-base focus:outline-none focus:border-primary transition-all"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">프로젝트 설명</label>
          <textarea
            placeholder="프로젝트 목적과 범위를 입력해 주세요. 
상세할수록 더 높은 품질의 AI 서비스를 제공 받을 수 있습니다."
            value={projectDescription}
            onChange={(event) => onProjectDescriptionChange(event.target.value)}
            className="min-h-24 w-full resize-y bg-[#161920] border border-border text-foreground px-4 py-3 rounded-lg text-base focus:outline-none focus:border-primary transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">프로젝트 유형</label>
            <input
              type="text"
              placeholder="예시) software"
              value={projectType}
              onChange={(event) => onProjectTypeChange(event.target.value)}
              className="w-full bg-[#161920] border border-border text-foreground px-4 py-3 rounded-lg text-base focus:outline-none focus:border-primary transition-all"
              required
            />
          </div>

          <ProjectDeadlineField
            deadline={projectDeadline}
            validationMessage={projectDeadlineValidationMessage}
            isWarningVisible={isDeadlineWarningVisible}
            onDeadlineChange={onProjectDeadlineChange}
            onCloseWarning={onCloseValidationModal}
          />
        </div>

        <div className="min-h-5">
          {errorMessage && <p className="text-destructive text-sm font-medium pl-1">{errorMessage}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-secondary text-foreground border border-border text-sm font-semibold py-3.5 rounded-lg hover:bg-neutral-800 transition-all cursor-pointer text-center"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="flex-1 bg-primary text-primary-foreground text-sm font-semibold py-3.5 rounded-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? '프로젝트 생성 중...' : '프로젝트 생성 및 입장'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectForm;
