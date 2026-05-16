import { NavLink, Outlet } from 'react-router-dom';

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
    label: '액션 아이템',
    path: '/actions',
  },
  {
    label: '제안',
    path: '/suggestions',
  },
];

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="flex w-60 flex-col border-r border-border bg-sidebar">
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

        <div className="border-t border-border px-6 py-4">
          <p className="text-xs uppercase text-muted-foreground">
            사용자 명
          </p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
