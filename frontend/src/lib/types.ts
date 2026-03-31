export type Account = {
  agency: string;
  account_number: string;
  balance: string;
  created_at: string;
};

export type Customer = {
  id: number;
  full_name: string;
  document: string;
  document_type: string;
  agency: string;
  account_number: string;
  balance: string;
  created_at: string;
};

export type AccountRef = {
  agency: string;
  account_number: string;
} | null;

export type Transaction = {
  id: number;
  transaction_type: "DEPOSIT" | "PIX" | "TRANSFER" | "LOAN_CREDIT" | string;
  amount: string;
  description: string;
  source: AccountRef;
  destination: AccountRef;
  external_bank_code: string | null;
  external_agency: string | null;
  external_account: string | null;
  created_at: string;
};

export type LoanSimulation = {
  id: number;
  principal: string;
  months: number;
  monthly_interest_rate: string;
  monthly_payment: string;
  total_amount: string;
  created_at: string;
};

export type RegisterResponse = {
  message: string;
  customer_id: number;
  agency: string;
  account_number: string;
};

export type TokenResponse = {
  access: string;
  refresh: string;
};
