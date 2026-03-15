import axios from 'axios';

const API_URL = 'https://expense-tracker-api-w29w.onrender.com/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username: string, password: string) => {
  const response = await client.post('/token/', { username, password });
  localStorage.setItem('access_token', response.data.access);
  localStorage.setItem('refresh_token', response.data.refresh);
  return response.data;
};

export const register = async (username: string, email: string, password: string) => {
  const response = await client.post('/users/register/', { username, email, password });
  return response.data;
};

export const getExpenses = async () => {
  const response = await client.get('/expenses/');
  return response.data;
};

export const createExpense = async (data: {
  title: string;
  amount: string;
  date: string;
  note?: string;
  category?: number;
}) => {
  const response = await client.post('/expenses/', data);
  return response.data;
};

export const deleteExpense = async (id: number) => {
  await client.delete(`/expenses/${id}/`);
};

export const getCategories = async () => {
  const response = await client.get('/categories/');
  return response.data;
};

export default client;