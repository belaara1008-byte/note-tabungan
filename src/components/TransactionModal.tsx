import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAccounts, useAddTransaction } from "@/lib/db";

const incomeCats = ["Setoran", "Gaji", "Bunga Tabungan", "Transfer Masuk", "Lainnya"];
const expenseCats = ["Belanja", "Tagihan", "Transfer Keluar", "Makan", "Lainnya"];

export function TransactionModal({
  type,
  open,
  onOpenChange,
}: {
  type: "income" | "expense";
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: accounts = [] } = useAccounts();
  const add = useAddTransaction();
  const cats = type === "income" ? incomeCats : expenseCats;

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(cats[0]!);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [accountId, setAccountId] = useState("");

  const account = accountId || accounts[0]?.id || "";

  async function submit() {
    const value = Number(amount);
    if (!value || value <= 0) { toast.error("Masukkan nominal yang valid"); return; }
    if (!account) { toast.error("Tambahkan rekening terlebih dahulu"); return; }
    try {
      await add.mutateAsync({
        account_id: account,
        type,
        amount: value,
        category,
        note,
        occurred_at: new Date(date + "T" + new Date().toTimeString().slice(0, 8)).toISOString(),
      });
      toast.success(type === "income" ? "Saldo masuk tercatat" : "Saldo keluar tercatat");
      setAmount("");
      setNote("");
      onOpenChange(false);
    } catch {
      toast.error("Gagal menyimpan transaksi");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle className={type === "income" ? "text-income" : "text-expense"}>
            {type === "income" ? "Saldo Masuk" : "Saldo Keluar"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nominal</Label>
            <Input
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Kategori</Label>
            <select
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {cats.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Rekening</Label>
            <select
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              value={account}
              onChange={(e) => setAccountId(e.target.value)}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.bank_name} — {a.account_number}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Tanggal</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Catatan</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Opsional" />
          </div>
          <Button
            onClick={submit}
            disabled={add.isPending}
            className="h-11 w-full rounded-xl bg-gold text-navy hover:bg-gold/90"
          >
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
