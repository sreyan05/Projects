import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
} from '@mui/material';
import api, { Client } from '../services/api';

const ClientList = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await api.getClients();
      console.log('API Response:', response); // Debug log
      
      // Ensure response.data is an array
      const clientsData = Array.isArray(response.data) ? response.data : [];
      setClients(clientsData);
      
      if (!Array.isArray(response.data)) {
        console.error('Expected array of clients but got:', response.data);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      setClients([]); // Set empty array on error
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Clients
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Occupation</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  {client.firstName} {client.lastName}
                </TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.occupation}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ClientList; 