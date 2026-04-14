import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../api";

export interface TransactionDTO {
  id: string;
  transactionType: "income" | "expense";
  date: string;
  amount: number;
  source: string;
  category: string;
  description: string;
  createdAt: string;
}

export interface GetTransactionsResponse {
  items: TransactionDTO[];
  nextCursor?: string;
}

export interface CreateTransactionBody {
  date: string;
  amount: number;
  source: string;
  category?: string;
  description?: string;
  transactionType: "income" | "expense";
}

const QUERY_KEY = ["transactions"] as const;

export function useTransactions() {
  return useInfiniteQuery<GetTransactionsResponse>({
    queryKey: QUERY_KEY,
    queryFn: async ({ pageParam }) => {
      const url = pageParam ? `/revenue?cursor=${pageParam}` : "/revenue";
      const res = await api.get<GetTransactionsResponse>(url);
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateTransactionBody) =>
      api.post<TransactionDTO>("/revenue", body).then((r) => r.data),

    onMutate: async (newTxn) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const snapshot = queryClient.getQueryData(QUERY_KEY);

      queryClient.setQueryData<{ pages: GetTransactionsResponse[] }>(
        QUERY_KEY,
        (old) => {
          if (!old) return old;
          const optimistic: TransactionDTO = {
            id: `optimistic-${Date.now()}`,
            transactionType: newTxn.transactionType,
            date: newTxn.date,
            amount: newTxn.amount,
            source: newTxn.source,
            category: newTxn.category ?? "Uncategorized",
            description: newTxn.description ?? "",
            createdAt: new Date().toISOString(),
          };
          return {
            ...old,
            pages: [
              {
                items: [optimistic, ...old.pages[0].items],
                nextCursor: old.pages[0].nextCursor,
              },
              ...old.pages.slice(1),
            ],
          };
        },
      );

      return { snapshot };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) queryClient.setQueryData(QUERY_KEY, ctx.snapshot);
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sk: string) =>
      api.delete(`/revenue/${encodeURIComponent(sk)}`),

    onMutate: async (sk) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const snapshot = queryClient.getQueryData(QUERY_KEY);

      queryClient.setQueryData<{ pages: GetTransactionsResponse[] }>(
        QUERY_KEY,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.filter((i) => i.id !== sk),
            })),
          };
        },
      );

      return { snapshot };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) queryClient.setQueryData(QUERY_KEY, ctx.snapshot);
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
