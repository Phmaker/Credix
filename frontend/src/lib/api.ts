import axios from "axios";

import { getAccessToken } from "@/lib/auth";
import type {
  Account,
  Customer,
  LoanSimulation,
  RegisterResponse,
  TokenResponse,
  Transaction,
} from "@/lib/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1",
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function register(payload: {
  username: string;
  password: string;
  full_name: string;
  document: string;
}) {
  const { data } = await api.post<RegisterResponse>("/auth/register/", payload);
  return data;
}

export async function login(payload: { username: string; password: string }) {
  const { data } = await api.post<TokenResponse>("/auth/token/", payload);
  return data;
}

export async function getMe() {
  const { data } = await api.get<Customer>("/customers/me/");
  return data;
}

export async function getAccount() {
  const { data } = await api.get<Account>("/accounts/me/");
  return data;
}

export async function getStatement() {
  const { data } = await api.get<Transaction[]>("/transactions/statement/");
  return data;
}

export async function createDeposit(payload: { amount: number; description?: string }) {
  const { data } = await api.post<Transaction>("/transactions/deposit/", payload);
  return data;
}

export async function createPix(payload: {
  destination_agency: string;
  destination_account_number: string;
  amount: number;
  description?: string;
}) {
  const { data } = await api.post<Transaction>("/transactions/pix/", payload);
  return data;
}

export async function createInternalTransfer(payload: {
  destination_agency: string;
  destination_account_number: string;
  amount: number;
  description?: string;
}) {
  const { data } = await api.post<Transaction>("/transactions/transfer/internal/", payload);
  return data;
}

export async function createExternalTransfer(payload: {
  bank_code: string;
  agency: string;
  account_number: string;
  amount: number;
  description?: string;
}) {
  const { data } = await api.post<Transaction>("/transactions/transfer/external/", payload);
  return data;
}

export async function simulateLoan(payload: { principal: number; months: number }) {
  const { data } = await api.post<LoanSimulation>("/loans/simulate/", payload);
  return data;
}

export async function creditLoan(payload: { amount: number }) {
  const { data } = await api.post<Transaction>("/loans/credit/", payload);
  return data;
}

export { api };
