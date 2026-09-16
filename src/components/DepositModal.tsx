import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAccounts, useDepositGoal, type Goal } from "@/lib/db";

export function DepositModal({
  goal,
  onOpenChange,
}: {
  goal: Goal | null;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: accounts = [] } = useAccounts();
  const deposit = useDepositGoal();
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");

  const account = accountId || accounts[0]?.id || "";

  async function submit() {
    if (!goal) return;
    const value = Number(amount);
    if (!value) { toast.error("Masukkan nominal setoran"); return; }
    if (!account) { toast.error("Tambahkan rekening terlebih dahulu"); return; }
    try {
      await deposit.mutateAsync({ goal, account_id: account, amount: value });
      toast.success("Setoran tabungan berhasil");
      setAmount("");
      onOpenChange(false);
    } catch {
      toast.error("Gagal menyetor tabungan");
    }
  }

  return (
    <Dialog open={!!goal} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle>Setor Tabungan — {goal?.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nominal Setoran</Label>
            <Input
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Ambil dari Rekening</Label>
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
          <Button
            onClick={submit}
            disabled={deposit.isPending}
            className="h-11 w-full rounded-xl bg-gold text-navy hover:bg-gold/90"
          >
            Setor Sekarang
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
