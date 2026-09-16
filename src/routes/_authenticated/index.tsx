import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bell,
  Copy,
  Eye,
  EyeOff,
  Landmark,
  Minus,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { rupiah, shortDate } from "@/lib/format";
import { useAccounts, useGoals, useProfile, useTransactions } from "@/lib/db";
import { TransactionModal } from "@/components/TransactionModal";
import { AccountModal } from "@/components/AccountModal";
import { GoalModal } from "@/components/GoalModal";
import { Avatar } from "@/components/Avatar";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Beranda — NOTE TABUNGAN" },
      {
        name: "description",
        content: "Ringkasan total tabungan, rekening bank, dan transaksi terbaru Anda.",
      },
      { property: "og:title", content: "Beranda — NOTE TABUNGAN" },
      {
        property: "og:description",
        content: "Pantau saldo multi-bank dan progres impian dalam satu layar.",
      },
    ],
  }),
  component: Beranda,
});

function Beranda() {
  const { data: profile } = useProfile();
  const { data: accounts = [] } = useAccounts();
  const { data: transactions = [] } = useTransactions();
  const { data: goals = [] } = useGoals();

  const [hidden, setHidden] = useState(false);
  const [modal, setModal] = useState<"income" | "expense" | null>(null);
  const [addAccount, setAddAccount] = useState(false);
  const [addGoal, setAddGoal] = useState(false);
  const [active, setActive] = useState(0);

  const total = accounts.reduce((s, a) => s + Number(a.balance), 0);
  const todayKey = new Date().toISOString().slice(0, 10);

  const todayByAccount = useMemo(() => {
    const map: Record<string, { in: number; out: number }> = {};
    for (const t of transactions) {
      if (t.occurred_at.slice(0, 10) !== todayKey || !t.account_id) continue;
      const entry = (map[t.account_id] ??= { in: 0, out: 0 });
      if (t.type === "income") entry.in += Number(t.amount);
      else entry.out += Number(t.amount);
    }
    return map;
  }, [transactions, todayKey]);

  const goal = goals[0];
  const pct = goal
    ? Math.min(100, Math.round((Number(goal.saved_amount) / Number(goal.target_amount || 1)) * 100))
    : 0;

  return (
    <div>
      <header className="navy-pattern rounded-b-[2rem] px-5 pb-16 pt-6 text-white">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Landmark className="h-6 w-6 shrink-0 text-gold" />
            <h1 className="truncate text-sm font-semibold tracking-[0.3em] text-gold">
              NOTE TABUNGAN
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Bell className="h-5 w-5 text-white/80" />
            <Avatar name={profile?.full_name ?? null} url={profile?.avatar_url ?? null} />
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs text-white/60">Total Seluruh Tabungan</p>
          <div className="mt-1 flex items-center gap-3">
            <p className="text-3xl font-bold tracking-tight">
              {hidden ? "Rp ••••••••" : rupiah(total)}
            </p>
            <button onClick={() => setHidden(!hidden)} aria-label="Tampilkan saldo">
              {hidden ? (
                <EyeOff className="h-5 w-5 text-white/70" />
              ) : (
                <Eye className="h-5 w-5 text-white/70" />
              )}
            </button>
          </div>
        </div>
      </header>

      <section className="-mt-10 px-5">
        <div
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(Math.round(el.scrollLeft / (el.clientWidth || 1)));
          }}
        >
          {accounts.map((a) => {
            const today = todayByAccount[a.id] ?? { in: 0, out: 0 };
            return (
              <article
                key={a.id}
                className="w-full shrink-0 snap-center rounded-3xl p-5 text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${a.color}, #163C5E)` }}
              >
                <p className="text-[11px] uppercase tracking-widest text-white/50">
                  Pemilik Rekening
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="truncate text-base font-semibold">{a.holder_name}</p>
                  <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs">
                    {a.bank_name}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <p className="truncate font-mono text-sm text-white/80">{a.account_number}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(a.account_number);
                      toast.success("Nomor rekening disalin");
                    }}
                    aria-label="Salin nomor rekening"
                  >
                    <Copy className="h-4 w-4 text-gold" />
                  </button>
                </div>
                <p className="mt-3 text-2xl font-bold">
                  {hidden ? "Rp ••••••" : rupiah(Number(a.balance))}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-white/10 px-3 py-2">
                    <p className="text-white/60">Masuk Hari Ini</p>
                    <p className="font-semibold text-income">+ {rupiah(today.in)}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 px-3 py-2">
                    <p className="text-white/60">Keluar Hari Ini</p>
                    <p className="font-semibold text-expense">- {rupiah(today.out)}</p>
                  </div>
                </div>
              </article>
            );
          })}
          {accounts.length === 0 && (
            <div className="soft-card w-full shrink-0 p-6 text-center text-sm text-muted-foreground">
              Belum ada rekening. Tambahkan rekening pertama Anda.
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            {accounts.map((a, i) => (
              <span
                key={a.id}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-5 bg-gold" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setAddAccount(true)}
            className="text-xs font-medium text-navy-light"
          >
            + Tambah Rekening
          </button>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3 px-5">
        <button
          onClick={() => setModal("income")}
          className="flex items-center gap-3 rounded-2xl bg-income-soft px-4 py-3 text-left"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-income/15">
            <Plus className="h-4 w-4 text-income" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-foreground">Saldo Masuk</span>
            <span className="block text-[11px] text-muted-foreground">Catat pemasukan</span>
          </span>
        </button>
        <button
          onClick={() => setModal("expense")}
          className="flex items-center gap-3 rounded-2xl bg-expense-soft px-4 py-3 text-left"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-expense/15">
            <Minus className="h-4 w-4 text-expense" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-foreground">Saldo Keluar</span>
            <span className="block text-[11px] text-muted-foreground">Catat pengeluaran</span>
          </span>
        </button>
      </section>

      <section className="mt-5 px-5">
        <div className="soft-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Target Impian</h2>
            <button onClick={() => setAddGoal(true)} className="text-xs font-medium text-gold">
              + Tambah Impian
            </button>
          </div>
          {goal ? (
            <Link to="/impian" className="mt-3 block">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{goal.title}</span>
                <span className="rounded-full bg-gold-soft px-2 py-0.5 text-xs font-semibold text-navy">
                  {pct}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {rupiah(Number(goal.saved_amount))} / {rupiah(Number(goal.target_amount))}
              </p>
            </Link>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">Belum ada impian yang dibuat.</p>
          )}
        </div>
      </section>

      <section className="mt-5 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Riwayat Transaksi</h2>
          <Link to="/mutasi" className="text-xs font-medium text-navy-light">
            Lihat Semua
          </Link>
        </div>
        <div className="mt-3 space-y-2">
          {transactions.slice(0, 4).map((t) => (
            <div key={t.id} className="soft-card flex items-center gap-3 p-3">
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                  t.type === "income" ? "bg-income-soft" : "bg-expense-soft"
                }`}
              >
                {t.type === "income" ? (
                  <ArrowDownLeft className="h-4 w-4 text-income" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-expense" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.category}</p>
                <p className="text-[11px] text-muted-foreground">{shortDate(t.occurred_at)}</p>
              </div>
              <p
                className={`shrink-0 text-sm font-semibold ${
                  t.type === "income" ? "text-income" : "text-expense"
                }`}
              >
                {t.type === "income" ? "+" : "-"} {rupiah(Number(t.amount))}
              </p>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-xs text-muted-foreground">Belum ada transaksi.</p>
          )}
        </div>
      </section>

      <TransactionModal
        type={modal ?? "income"}
        open={modal !== null}
        onOpenChange={(v) => !v && setModal(null)}
      />
      <AccountModal open={addAccount} onOpenChange={setAddAccount} />
      <GoalModal open={addGoal} onOpenChange={setAddGoal} />
    </div>
  );
}

