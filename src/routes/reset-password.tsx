import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Atur Ulang Kata Sandi — NOTE TABUNGAN" },
      { name: "description", content: "Buat kata sandi baru untuk akun NOTE TABUNGAN Anda." },
      { property: "og:title", content: "Atur Ulang Kata Sandi — NOTE TABUNGAN" },
      { property: "og:description", content: "Buat kata sandi baru untuk akun Anda." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  async function submit() {
    if (password.length < 6) {
      toast.error("Kata sandi minimal 6 karakter");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Kata sandi berhasil diperbarui");
    navigate({ to: "/" });
  }

  return (
    <main className="navy-pattern flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-3xl bg-white/95 p-6">
        <h1 className="text-lg font-semibold">Atur Ulang Kata Sandi</h1>
        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label>Kata Sandi Baru</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            onClick={submit}
            className="h-11 w-full rounded-xl bg-gold text-navy hover:bg-gold/90"
          >
            Simpan Kata Sandi
          </Button>
        </div>
      </div>
    </main>
  );
}
