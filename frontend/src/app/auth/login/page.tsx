"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { login } from "@/lib/api";
import { saveTokens } from "@/lib/auth";
import { type LoginInput, loginSchema } from "@/lib/schemas";

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const authMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      saveTokens(data.access, data.refresh);
      toast.success("Login realizado com sucesso.");
      router.push("/dashboard");
    },
    onError: () => {
      toast.error("Falha no login. Verifique usuário e senha.");
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-12">
      <section className="card w-full space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Entrar no Credix</h1>
          <p className="text-sm text-slate-600">Acesse sua conta para usar todos os serviços.</p>
        </div>

        <form className="space-y-4" onSubmit={form.handleSubmit((values) => authMutation.mutate(values))}>
          <div className="space-y-1">
            <label className="text-sm font-medium">Username</label>
            <input className="input" {...form.register("username")} />
            <p className="text-xs text-red-500">{form.formState.errors.username?.message}</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Senha</label>
            <input type="password" className="input" {...form.register("password")} />
            <p className="text-xs text-red-500">{form.formState.errors.password?.message}</p>
          </div>

          <button type="submit" disabled={authMutation.isPending} className="btn-primary w-full">
            {authMutation.isPending ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          Ainda não tem conta?{" "}
          <Link href="/open-account" className="font-semibold text-emerald-600">
            Abra agora
          </Link>
        </p>
      </section>
    </main>
  );
}
