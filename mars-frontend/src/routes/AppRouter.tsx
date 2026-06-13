import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from './ProtectedRoute';

import Landing from '../pages/Landing';
import Dashboard from '../pages/DashBoard';
import MeetingInput from '../pages/MeetingInput';
import Meetings from '../pages/Meetings';
import PastMeetings from '../pages/PastMeetings';
import ActionItems from '../pages/ActionItems';
import Suggestions from '../pages/Suggestions';
import StyleGuide from '../pages/StyleGuide';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Landing,
  },
  {
    Component: ProtectedRoute,
    children: [
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
            path: '/meetings/past',
            Component: PastMeetings,
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
          {
            path: '/style-guide',
            Component: StyleGuide,
          },
        ],
      },
    ],
  },
]);

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
