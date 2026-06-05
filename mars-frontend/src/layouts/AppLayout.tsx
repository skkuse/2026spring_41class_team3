import {
  CalendarDays,
  History,
  LayoutDashboard,
  Lightbulb,
  ListTodo,
  LogOut,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getProject } from '../lib/api';
import { clearStoredUserIdentity } from '../lib/authCookie';
import { clearStoredProjectContext, getStoredProjectContext, setStoredProjectContext } from '../lib/projectContext';

const navItems = [
  {
    label: '대시보드',
    path: '/dashboard',
    Icon: LayoutDashboard,
  },
  {
    label: '회의',
    path: '/meetings',
    Icon: CalendarDays,
  },
  {
    label: '지난 회의',
    path: '/meetings/past',
    Icon: History,
  },
  {
    label: '액션 아이템',
    path: '/actions',
    Icon: ListTodo,
  },
  {
    label: '제안',
    path: '/suggestions',
    Icon: Lightbulb,
  },
  {
    label: '스타일',
    path: '/style-guide',
    Icon: Palette,
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const currentProjectName = resolvedProjectName ?? fallbackProjectName;
  const SidebarToggleIcon = isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose;

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
    clearStoredUserIdentity();
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <aside
        className={[
          'flex h-full shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-300',
          isSidebarCollapsed ? 'w-20' : 'w-60',
        ].join(' ')}
      >
        <div
          className={[
            'flex border-b border-border py-5',
            isSidebarCollapsed ? 'justify-center px-3' : 'items-start justify-between px-6',
          ].join(' ')}
        >
          {!isSidebarCollapsed && (
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold tracking-wide text-primary">
                MARS
              </h1>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                minutes to action & review system
              </p>
            </div>
          )}

          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            aria-label={isSidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
            title={isSidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
          >
            <SidebarToggleIcon className="h-4 w-4" />
          </button>
        </div>

        <nav
          className={[
            'flex flex-1 flex-col gap-2 py-5',
            isSidebarCollapsed ? 'px-3' : 'px-4',
          ].join(' ')}
        >
          {navItems.map((item) => {
            const { Icon } = item;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                aria-label={item.label}
                title={isSidebarCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  [
                    'flex items-center rounded-lg text-sm transition',
                    isSidebarCollapsed ? 'h-11 justify-center px-0' : 'gap-3 px-4 py-3',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  ].join(' ')
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div
          className={[
            'space-y-4 border-t border-border py-4',
            isSidebarCollapsed ? 'px-3' : 'px-6',
          ].join(' ')}
        >
          <button
            type="button"
            className={[
              'flex w-full items-center justify-center rounded-lg border border-border bg-secondary text-sm text-muted-foreground transition hover:border-primary/50 hover:text-foreground',
              isSidebarCollapsed ? 'h-11 px-0' : 'gap-2 px-3 py-2',
            ].join(' ')}
            onClick={handleLeaveProject}
            aria-label="프로젝트 나가기"
            title={isSidebarCollapsed ? '프로젝트 나가기' : undefined}
          >
            <LogOut className="h-4 w-4" />
            {!isSidebarCollapsed && '프로젝트 나가기'}
          </button>

          {!isSidebarCollapsed && (
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
          )}
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
