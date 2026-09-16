import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Target, Trash2 } from "lucide-react";
import { rupiah, shortDate } from "@/lib/format";
import { useDeleteGoal, useGoals, type Goal } from "@/lib/db";
import { GoalModal } from "@/components/GoalModal";
import { DepositModal } from "@/components/DepositModal";

export const Route = createFileRoute("/_authenticated/impian")({
  head: () => ({
    meta: [
      { title: "Impian Saya — NOTE TABUNGAN" },
      {
        name: "description",
        content: "Kelola target impian menabung, pantau progres, dan setor dana dari rekening.",
      },
      { property: "og:title", content: "Impian Saya — NOTE TABUNGAN" },
      {
        property: "og:description",
        content: "Buat target impian dan lihat progres tabungan Anda.",
      },
    ],
  }),
  component: Impian,
});

function Impian() {
  const { data: goals = [] } = useGoals();
  const del = useDeleteGoal();
  const [open, setOpen] = useState(false);
  const [deposit, setDeposit] = useState<Goal | null>(null);

  return (
    <div>
      <header className="navy-pattern rounded-b-[2rem] px-5 pb-8 pt-6 text-white">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h1 className="truncate text-lg font-semibold">Halaman Impian Saya</h1>
          <button
            onClick={() => setOpen(true)}
            className="flex shrink-0 items-center gap-1 rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-navy"
          >
            <Plus className="h-4 w-4" /> Buat Impian
          </button>
        </div>
        <p className="mt-1 text-xs text-white/60">Target Impian Saya</p>
      </header>

      <section className="space-y-3 px-5 pt-5">
        {goals.map((g) => {
          const pct = Math.min(
            100,
            Math.round((Number(g.saved_amount) / Number(g.target_amount || 1)) * 100),
          );
          return (
            <article key={g.id} className="soft-card p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold-soft">
                  <Target className="h-5 w-5 text-gold" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="truncate text-sm font-semibold">{g.title}</h2>
                    <span className="shrink-0 rounded-full bg-income-soft px-2 py-0.5 text-xs font-semibold text-income">
                      {pct}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {rupiah(Number(g.saved_amount))} / {rupiah(Number(g.target_amount))}
                  </p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                  </div>
                  {g.target_date && (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Target: {shortDate(g.target_date)}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => setDeposit(g)}
                  className="flex-1 rounded-xl bg-navy py-2 text-xs font-semibold text-white"
                >
                  Setor Tabungan
                </button>
                <button
                  onClick={() => del.mutate(g.id)}
                  aria-label="Hapus impian"
                  className="grid h-9 w-9 place-items-center rounded-xl bg-expense-soft"
                >
                  <Trash2 className="h-4 w-4 text-expense" />
                </button>
              </div>
            </article>
          );
        })}
        {goals.length === 0 && (
          <p className="pt-8 text-center text-sm text-muted-foreground">
            Belum ada impian. Buat impian pertama Anda.
          </p>
        )}
      </section>

      <GoalModal open={open} onOpenChange={setOpen} />
      <DepositModal goal={deposit} onOpenChange={(v) => !v && setDeposit(null)} />
    </div>
  );
}
