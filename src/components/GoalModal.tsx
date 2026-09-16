import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAddGoal } from "@/lib/db";

export function GoalModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const add = useAddGoal();
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [date, setDate] = useState("");

  async function submit() {
    if (!title.trim() || !Number(target)) { toast.error("Lengkapi nama dan target impian"); return; }
    try {
      await add.mutateAsync({
        title: title.trim(),
        target_amount: Number(target),
        target_date: date || null,
      });
      toast.success("Impian dibuat");
      setTitle("");
      setTarget("");
      setDate("");
      onOpenChange(false);
    } catch {
      toast.error("Gagal membuat impian");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle>Buat Impian Baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nama Impian</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Liburan Bali"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Target Dana</Label>
            <Input
              inputMode="numeric"
              value={target}
              onChange={(e) => setTarget(e.target.value.replace(/\D/g, ""))}
              placeholder="12000000"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Target Tanggal</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <Button
            onClick={submit}
            disabled={add.isPending}
            className="h-11 w-full rounded-xl bg-gold text-navy hover:bg-gold/90"
          >
            Simpan Impian
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
