import Link from "next/link";
import { BadgeCheck, Landmark, ShieldCheck, Zap } from "lucide-react";
import type { ComponentType } from "react";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-14">
      <section className="grid gap-8 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-10 text-white shadow-xl md:grid-cols-2">
        <div className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
            <BadgeCheck size={14} />
            Banco digital Credix
          </p>
          <h1 className="text-4xl font-bold leading-tight">Seu banco completo, com UX moderno e seguro.</h1>
          <p className="max-w-lg text-emerald-50">
            Abra sua conta, faça Pix, transferências, depósitos e simulações de empréstimo em uma experiência fluida.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/open-account" className="rounded-xl bg-white px-5 py-3 font-semibold text-emerald-700">
              Abrir conta
            </Link>
            <Link href="/auth/login" className="rounded-xl border border-white/40 px-5 py-3 font-semibold text-white">
              Entrar
            </Link>
          </div>
        </div>
        <div className="grid gap-3 rounded-2xl bg-black/15 p-6">
          <Feature icon={ShieldCheck} title="Segurança" description="Fluxo de acesso com token JWT e validação de dados com Zod." />
          <Feature icon={Zap} title="Rápido" description="Requisições com React Query e atualização instantânea das telas." />
          <Feature icon={Landmark} title="Completo" description="Pix, transferências, extrato, saldo e empréstimos integrados à API." />
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-white/10 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon size={18} className="text-emerald-100" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <p className="text-sm text-emerald-50">{description}</p>
    </div>
  );
}
