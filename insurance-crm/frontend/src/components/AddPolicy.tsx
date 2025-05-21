import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Alert,
  Snackbar,
} from '@mui/material';
import api, { Policy, PolicyType } from '../services/api';

interface PolicyFormData extends Omit<Policy, 'id' | 'endDate' | 'premiumAmount'> {
  id?: number;
  endDate?: string;
  premiumAmount?: number;
}

const AddPolicy: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [estimatedPremium, setEstimatedPremium] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);

  useEffect(() => {
    // Validate and set client ID
    if (!id || isNaN(Number(id))) {
      setError('Invalid client ID');
      return;
    }
    setClientId(Number(id));
  }, [id]);

  const [formData, setFormData] = useState<PolicyFormData>({
    policyType: PolicyType.TERM_LIFE,
    coverageAmount: 0,
    startDate: new Date().toISOString().split('T')[0],
    termYears: 10,
    beneficiaryName: '',
    beneficiaryRelation: '',
    convertible: false,
    cashValue: 0,
    investmentComponent: 0,
    interestRate: 0,
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['coverageAmount', 'termYears', 'cashValue', 'investmentComponent', 'interestRate'].includes(name)
        ? Number(value) || 0
        : value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<PolicyType | string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'policyType' ? value as PolicyType : name === 'convertible' ? value === 'true' : value,
    }));
  };

  const calculatePremium = useCallback(async () => {
    if (!clientId) return;
    try {
      const response = await api.calculatePremium(clientId, {
        ...formData,
        startDate: formData.startDate,
      });
      setEstimatedPremium(response.data);
    } catch (error: any) {
      console.error('Error calculating premium:', error);
      setError(error.response?.data?.message || 'Failed to calculate premium. Please try again.');
    }
  }, [clientId, formData]);

  useEffect(() => {
    if (formData.coverageAmount > 0 && formData.policyType && clientId) {
      calculatePremium();
    }
  }, [calculatePremium, clientId]);

  const validateForm = (): boolean => {
    if (!clientId) {
      setError('Invalid client ID');
      return false;
    }
    if (!formData.coverageAmount || formData.coverageAmount <= 0) {
      setError('Coverage amount must be greater than 0');
      return false;
    }
    if (!formData.startDate) {
      setError('Start date is required');
      return false;
    }
    if (!formData.beneficiaryName?.trim()) {
      setError('Beneficiary name is required');
      return false;
    }
    if (!formData.beneficiaryRelation?.trim()) {
      setError('Beneficiary relation is required');
      return false;
    }
    if (formData.policyType === PolicyType.TERM_LIFE) {
      if (!formData.termYears || formData.termYears <= 0) {
        setError('Term years must be greater than 0 for Term Life policies');
        return false;
      }
    }
    if (formData.policyType === PolicyType.UNIVERSAL_LIFE) {
      if (formData.interestRate === undefined || formData.interestRate < 0) {
        setError('Interest rate is required for Universal Life policies');
        return false;
      }
    }
    if (formData.policyType === PolicyType.VARIABLE_LIFE) {
      if (formData.investmentComponent === undefined || formData.investmentComponent <= 0) {
        setError('Investment component is required for Variable Life policies');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!clientId || !validateForm()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare the policy data with proper types
      const policyData = {
        policyType: formData.policyType,
        coverageAmount: formData.coverageAmount,
        startDate: formData.startDate,
        beneficiaryName: formData.beneficiaryName.trim(),
        beneficiaryRelation: formData.beneficiaryRelation.trim(),
        // Only include optional fields if they are relevant for the policy type
        ...(formData.policyType === PolicyType.TERM_LIFE && {
          termYears: formData.termYears,
          convertible: formData.convertible
        }),
        ...([PolicyType.WHOLE_LIFE, PolicyType.UNIVERSAL_LIFE].includes(formData.policyType) && {
          cashValue: formData.cashValue || undefined
        }),
        ...(formData.policyType === PolicyType.VARIABLE_LIFE && {
          investmentComponent: formData.investmentComponent || undefined
        }),
        ...(formData.policyType === PolicyType.UNIVERSAL_LIFE && {
          interestRate: formData.interestRate || undefined
        })
      };

      // Clear console and add visible separator
      console.clear();
      console.log('='.repeat(50));
      console.log('POLICY CREATION ATTEMPT');
      console.log('='.repeat(50));
      
      // Log the policy data in a formatted way
      console.log('Client ID:', clientId);
      console.log('Policy Type:', policyData.policyType);
      console.log('Coverage Amount:', policyData.coverageAmount);
      console.log('Start Date:', policyData.startDate);
      console.log('Beneficiary:', `${policyData.beneficiaryName} (${policyData.beneficiaryRelation})`);
      
      // Log policy-type specific fields
      if (policyData.policyType === PolicyType.TERM_LIFE) {
        console.log('Term Years:', policyData.termYears);
        console.log('Convertible:', policyData.convertible);
      }
      if ([PolicyType.WHOLE_LIFE, PolicyType.UNIVERSAL_LIFE].includes(policyData.policyType)) {
        console.log('Cash Value:', policyData.cashValue);
      }
      if (policyData.policyType === PolicyType.VARIABLE_LIFE) {
        console.log('Investment Component:', policyData.investmentComponent);
      }
      if (policyData.policyType === PolicyType.UNIVERSAL_LIFE) {
        console.log('Interest Rate:', policyData.interestRate);
      }

      console.log('\nFull Policy Data:', policyData);
      
      const response = await api.createPolicy(clientId, policyData);
      
      console.log('\nAPI Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      if (response.data) {
        navigate(`/clients/${clientId}`);
      } else {
        throw new Error('No data returned from policy creation');
      }
    } catch (error: any) {
      console.error('\nERROR DETAILS:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Error Message:', error.message);
      console.error('Response Data:', error.response?.data);
      console.error('Full Error:', error);
      
      setError(error.response?.data?.message || 'Failed to create policy. Please try again.');
    } finally {
      setIsSubmitting(false);
      console.log('='.repeat(50));
    }
  };

  // If client ID is invalid, show error message
  if (!clientId) {
    return (
      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" color="error" gutterBottom>
          Invalid Client ID
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Return to Client List
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Add New Policy
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Policy Type</InputLabel>
              <Select
                name="policyType"
                value={formData.policyType}
                onChange={handleSelectChange}
                label="Policy Type"
              >
                {Object.values(PolicyType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="coverageAmount"
              label="Coverage Amount"
              type="number"
              value={formData.coverageAmount}
              onChange={handleTextChange}
              inputProps={{ min: 0 }}
              error={formData.coverageAmount <= 0}
              helperText={formData.coverageAmount <= 0 ? 'Coverage amount must be greater than 0' : ''}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="startDate"
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={handleTextChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {formData.policyType === PolicyType.TERM_LIFE && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="termYears"
                  label="Term (Years)"
                  type="number"
                  value={formData.termYears}
                  onChange={handleTextChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Convertible</InputLabel>
                  <Select
                    name="convertible"
                    value={formData.convertible ? 'true' : 'false'}
                    onChange={handleSelectChange}
                    label="Convertible"
                  >
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          {[PolicyType.WHOLE_LIFE, PolicyType.UNIVERSAL_LIFE].includes(formData.policyType as PolicyType) && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="cashValue"
                label="Cash Value"
                type="number"
                value={formData.cashValue}
                onChange={handleTextChange}
              />
            </Grid>
          )}

          {formData.policyType === PolicyType.VARIABLE_LIFE && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="investmentComponent"
                label="Investment Component"
                type="number"
                value={formData.investmentComponent}
                onChange={handleTextChange}
              />
            </Grid>
          )}

          {formData.policyType === PolicyType.UNIVERSAL_LIFE && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="interestRate"
                label="Interest Rate (%)"
                type="number"
                value={formData.interestRate}
                onChange={handleTextChange}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="beneficiaryName"
              label="Beneficiary Name"
              value={formData.beneficiaryName}
              onChange={handleTextChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="beneficiaryRelation"
              label="Beneficiary Relation"
              value={formData.beneficiaryRelation}
              onChange={handleTextChange}
            />
          </Grid>

          {estimatedPremium !== null && (
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                Estimated Monthly Premium: ${estimatedPremium.toFixed(2)}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isSubmitting || !formData.beneficiaryName || !formData.beneficiaryRelation || formData.coverageAmount <= 0}
            >
              {isSubmitting ? 'Creating Policy...' : 'Create Policy'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AddPolicy; 