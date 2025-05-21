import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Box,
  Alert,
} from '@mui/material';
import api, { Client } from '../services/api';

const AddClient = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Client, 'id' | 'policies'>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    occupation: '',
    annualIncome: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'annualIncome' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.dateOfBirth) {
        throw new Error('Please fill in all required fields');
      }

      // Create a copy of the form data for submission
      const clientData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth, // Already in YYYY-MM-DD format from the date input
        annualIncome: parseFloat(formData.annualIncome.toString()) || 0,
      };

      console.log('Submitting client data:', clientData);
      const response = await api.createClient(clientData);
      console.log('Server response:', response);
      
      if (response.data && response.data.id) {
        navigate(`/clients/${response.data.id}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating client:', error);
      setError(error instanceof Error ? error.message : 'Failed to create client');
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Add New Client
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleChange}
              error={!formData.firstName}
              helperText={!formData.firstName && "First name is required"}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              error={!formData.lastName}
              helperText={!formData.lastName && "Last name is required"}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!formData.email}
              helperText={!formData.email && "Email is required"}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="phone"
              label="Phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="dateOfBirth"
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!formData.dateOfBirth}
              helperText={!formData.dateOfBirth && "Date of birth is required"}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="address"
              label="Address"
              multiline
              rows={2}
              value={formData.address}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="occupation"
              label="Occupation"
              value={formData.occupation}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="annualIncome"
              label="Annual Income"
              type="number"
              value={formData.annualIncome}
              onChange={handleChange}
              inputProps={{ min: 0, step: 1000 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
            >
              Add Client
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default AddClient; 