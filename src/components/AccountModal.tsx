import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAddAccount } from "@/lib/db";

const colors = ["#0D253A", "#163C5E", "#1F6F8B", "#7A5C1E", "#3B3B58"];

export function AccountModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const add = useAddAccount();
  const [bank, setBank] = useState("SeaBank");
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState(colors[0]!);

  async function submit() {
    if (!bank.trim() || !holder.trim()) { toast.error("Lengkapi nama bank dan pemilik"); return; }
    try {
      await add.mutateAsync({
        bank_name: bank.trim(),
        holder_name: holder.trim(),
        account_number: number.trim(),
        balance: Number(balance) || 0,
        color,
      });
      toast.success("Rekening ditambahkan");
      setHolder("");
      setNumber("");
      setBalance("");
      onOpenChange(false);
    } catch {
      toast.error("Gagal menambahkan rekening");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle>Tambah Rekening</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nama Bank</Label>
            <Input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="SeaBank" />
          </div>
          <div className="space-y-1.5">
            <Label>Nama Pemilik</Label>
            <Input value={holder} onChange={(e) => setHolder(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Nomor Rekening</Label>
            <Input
              inputMode="numeric"
              value={number}
              onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Saldo Awal</Label>
            <Input
              inputMode="numeric"
              value={balance}
              onChange={(e) => setBalance(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Warna Kartu</Label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`h-8 w-8 rounded-full ring-offset-2 ${color === c ? "ring-2 ring-gold" : ""}`}
                  aria-label={`Warna ${c}`}
                />
              ))}
            </div>
          </div>
          <Button
            onClick={submit}
            disabled={add.isPending}
            className="h-11 w-full rounded-xl bg-gold text-navy hover:bg-gold/90"
          >
            Simpan Rekening
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
