import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Search } from "lucide-react";
import { dayKey, dayLabel, rupiah, timeOf } from "@/lib/format";
import { useAccounts, useTransactions } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/mutasi")({
  head: () => ({
    meta: [
      { title: "Riwayat Mutasi — NOTE TABUNGAN" },
      {
        name: "description",
        content: "Cari dan filter seluruh riwayat mutasi tabungan per bank dan per tanggal.",
      },
      { property: "og:title", content: "Riwayat Mutasi — NOTE TABUNGAN" },
      {
        property: "og:description",
        content: "Lihat semua transaksi masuk dan keluar dari setiap rekening.",
      },
    ],
  }),
  component: Mutasi,
});

function Mutasi() {
  const { data: transactions = [] } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const [query, setQuery] = useState("");
  const [bank, setBank] = useState("Semua Bank");

  const bankName = (id: string | null) =>
    accounts.find((a) => a.id === id)?.bank_name ?? "Tanpa Rekening";

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return transactions.filter((t) => {
      const matchBank = bank === "Semua Bank" || bankName(t.account_id) === bank;
      const matchQuery =
        !q ||
        t.category.toLowerCase().includes(q) ||
        t.note.toLowerCase().includes(q) ||
        bankName(t.account_id).toLowerCase().includes(q);
      return matchBank && matchQuery;
    });
  }, [transactions, query, bank, accounts]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const t of filtered) {
      const k = dayKey(t.occurred_at);
      map.set(k, [...(map.get(k) ?? []), t]);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const pills = ["Semua Bank", ...new Set(accounts.map((a) => a.bank_name))];

  return (
    <div>
      <header className="navy-pattern rounded-b-[2rem] px-5 pb-6 pt-6 text-white">
        <h1 className="text-lg font-semibold">Riwayat Mutasi</h1>
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 ring-1 ring-white/15">
          <Search className="h-4 w-4 shrink-0 text-white/60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari transaksi..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
          />
        </div>
      </header>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pt-4">
        {pills.map((p) => (
          <button
            key={p}
            onClick={() => setBank(p)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              bank === p ? "bg-navy text-white" : "bg-white text-muted-foreground"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <section className="px-5 pt-4">
        {groups.map(([key, items]) => (
          <div key={key} className="mb-5">
            <h2 className="mb-2 text-xs font-semibold text-muted-foreground">{dayLabel(key)}</h2>
            <div className="space-y-2">
              {items.map((t) => (
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
                    <p className="truncate text-sm font-medium">{t.note || t.category}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {bankName(t.account_id)} · {timeOf(t.occurred_at)}
                    </p>
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
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <p className="pt-8 text-center text-sm text-muted-foreground">
            Tidak ada transaksi ditemukan.
          </p>
        )}
      </section>
    </div>
  );
}
