import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3, "Username precisa ter no mínimo 3 caracteres."),
  password: z.string().min(8, "Senha precisa ter no mínimo 8 caracteres."),
  full_name: z.string().min(3, "Informe seu nome completo."),
  document: z.string().min(11, "Informe um CPF válido."),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Informe o username."),
  password: z.string().min(1, "Informe a senha."),
});

export const pixSchema = z.object({
  destination_agency: z.string().min(1, "Agência obrigatória."),
  destination_account_number: z.string().min(1, "Conta obrigatória."),
  amount: z.coerce.number().positive("Valor deve ser maior que zero."),
  description: z.string().optional(),
});

export const externalTransferSchema = z.object({
  bank_code: z.string().min(1, "Banco obrigatório."),
  agency: z.string().min(1, "Agência obrigatória."),
  account_number: z.string().min(1, "Conta obrigatória."),
  amount: z.coerce.number().positive("Valor deve ser maior que zero."),
  description: z.string().optional(),
});

export const depositSchema = z.object({
  amount: z.coerce.number().positive("Valor deve ser maior que zero."),
  description: z.string().optional(),
});

export const loanSimulationSchema = z.object({
  principal: z.coerce.number().positive("Valor deve ser maior que zero."),
  months: z.coerce
    .number()
    .int("Meses deve ser inteiro.")
    .min(1, "Mínimo 1 mês.")
    .max(360, "Máximo 360 meses."),
});

export const loanCreditSchema = z.object({
  amount: z.coerce.number().positive("Valor deve ser maior que zero."),
});

export type RegisterInput = z.input<typeof registerSchema>;
export type LoginInput = z.input<typeof loginSchema>;
export type PixInput = z.input<typeof pixSchema>;
export type ExternalTransferInput = z.input<typeof externalTransferSchema>;
export type DepositInput = z.input<typeof depositSchema>;
export type LoanSimulationInput = z.input<typeof loanSimulationSchema>;
export type LoanCreditInput = z.input<typeof loanCreditSchema>;
