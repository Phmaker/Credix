"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRightLeft, CircleDollarSign, LogOut, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ComponentType, type FormEventHandler, type ReactNode } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { toast } from "sonner";

import {
  createDeposit,
  createExternalTransfer,
  createInternalTransfer,
  createPix,
  creditLoan,
  getAccount,
  getMe,
  getStatement,
  simulateLoan,
} from "@/lib/api";
import { clearTokens, getAccessToken } from "@/lib/auth";
import {
  type DepositInput,
  depositSchema,
  type ExternalTransferInput,
  externalTransferSchema,
  type LoanCreditInput,
  loanCreditSchema,
  type LoanSimulationInput,
  loanSimulationSchema,
  type PixInput,
  pixSchema,
} from "@/lib/schemas";

type TabKey = "overview" | "pix" | "transfer" | "deposit" | "loans" | "statement";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabKey>("overview");

  useEffect(() => {
    const token = getAccessToken();
    if (!token) router.replace("/auth/login");
  }, [router]);

  const meQuery = useQuery({ queryKey: ["me"], queryFn: getMe });
  const accountQuery = useQuery({ queryKey: ["account"], queryFn: getAccount });
  const statementQuery = useQuery({ queryKey: ["statement"], queryFn: getStatement });

  const refreshData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["me"] }),
      queryClient.invalidateQueries({ queryKey: ["account"] }),
      queryClient.invalidateQueries({ queryKey: ["statement"] }),
    ]);
  };

  const money = useMemo(
    () => (value?: string | null) => Number(value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    [],
  );

  const pixForm = useForm<PixInput>({ resolver: zodResolver(pixSchema) });
  const internalTransferForm = useForm<PixInput>({ resolver: zodResolver(pixSchema) });
  const externalTransferForm = useForm<ExternalTransferInput>({ resolver: zodResolver(externalTransferSchema) });
  const depositForm = useForm<DepositInput>({ resolver: zodResolver(depositSchema) });
  const simulateLoanForm = useForm<LoanSimulationInput>({ resolver: zodResolver(loanSimulationSchema) });
  const creditLoanForm = useForm<LoanCreditInput>({ resolver: zodResolver(loanCreditSchema) });

  const [loanResult, setLoanResult] = useState<{
    monthly_payment: string;
    total_amount: string;
    monthly_interest_rate: string;
  } | null>(null);

  const pixMutation = useMutation({
    mutationFn: createPix,
    onSuccess: async () => {
      toast.success("Pix enviado.");
      pixForm.reset();
      await refreshData();
    },
    onError: () => toast.error("Erro ao enviar Pix."),
  });

  const internalTransferMutation = useMutation({
    mutationFn: createInternalTransfer,
    onSuccess: async () => {
      toast.success("Transferência interna enviada.");
      internalTransferForm.reset();
      await refreshData();
    },
    onError: () => toast.error("Erro na transferência interna."),
  });

  const externalTransferMutation = useMutation({
    mutationFn: createExternalTransfer,
    onSuccess: async () => {
      toast.success("Transferência externa enviada.");
      externalTransferForm.reset();
      await refreshData();
    },
    onError: () => toast.error("Erro na transferência externa."),
  });

  const depositMutation = useMutation({
    mutationFn: createDeposit,
    onSuccess: async () => {
      toast.success("Depósito realizado.");
      depositForm.reset();
      await refreshData();
    },
    onError: () => toast.error("Erro ao realizar depósito."),
  });

  const simulateLoanMutation = useMutation({
    mutationFn: simulateLoan,
    onSuccess: (data) => {
      setLoanResult({
        monthly_payment: data.monthly_payment,
        total_amount: data.total_amount,
        monthly_interest_rate: data.monthly_interest_rate,
      });
      toast.success("Simulação concluída.");
    },
    onError: () => toast.error("Erro ao simular empréstimo."),
  });

  const creditLoanMutation = useMutation({
    mutationFn: creditLoan,
    onSuccess: async () => {
      toast.success("Empréstimo creditado.");
      creditLoanForm.reset();
      await refreshData();
    },
    onError: () => toast.error("Erro ao creditar empréstimo."),
  });

  if (meQuery.isLoading || accountQuery.isLoading) {
    return <main className="mx-auto w-full max-w-6xl p-6">Carregando...</main>;
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
      <header className="card flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-slate-500">Bem-vindo(a)</p>
          <h1 className="text-2xl font-bold">{meQuery.data?.full_name}</h1>
          <p className="text-sm text-slate-600">
            Ag. {accountQuery.data?.agency} | Conta {accountQuery.data?.account_number}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
            <p className="text-xs text-emerald-700">Saldo disponível</p>
            <p className="text-xl font-bold text-emerald-700">{money(accountQuery.data?.balance)}</p>
          </div>
          <button
            className="btn-secondary inline-flex items-center gap-2"
            onClick={() => {
              clearTokens();
              router.push("/auth/login");
            }}
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2">
        {[
          ["overview", "Visão geral"],
          ["pix", "Pix"],
          ["transfer", "Transferências"],
          ["deposit", "Depósito"],
          ["loans", "Empréstimos"],
          ["statement", "Extrato"],
        ].map(([value, label]) => (
          <button
            key={value}
            className={tab === value ? "btn-primary" : "btn-secondary"}
            onClick={() => setTab(value as TabKey)}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "overview" && (
        <section className="grid gap-4 md:grid-cols-3">
          <Card icon={Wallet} title="Saldo" value={money(accountQuery.data?.balance)} />
          <Card icon={CircleDollarSign} title="Última movimentação" value={statementQuery.data?.[0] ? money(statementQuery.data[0].amount) : "Sem dados"} />
          <Card icon={ArrowRightLeft} title="Total de transações" value={String(statementQuery.data?.length ?? 0)} />
        </section>
      )}

      {tab === "pix" && (
        <FormCard
          title="Enviar Pix"
          onSubmit={pixForm.handleSubmit((values) =>
            pixMutation.mutate({
              ...values,
              amount: Number(values.amount),
            }),
          )}
          loading={pixMutation.isPending}
        >
          <Input label="Agência destino" register={pixForm.register("destination_agency")} error={pixForm.formState.errors.destination_agency?.message} />
          <Input
            label="Conta destino"
            register={pixForm.register("destination_account_number")}
            error={pixForm.formState.errors.destination_account_number?.message}
          />
          <Input label="Valor" type="number" step="0.01" register={pixForm.register("amount")} error={pixForm.formState.errors.amount?.message} />
          <Input label="Descrição" register={pixForm.register("description")} error={pixForm.formState.errors.description?.message} />
        </FormCard>
      )}

      {tab === "transfer" && (
        <section className="grid gap-4 md:grid-cols-2">
          <FormCard
            title="Transferência interna"
            onSubmit={internalTransferForm.handleSubmit((values) =>
              internalTransferMutation.mutate({
                ...values,
                amount: Number(values.amount),
              }),
            )}
            loading={internalTransferMutation.isPending}
          >
            <Input
              label="Agência destino"
              register={internalTransferForm.register("destination_agency")}
              error={internalTransferForm.formState.errors.destination_agency?.message}
            />
            <Input
              label="Conta destino"
              register={internalTransferForm.register("destination_account_number")}
              error={internalTransferForm.formState.errors.destination_account_number?.message}
            />
            <Input
              label="Valor"
              type="number"
              step="0.01"
              register={internalTransferForm.register("amount")}
              error={internalTransferForm.formState.errors.amount?.message}
            />
          </FormCard>

          <FormCard
            title="Transferência externa"
            onSubmit={externalTransferForm.handleSubmit((values) =>
              externalTransferMutation.mutate({
                ...values,
                amount: Number(values.amount),
              }),
            )}
            loading={externalTransferMutation.isPending}
          >
            <Input label="Código do banco" register={externalTransferForm.register("bank_code")} error={externalTransferForm.formState.errors.bank_code?.message} />
            <Input label="Agência" register={externalTransferForm.register("agency")} error={externalTransferForm.formState.errors.agency?.message} />
            <Input
              label="Conta"
              register={externalTransferForm.register("account_number")}
              error={externalTransferForm.formState.errors.account_number?.message}
            />
            <Input
              label="Valor"
              type="number"
              step="0.01"
              register={externalTransferForm.register("amount")}
              error={externalTransferForm.formState.errors.amount?.message}
            />
          </FormCard>
        </section>
      )}

      {tab === "deposit" && (
        <FormCard
          title="Realizar depósito"
          onSubmit={depositForm.handleSubmit((values) =>
            depositMutation.mutate({
              ...values,
              amount: Number(values.amount),
            }),
          )}
          loading={depositMutation.isPending}
        >
          <Input label="Valor" type="number" step="0.01" register={depositForm.register("amount")} error={depositForm.formState.errors.amount?.message} />
          <Input label="Descrição" register={depositForm.register("description")} error={depositForm.formState.errors.description?.message} />
        </FormCard>
      )}

      {tab === "loans" && (
        <section className="grid gap-4 md:grid-cols-2">
          <FormCard
            title="Simulação de empréstimo"
            onSubmit={simulateLoanForm.handleSubmit((values) =>
              simulateLoanMutation.mutate({
                principal: Number(values.principal),
                months: Number(values.months),
              }),
            )}
            loading={simulateLoanMutation.isPending}
          >
            <Input
              label="Valor desejado"
              type="number"
              step="0.01"
              register={simulateLoanForm.register("principal")}
              error={simulateLoanForm.formState.errors.principal?.message}
            />
            <Input label="Meses" type="number" register={simulateLoanForm.register("months")} error={simulateLoanForm.formState.errors.months?.message} />
            {loanResult && (
              <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                <p>Parcela mensal: {money(loanResult.monthly_payment)}</p>
                <p>Total: {money(loanResult.total_amount)}</p>
                <p>Taxa mensal: {loanResult.monthly_interest_rate}%</p>
              </div>
            )}
          </FormCard>

          <FormCard
            title="Creditar empréstimo"
            onSubmit={creditLoanForm.handleSubmit((values) =>
              creditLoanMutation.mutate({
                amount: Number(values.amount),
              }),
            )}
            loading={creditLoanMutation.isPending}
          >
            <Input
              label="Valor para crédito"
              type="number"
              step="0.01"
              register={creditLoanForm.register("amount")}
              error={creditLoanForm.formState.errors.amount?.message}
            />
          </FormCard>
        </section>
      )}

      {tab === "statement" && (
        <section className="card overflow-x-auto">
          <h2 className="mb-4 text-lg font-semibold">Extrato</h2>
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Valor</th>
                <th className="px-3 py-2">Descrição</th>
                <th className="px-3 py-2">Origem/Destino</th>
              </tr>
            </thead>
            <tbody>
              {statementQuery.data?.map((tx) => (
                <tr key={tx.id} className="border-b">
                  <td className="px-3 py-2">{new Date(tx.created_at).toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-2">{tx.transaction_type}</td>
                  <td className="px-3 py-2">{money(tx.amount)}</td>
                  <td className="px-3 py-2">{tx.description || "-"}</td>
                  <td className="px-3 py-2">
                    {tx.destination?.agency && tx.destination?.account_number
                      ? `${tx.destination.agency}/${tx.destination.account_number}`
                      : tx.external_bank_code
                        ? `${tx.external_bank_code} - ${tx.external_agency}/${tx.external_account}`
                        : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}

function Card({
  icon: Icon,
  title,
  value,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: string;
}) {
  return (
    <article className="card">
      <div className="mb-3 inline-flex rounded-xl bg-emerald-50 p-2 text-emerald-700">
        <Icon size={20} />
      </div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </article>
  );
}

function FormCard({
  title,
  children,
  onSubmit,
  loading,
}: {
  title: string;
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  loading: boolean;
}) {
  return (
    <form className="card space-y-3" onSubmit={onSubmit}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Processando..." : "Confirmar"}
      </button>
    </form>
  );
}

function Input({
  label,
  error,
  type = "text",
  step,
  register,
}: {
  label: string;
  error?: string;
  type?: HTMLInputElement["type"];
  step?: string;
  register: UseFormRegisterReturn;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <input className="input" type={type} step={step} {...register} />
      <p className="min-h-4 text-xs text-red-500">{error}</p>
    </div>
  );
}
