import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export interface Client {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  occupation: string;
  annualIncome: number;
  policies?: Policy[];
}

export interface Policy {
  id?: number;
  policyType: PolicyType;
  coverageAmount: number;
  premiumAmount?: number;
  startDate: string; // Format: YYYY-MM-DD
  endDate?: string; // Format: YYYY-MM-DD
  termYears?: number;
  beneficiaryName: string;
  beneficiaryRelation: string;
  cashValue?: number;
  investmentComponent?: number;
  interestRate?: number;
  convertible?: boolean;
}

export enum PolicyType {
  TERM_LIFE = 'TERM_LIFE',
  WHOLE_LIFE = 'WHOLE_LIFE',
  UNIVERSAL_LIFE = 'UNIVERSAL_LIFE',
  VARIABLE_LIFE = 'VARIABLE_LIFE',
  INDEXED_UNIVERSAL_LIFE = 'INDEXED_UNIVERSAL_LIFE',
  FINAL_EXPENSE = 'FINAL_EXPENSE',
  GROUP_LIFE = 'GROUP_LIFE'
}

const api = {
  // Client endpoints
  getClients: () => axios.get<Client[]>(`${API_BASE_URL}/clients`),
  getClient: (id: number) => axios.get<Client>(`${API_BASE_URL}/clients/${id}`),
  createClient: (client: Client) => axios.post<Client>(`${API_BASE_URL}/clients`, client),

  // Policy endpoints
  createPolicy: (clientId: number, policy: Omit<Policy, 'id' | 'endDate' | 'premiumAmount'>) =>
    axios.post<Policy>(`${API_BASE_URL}/clients/${clientId}/policies`, policy),
  updatePolicy: (id: number, policy: Policy) =>
    axios.put<Policy>(`${API_BASE_URL}/policies/${id}`, policy),
  calculatePremium: (clientId: number, policy: Omit<Policy, 'id' | 'endDate' | 'premiumAmount'>) =>
    axios.post<number>(`${API_BASE_URL}/calculate-premium?clientId=${clientId}`, policy),
};

export default api; 