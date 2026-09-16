import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BankAccount = {
  id: string;
  user_id: string;
  bank_name: string;
  holder_name: string;
  account_number: string;
  balance: number;
  color: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  account_id: string | null;
  goal_id: string | null;
  type: "income" | "expense";
  amount: number;
  category: string;
  note: string;
  occurred_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
  image_url: string | null;
};

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
};

async function uid() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? "";
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile | null> => {
      const id = await uid();
      if (!id) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      return (data as Profile) ?? null;
    },
  });
}

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async (): Promise<BankAccount[]> => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BankAccount[];
    },
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("occurred_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as Transaction[];
    },
  });
}

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: async (): Promise<Goal[]> => {
      const { data, error } = await supabase
        .from("savings_goals")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Goal[];
    },
  });
}

function useRefresh() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["accounts"] });
    qc.invalidateQueries({ queryKey: ["transactions"] });
    qc.invalidateQueries({ queryKey: ["goals"] });
  };
}

export function useAddAccount() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: async (input: {
      bank_name: string;
      holder_name: string;
      account_number: string;
      balance: number;
      color: string;
    }) => {
      const user_id = await uid();
      const { error } = await supabase.from("bank_accounts").insert({ ...input, user_id });
      if (error) throw error;
    },
    onSuccess: refresh,
  });
}

export function useDeleteAccount() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bank_accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });
}

export function useAddTransaction() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: async (input: {
      account_id: string;
      type: "income" | "expense";
      amount: number;
      category: string;
      note: string;
      occurred_at: string;
      goal_id?: string | null;
    }) => {
      const user_id = await uid();
      const { error } = await supabase.from("transactions").insert({ ...input, user_id });
      if (error) throw error;

      const { data: acc, error: accErr } = await supabase
        .from("bank_accounts")
        .select("balance")
        .eq("id", input.account_id)
        .single();
      if (accErr) throw accErr;
      const delta = input.type === "income" ? input.amount : -input.amount;
      const { error: upErr } = await supabase
        .from("bank_accounts")
        .update({ balance: Number(acc.balance) + delta })
        .eq("id", input.account_id);
      if (upErr) throw upErr;
    },
    onSuccess: refresh,
  });
}

export function useAddGoal() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      target_amount: number;
      target_date: string | null;
    }) => {
      const user_id = await uid();
      const { error } = await supabase.from("savings_goals").insert({ ...input, user_id });
      if (error) throw error;
    },
    onSuccess: refresh,
  });
}

export function useDeleteGoal() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("savings_goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });
}

export function useDepositGoal() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: async (input: { goal: Goal; account_id: string; amount: number }) => {
      const user_id = await uid();
      const { error } = await supabase.from("transactions").insert({
        user_id,
        account_id: input.account_id,
        goal_id: input.goal.id,
        type: "expense",
        amount: input.amount,
        category: "Setor Impian",
        note: input.goal.title,
        occurred_at: new Date().toISOString(),
      });
      if (error) throw error;

      const { data: acc } = await supabase
        .from("bank_accounts")
        .select("balance")
        .eq("id", input.account_id)
        .single();
      if (acc) {
        await supabase
          .from("bank_accounts")
          .update({ balance: Number(acc.balance) - input.amount })
          .eq("id", input.account_id);
      }
      await supabase
        .from("savings_goals")
        .update({ saved_amount: Number(input.goal.saved_amount) + input.amount })
        .eq("id", input.goal.id);
    },
    onSuccess: refresh,
  });
}
