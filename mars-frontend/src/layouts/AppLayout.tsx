import { LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getProject } from '../lib/api';
import { clearStoredProjectContext, getStoredProjectContext, setStoredProjectContext } from '../lib/projectContext';

const navItems = [
  {
    label: '대시보드',
    path: '/dashboard',
  },
  {
    label: '회의',
    path: '/meetings',
  },
  {
    label: '지난 회의',
    path: '/meetings/past',
  },
  {
    label: '액션 아이템',
    path: '/actions',
  },
  {
    label: '제안',
    path: '/suggestions',
  },
  {
    label: '스타일',
    path: '/style-guide',
  },
];

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const storedProjectContext = getStoredProjectContext();
  const routeState = location.state as {
    userId?: string;
    userUuid?: string;
    projectId?: string;
    title?: string;
    projectCode?: string;
  } | null;

  const loginUserId = routeState?.userId ?? storedProjectContext?.userId ?? 'Guest';
  const projectId = routeState?.projectId ?? storedProjectContext?.projectId ?? '';
  const userUuid = routeState?.userUuid ?? storedProjectContext?.userUuid ?? '';
  const projectCode = routeState?.projectCode ?? storedProjectContext?.projectCode ?? '';
  const fallbackProjectName = routeState?.title ?? storedProjectContext?.projectTitle ?? '선택된 프로젝트 없음';
  const [resolvedProjectName, setResolvedProjectName] = useState<string | null>(null);
  const currentProjectName = resolvedProjectName ?? fallbackProjectName;

  useEffect(() => {
    if (!projectId) {
      return;
    }

    let isMounted = true;

    const loadProjectName = async () => {
      try {
        const project = await getProject(projectId);

        if (!isMounted) {
          return;
        }

        setResolvedProjectName(project.name);
        setStoredProjectContext({
          userId: loginUserId,
          userUuid,
          projectId: project.id,
          projectCode: project.project_code || projectCode,
          projectTitle: project.name,
        });
      } catch (error) {
        console.error('[AppLayout][Project:Failed]', {
          projectId,
          error,
        });
      }
    };

    void loadProjectName();

    return () => {
      isMounted = false;
    };
  }, [loginUserId, projectCode, projectId, userUuid]);

  const handleLeaveProject = () => {
    clearStoredProjectContext();
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="border-b border-border px-6 py-5">
          <h1 className="text-3xl font-semibold tracking-wide text-primary">
            MARS
          </h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
            minutes to action & review system
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-2 px-4 py-5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                [
                  'rounded-lg px-4 py-3 text-sm transition',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-4 border-t border-border px-6 py-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
            onClick={handleLeaveProject}
          >
            <LogOut className="h-4 w-4" />
            프로젝트 나가기
          </button>

          <div className="space-y-2 text-xs text-muted-foreground">
            <div>
              {/* 상태 받아오기 필요 */}
              <p className="uppercase">로그인 ID</p>  
              <p className="mt-1 truncate text-foreground">{loginUserId}</p>
            </div>
            <div>
              <p className="uppercase">현재 프로젝트</p>
              <p className="mt-1 truncate text-foreground">
                {currentProjectName}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
