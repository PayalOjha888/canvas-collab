import { createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Whiteboard from './pages/Whiteboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/whiteboard',
    element: <Whiteboard />,
  },
]);