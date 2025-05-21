import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <AccountBalanceIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Life Insurance CRM
        </Typography>
        <Button
          color="inherit"
          component={RouterLink}
          to="/"
        >
          Clients
        </Button>
        <Button
          color="inherit"
          component={RouterLink}
          to="/clients/add"
        >
          Add Client
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 