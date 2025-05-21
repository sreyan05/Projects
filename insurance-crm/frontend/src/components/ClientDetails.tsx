import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
} from '@mui/material';
import api, { Client, Policy, PolicyType } from '../services/api';

// Helper function to safely format numbers
const formatCurrency = (value: number | undefined | null): string => {
  if (value == null) return '$0';
  return `$${value.toLocaleString()}`;
};

// Helper function to safely format dates
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
};

// Helper function to safely format policy types
const formatPolicyType = (policyType: PolicyType | undefined | null): string => {
  if (!policyType) return 'Unknown Policy Type';
  try {
    return policyType.replace(/_/g, ' ');
  } catch (error) {
    return String(policyType);
  }
};

const ClientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadClient(Number(id));
    }
  }, [id]);

  const loadClient = async (clientId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getClient(clientId);
      setClient(response.data);
    } catch (error) {
      console.error('Error loading client:', error);
      setError('Failed to load client details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!client) {
    return <Typography>No client data found</Typography>;
  }

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Client Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">
                  Name: {client.firstName} {client.lastName}
                </Typography>
                <Typography variant="subtitle1">
                  Email: {client.email || 'N/A'}
                </Typography>
                <Typography variant="subtitle1">
                  Phone: {client.phone || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">
                  Date of Birth: {formatDate(client.dateOfBirth)}
                </Typography>
                <Typography variant="subtitle1">
                  Occupation: {client.occupation || 'N/A'}
                </Typography>
                <Typography variant="subtitle1">
                  Annual Income: {formatCurrency(client.annualIncome)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  Address: {client.address || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Grid container justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">Policies</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/clients/${client.id}/policies/add`)}
              >
                Add New Policy
              </Button>
            </Grid>
            <Grid container spacing={2}>
              {client.policies && client.policies.length > 0 ? (
                client.policies.map((policy: Policy) => (
                  <Grid item xs={12} md={6} key={policy.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {formatPolicyType(policy.policyType)}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography>
                          Coverage Amount: {formatCurrency(policy.coverageAmount)}
                        </Typography>
                        <Typography>
                          Premium Amount: {formatCurrency(policy.premiumAmount)}
                        </Typography>
                        <Typography>
                          Start Date: {formatDate(policy.startDate)}
                        </Typography>
                        {policy.endDate && (
                          <Typography>
                            End Date: {formatDate(policy.endDate)}
                          </Typography>
                        )}
                        <Typography>
                          Beneficiary: {policy.beneficiaryName || 'N/A'} ({policy.beneficiaryRelation || 'N/A'})
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          color="primary"
                          onClick={() => navigate(`/clients/${client.id}/policies/${policy.id}/edit`)}
                        >
                          Edit Policy
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body1" color="textSecondary" align="center">
                    No policies found. Click "Add New Policy" to create one.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default ClientDetails; 