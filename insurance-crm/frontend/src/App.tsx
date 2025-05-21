import React from 'react';
import { 
  Routes, 
  Route,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
  Outlet
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Navbar from './components/Navbar';
import ClientList from './components/ClientList';
import ClientDetails from './components/ClientDetails';
import AddClient from './components/AddClient';
import AddPolicy from './components/AddPolicy';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Layout component that includes the Navbar
const Layout = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Outlet />
    </Box>
  </Box>
);

// Create router with data router API
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route path="/" element={<ClientList />} />
      <Route path="/clients/add" element={<AddClient />} />
      <Route path="/clients/:id" element={<ClientDetails />} />
      <Route path="/clients/:id/policies/add" element={<AddPolicy />} />
    </Route>
  )
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
