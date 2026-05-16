import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import AppLayout from '../layouts/AppLayout';

import Landing from '../pages/Landing';
import Dashboard from '../pages/DashBoard';
import MeetingInput from '../pages/MeetingInput';
import Meetings from '../pages/Meetings';
import ActionItems from '../pages/ActionItems';
import Suggestions from '../pages/Suggestions';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Landing,
  },
  {
    Component: AppLayout,
    children: [
      {
        path: '/dashboard',
        Component: Dashboard,
      },
      {
        path: '/meetings',
        Component: Meetings,
      },
      {
        path: '/meeting/new',
        Component: MeetingInput,
      },
      {
        path: '/actions',
        Component: ActionItems,
      },
      {
        path: '/suggestions',
        Component: Suggestions,
      },
    ],
  },
]);

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
