"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { register } from "@/lib/api";
import { type RegisterInput, registerSchema } from "@/lib/schemas";

export default function OpenAccountPage() {
  const [cameraStatus, setCameraStatus] = useState<"idle" | "granted" | "blocked">("idle");
  const [isFaceValidating, setIsFaceValidating] = useState(false);
  const [faceValidated, setFaceValidated] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", full_name: "", document: "" },
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      toast.success("Conta criada com sucesso. Faça login para continuar.");
      stopCamera();
      form.reset();
    },
    onError: () => {
      toast.error("Não foi possível criar conta.");
    },
  });

  const progress = useMemo(() => {
    if (cameraStatus === "blocked") return 30;
    if (faceValidated) return 100;
    if (cameraStatus === "granted") return 70;
    return 30;
  }, [cameraStatus, faceValidated]);

  async function requestCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setCameraStatus("granted");
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraStatus("blocked");
      toast.error("Permissão da câmera negada.");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
  }

  function simulateFaceValidation() {
    if (cameraStatus !== "granted") return;
    setIsFaceValidating(true);
    setTimeout(() => {
      setIsFaceValidating(false);
      setFaceValidated(true);
      toast.success("Rosto validado com sucesso (simulação).");
    }, 2500);
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-10 md:grid-cols-2">
      <section className="card space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Abertura de conta Credix</h1>
          <p className="text-sm text-slate-600">Fluxo de onboarding com validação facial simulada.</p>
        </div>

        <div className="space-y-2">
          <div className="h-2 w-full rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-slate-500">Etapa de validação de identidade</p>
        </div>

        <div className="space-y-3">
          <button className="btn-primary w-full" type="button" onClick={requestCamera}>
            Permitir acesso à câmera
          </button>
          <button
            className="btn-secondary w-full"
            type="button"
            onClick={simulateFaceValidation}
            disabled={cameraStatus !== "granted" || isFaceValidating}
          >
            {isFaceValidating ? "Validando rosto..." : "Iniciar validação facial"}
          </button>
          {cameraStatus === "blocked" && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              Sem permissão da câmera não é possível avançar na abertura de conta.
            </p>
          )}
          {faceValidated && (
            <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">Identidade validada. Preencha os dados.</p>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border bg-slate-100">
          <video ref={videoRef} autoPlay muted playsInline className="h-56 w-full object-cover" />
        </div>
      </section>

      <section className="card">
        <h2 className="mb-4 text-xl font-semibold">Dados cadastrais</h2>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit((values) => {
            if (!faceValidated) {
              toast.error("Valide seu rosto antes de abrir conta.");
              return;
            }
            registerMutation.mutate(values);
          })}
        >
          <Field label="Nome completo" error={form.formState.errors.full_name?.message}>
            <input className="input" {...form.register("full_name")} />
          </Field>
          <Field label="CPF" error={form.formState.errors.document?.message}>
            <input className="input" {...form.register("document")} />
          </Field>
          <Field label="Username" error={form.formState.errors.username?.message}>
            <input className="input" {...form.register("username")} />
          </Field>
          <Field label="Senha" error={form.formState.errors.password?.message}>
            <input type="password" className="input" {...form.register("password")} />
          </Field>

          <button type="submit" disabled={registerMutation.isPending} className="btn-primary w-full">
            {registerMutation.isPending ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Já possui conta?{" "}
          <Link href="/auth/login" className="font-semibold text-emerald-600">
            Fazer login
          </Link>
        </p>
      </section>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
      <p className="min-h-4 text-xs text-red-500">{error}</p>
    </div>
  );
}
