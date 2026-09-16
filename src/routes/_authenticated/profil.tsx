import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  CloudCheck,
  CreditCard,
  Download,
  KeyRound,
  LogOut,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAccounts, useDeleteAccount, useProfile, useTransactions } from "@/lib/db";
import { rupiah } from "@/lib/format";
import { AccountModal } from "@/components/AccountModal";
import { Avatar } from "@/components/Avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/profil")({
  head: () => ({
    meta: [
      { title: "Profil & Keamanan — NOTE TABUNGAN" },
      {
        name: "description",
        content: "Kelola rekening bank, ubah kata sandi, dan ekspor data transaksi Anda.",
      },
      { property: "og:title", content: "Profil & Keamanan — NOTE TABUNGAN" },
      {
        property: "og:description",
        content: "Pengaturan akun, keamanan, dan ekspor data tabungan.",
      },
    ],
  }),
  component: Profil,
});

function Profil() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: accounts = [] } = useAccounts();
  const { data: transactions = [] } = useTransactions();
  const del = useDeleteAccount();

  const [banks, setBanks] = useState(false);
  const [addAccount, setAddAccount] = useState(false);
  const [pwd, setPwd] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  async function changePassword() {
    if (newPassword.length < 6) {
      toast.error("Kata sandi minimal 6 karakter");
      return;
    }
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      ...({ current_password: currentPassword } as Record<string, string>),
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Kata sandi diperbarui");
    setPwd(false);
    setCurrentPassword("");
    setNewPassword("");
  }

  function exportCsv() {
    const rows = [
      ["Tanggal", "Tipe", "Kategori", "Catatan", "Bank", "Nominal"],
      ...transactions.map((t) => [
        t.occurred_at,
        t.type,
        t.category,
        t.note,
        accounts.find((a) => a.id === t.account_id)?.bank_name ?? "",
        String(t.amount),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "note-tabungan-transaksi.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data transaksi diunduh");
  }

  return (
    <div>
      <header className="navy-pattern rounded-b-[2rem] px-5 pb-8 pt-6 text-white">
        <h1 className="text-sm font-semibold tracking-[0.3em] text-gold">NOTE TABUNGAN</h1>
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/10 p-3">
          <div className="scale-125">
            <Avatar name={profile?.full_name ?? null} url={profile?.avatar_url ?? null} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {profile?.full_name || "Pengguna NOTE TABUNGAN"}
            </p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-income/20 px-2 py-0.5 text-[11px] text-income">
              <CloudCheck className="h-3 w-3" /> Cloud Synced
            </span>
          </div>
        </div>
      </header>

      <section className="space-y-3 px-5 pt-5">
        <h2 className="text-xs font-semibold tracking-widest text-muted-foreground">PROFIL</h2>

        <Row
          icon={CreditCard}
          title="Kelola Rekening Bank"
          subtitle="Tambah rekening & warna kartu"
          onClick={() => setBanks(true)}
        />
        <Row
          icon={KeyRound}
          title="Keamanan Kata Sandi"
          subtitle="Ubah kata sandi akun"
          onClick={() => setPwd(true)}
        />
        <Row
          icon={Download}
          title="Export Data Transaksi"
          subtitle="Unduh ringkasan CSV"
          onClick={exportCsv}
        />

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl bg-expense-soft px-4 py-3 text-left"
        >
          <LogOut className="h-5 w-5 shrink-0 text-expense" />
          <span className="text-sm font-semibold text-expense">Logout / Keluar</span>
        </button>
      </section>

      <Dialog open={banks} onOpenChange={setBanks}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle>Kelola Rekening Bank</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {accounts.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
                <span
                  className="h-8 w-8 shrink-0 rounded-full"
                  style={{ backgroundColor: a.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.bank_name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {a.account_number} · {rupiah(Number(a.balance))}
                  </p>
                </div>
                <button onClick={() => del.mutate(a.id)} aria-label="Hapus rekening">
                  <Trash2 className="h-4 w-4 text-expense" />
                </button>
              </div>
            ))}
            <Button
              onClick={() => {
                setBanks(false);
                setAddAccount(true);
              }}
              className="h-11 w-full rounded-xl bg-gold text-navy hover:bg-gold/90"
            >
              + Tambah Rekening
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={pwd} onOpenChange={setPwd}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle>Keamanan Kata Sandi</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Kata Sandi Saat Ini</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Kata Sandi Baru</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button
              onClick={changePassword}
              className="h-11 w-full rounded-xl bg-gold text-navy hover:bg-gold/90"
            >
              Perbarui Kata Sandi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AccountModal open={addAccount} onOpenChange={setAddAccount} />
    </div>
  );
}

function Row({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: typeof CreditCard;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="soft-card flex w-full items-center gap-3 px-4 py-3 text-left"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold-soft">
        <Icon className="h-4 w-4 text-gold" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{title}</span>
        <span className="block truncate text-[11px] text-muted-foreground">{subtitle}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}
