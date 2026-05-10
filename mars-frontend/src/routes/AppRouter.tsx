import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Landing from '../pages/Landing';
import Dashboard from '../pages/DashBoard';
import MeetingInput from '../pages/MeetingInput';
import ActionItems from '../pages/ActionItems';
import Suggestions from '../pages/Suggestions';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Landing,
  },
  {
    path: '/dashboard',
    Component: Dashboard,
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
]);

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;