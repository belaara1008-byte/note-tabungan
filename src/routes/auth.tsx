import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Landmark, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Masuk — NOTE TABUNGAN" },
      {
        name: "description",
        content: "Masuk atau daftar untuk mengelola tabungan, rekening, dan impian finansial Anda.",
      },
      { property: "og:title", content: "Masuk — NOTE TABUNGAN" },
      {
        property: "og:description",
        content: "Kelola tabungan multi-bank dan target impian dalam satu aplikasi.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    navigate({ to: "/" });
  }

  async function handleRegister() {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    if (data.session) {
      navigate({ to: "/" });
    } else {
      toast.success("Akun dibuat. Cek email Anda untuk konfirmasi.");
      setTab("login");
    }
  }

  async function handleReset() {
    if (!email) { toast.error("Isi email terlebih dahulu"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Tautan reset kata sandi telah dikirim");
  }

  return (
    <main className="navy-pattern flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Landmark className="h-10 w-10 text-gold" />
          <h1 className="mt-2 text-lg font-semibold tracking-[0.35em] text-gold">NOTE</h1>
          <p className="text-xs tracking-[0.45em] text-gold/80">TABUNGAN</p>
          <h2 className="mt-8 text-2xl font-semibold text-white">Selamat Datang Kembali</h2>
          <p className="mt-1 text-sm text-white/60">Kelola tabungan Anda dengan tenang</p>
        </div>

        <div className="mt-8 flex rounded-2xl bg-white/10 p-1">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
                tab === t ? "bg-gold text-navy" : "text-white/70"
              }`}
            >
              {t === "login" ? "Masuk" : "Daftar"}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {tab === "register" && (
            <Field icon={User} placeholder="Nama Lengkap" value={fullName} onChange={setFullName} />
          )}
          <Field
            icon={Mail}
            placeholder="Email"
            type="email"
            value={email}
            onChange={setEmail}
            label="Email"
          />
          <div>
            <label className="mb-1.5 block text-xs text-white/70">Kata Sandi / Password</label>
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 focus-within:ring-gold/60">
              <Lock className="h-4 w-4 shrink-0 text-gold/80" />
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              />
              <button type="button" onClick={() => setShow(!show)} aria-label="Tampilkan sandi">
                {show ? (
                  <EyeOff className="h-4 w-4 text-white/60" />
                ) : (
                  <Eye className="h-4 w-4 text-white/60" />
                )}
              </button>
            </div>
          </div>

          <Button
            onClick={tab === "login" ? handleLogin : handleRegister}
            disabled={loading}
            className="h-12 w-full rounded-2xl bg-gold text-sm font-semibold tracking-wide text-navy hover:bg-gold/90"
          >
            {tab === "login" ? "MASUK / LOGIN" : "DAFTAR AKUN"}
          </Button>

          {tab === "login" && (
            <div className="space-y-2 text-center text-sm">
              <button onClick={handleReset} className="text-gold/90 hover:text-gold">
                Lupa Kata Sandi?
              </button>
              <p className="text-white/60">
                Belum punya akun?{" "}
                <button onClick={() => setTab("register")} className="font-medium text-gold">
                  Daftar
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({
  icon: Icon,
  placeholder,
  value,
  onChange,
  type = "text",
  label,
}: {
  icon: typeof Mail;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  label?: string;
}) {
  return (
    <div>
      {label && <label className="mb-1.5 block text-xs text-white/70">{label}</label>}
      <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 focus-within:ring-gold/60">
        <Icon className="h-4 w-4 shrink-0 text-gold/80" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
        />
      </div>
    </div>
  );
}
