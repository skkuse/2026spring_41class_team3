import CreateProjectForm from '../components/landing/CreateProjectForm';
import JoinProjectModal from '../components/landing/JoinProjectModal';
import LandingHero from '../components/landing/LandingHero';
import ProjectCreatedModal from '../components/landing/ProjectCreatedModal';
import { useLandingPage } from '../components/landing/useLandingPage';

const Landing = () => {
  const { state, actions } = useLandingPage();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 box-border font-sans relative">
      {state.viewMode === 'landing' && (
        <>
          <LandingHero
            onCreateProjectClick={actions.handleCreateProjectClick}
            onJoinProjectClick={actions.handleOpenJoinModal}
          />
          {state.isJoinModalOpen && (
            <JoinProjectModal
              userId={state.userId}
              projectCode={state.projectCode}
              idWarning={state.idWarning}
              errorMessage={state.errorMessage}
              isLoading={state.isLoading}
              onClose={actions.handleCloseJoinModal}
              onUserIdChange={actions.handleUserIdChange}
              onProjectCodeChange={actions.handleProjectCodeChange}
              onSubmit={actions.handleJoinSubmit}
            />
          )}
        </>
      )}

      {state.viewMode === 'create_project' && (
        <CreateProjectForm
          ownerUserId={state.ownerUserId}
          projectName={state.projectName}
          projectDescription={state.projectDescription}
          projectType={state.projectType}
          projectDeadline={state.projectDeadline}
          ownerUserIdWarning={state.ownerUserIdWarning}
          errorMessage={state.errorMessage}
          isLoading={state.isLoading}
          onBack={actions.goToLanding}
          onCancel={actions.goToLanding}
          onOwnerUserIdChange={actions.handleOwnerUserIdChange}
          onProjectNameChange={actions.setProjectName}
          onProjectDescriptionChange={actions.setProjectDescription}
          onProjectTypeChange={actions.setProjectType}
          onProjectDeadlineChange={actions.setProjectDeadline}
          onSubmit={actions.handleCreateProjectSubmit}
        />
      )}

      {state.isSuccessModalOpen && (
        <ProjectCreatedModal
          projectId={state.successCode}
          isCopied={state.isCopied}
          onCopyProjectId={actions.handleCopyCode}
          onEnterDashboard={actions.handleCloseSuccessAndNavigate}
        />
      )}
    </div>
  );
};

export default Landing;
