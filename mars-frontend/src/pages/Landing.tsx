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
            identityMode={state.identityMode}
            userIdInput={state.userIdInput}
            userNameInput={state.userNameInput}
            userIdWarning={state.userIdWarning}
            duplicateCheckMessage={state.duplicateCheckMessage}
            currentUser={state.currentUser}
            isUserIdAvailable={state.isUserIdAvailable}
            isLoading={state.isLoading}
            onUserIdInputChange={actions.handleUserIdInputChange}
            onUserNameInputChange={actions.handleUserNameInputChange}
            onCheckDuplicate={actions.handleCheckDuplicate}
            onCreateUser={actions.handleCreateUser}
            onAccessExistingUser={actions.handleAccessExistingUser}
            onSwitchToCreateUser={actions.handleSwitchToCreateUser}
            onSwitchToAccessUser={actions.handleSwitchToAccessUser}
            onCreateProjectClick={actions.handleCreateProjectClick}
            onJoinProjectClick={actions.handleOpenJoinModal}
          />
          {state.isJoinModalOpen && (
            <JoinProjectModal
              projectCode={state.projectCode}
              errorMessage={state.errorMessage}
              isLoading={state.isLoading}
              onClose={actions.handleCloseJoinModal}
              onProjectCodeChange={actions.handleProjectCodeChange}
              onSubmit={actions.handleJoinSubmit}
            />
          )}
        </>
      )}

      {state.viewMode === 'create_project' && (
        <CreateProjectForm
          projectName={state.projectName}
          projectDescription={state.projectDescription}
          projectType={state.projectType}
          projectDeadline={state.projectDeadline}
          isProjectDeadlineInvalid={state.isProjectDeadlineInvalid}
          projectDeadlineValidationMessage={state.projectDeadlineValidationMessage}
          isDeadlineWarningVisible={state.isDeadlineWarningVisible}
          errorMessage={state.errorMessage}
          isLoading={state.isLoading}
          onBack={actions.goToLanding}
          onCancel={actions.goToLanding}
          onProjectNameChange={actions.setProjectName}
          onProjectDescriptionChange={actions.setProjectDescription}
          onProjectTypeChange={actions.setProjectType}
          onProjectDeadlineChange={actions.handleProjectDeadlineChange}
          onCloseValidationModal={actions.handleCloseValidationModal}
          onSubmit={actions.handleCreateProjectSubmit}
        />
      )}

      {state.isSuccessModalOpen && (
        <ProjectCreatedModal
          projectCode={state.createdProjectCode}
          isCopied={state.isCopied}
          onCopyProjectCode={actions.handleCopyCode}
          onEnterDashboard={actions.handleCloseSuccessAndNavigate}
        />
      )}
    </div>
  );
};

export default Landing;
