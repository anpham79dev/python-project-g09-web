import apiClient from "../axios";
import {
  Transaction,
  CashFlowSummary,
  PnLReport,
  INITIAL_TRANSACTIONS,
} from "../mock-data";
import {
  isMockMode,
  simulateDelay,
  LS_KEYS,
  getStoredOrders,
  getStoredList,
  saveStoredList,
} from "./_shared";

const getStoredTransactions = (): Transaction[] =>
  getStoredList(LS_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
const saveStoredTransactions = (txs: Transaction[]) =>
  saveStoredList(LS_KEYS.TRANSACTIONS, txs);

export const getTransactions = async (params?: {
  type?: string;
  category?: string;
  branchId?: string;
}): Promise<Transaction[]> => {
  if (isMockMode()) {
    let list = getStoredTransactions();
    if (params?.type)
      list = list.filter((t) => t.transactionType === params.type);
    if (params?.category)
      list = list.filter((t) => t.category === params.category);
    if (params?.branchId && params.branchId !== "ALL")
      list = list.filter((t) => t.branchId === params.branchId);
    return simulateDelay(list);
  }
  const queryParams: any = {};
  if (params?.type) queryParams.type = params.type;
  if (params?.category) queryParams.category = params.category;
  if (params?.branchId && params.branchId !== "ALL") {
    queryParams.branch_id = params.branchId;
    queryParams.branchId = params.branchId;
  }
  const response = await apiClient.get("/accounting/transactions", {
    params: queryParams,
  });
  return response.data;
};

export const createTransaction = async (
  data: Omit<Transaction, "id" | "code" | "createdAt">,
): Promise<Transaction> => {
  if (isMockMode()) {
    const list = getStoredTransactions();
    const prefix = data.transactionType === "INCOME" ? "PT" : "PC";
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now().toString().slice(-6)}`,
      code: `${prefix}-${dateStr}-${(list.length + 1).toString().padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newTx);
    saveStoredTransactions(list);
    return simulateDelay(newTx);
  }
  const response = await apiClient.post("/accounting/transactions", data);
  return response.data;
};

export const getCashFlowSummary = async (params?: {
  branchId?: string;
}): Promise<CashFlowSummary> => {
  if (isMockMode()) {
    const txs = getStoredTransactions().filter(
      (t) =>
        !params?.branchId ||
        params.branchId === "ALL" ||
        t.branchId === params.branchId,
    );
    const totalIncome = txs
      .filter((t) => t.transactionType === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = txs
      .filter((t) => t.transactionType === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);
    const netCashFlow = totalIncome - totalExpense;

    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};

    txs.forEach((t) => {
      if (t.transactionType === "INCOME") {
        incomeByCategory[t.category] =
          (incomeByCategory[t.category] || 0) + t.amount;
      } else {
        expenseByCategory[t.category] =
          (expenseByCategory[t.category] || 0) + t.amount;
      }
    });

    return simulateDelay({
      periodLabel: "Tháng này (08/2026)",
      totalIncome,
      totalExpense,
      netCashFlow,
      cashBalance: 2500000 + Math.max(0, netCashFlow * 0.2),
      bankBalance: 18500000 + Math.max(0, netCashFlow * 0.8),
      totalTransactionsCount: txs.length,
      incomeByCategory,
      expenseByCategory,
    });
  }
  const queryParams: any = {};
  if (params?.branchId && params.branchId !== "ALL") {
    queryParams.branch_id = params.branchId;
    queryParams.branchId = params.branchId;
  }
  const response = await apiClient.get("/accounting/summary", {
    params: queryParams,
  });
  return response.data;
};

export const getPnLReport = async (params?: {
  branchId?: string;
}): Promise<PnLReport> => {
  if (isMockMode()) {
    const orders = getStoredOrders().filter(
      (o) =>
        !params?.branchId ||
        params.branchId === "ALL" ||
        o.branchId === params.branchId,
    );
    const grossRevenue =
      orders.reduce((sum, o) => sum + o.totalAmount, 0) || 5500000;
    const cogs = Math.round(grossRevenue * 0.35);
    const grossProfit = grossRevenue - cogs;
    const operatingExpenses = Math.round(grossRevenue * 0.22);
    const netProfit = grossProfit - operatingExpenses;

    return simulateDelay({
      periodLabel: "Tháng 08/2026",
      grossRevenue,
      cogs,
      grossProfit,
      grossMarginPercent: Math.round((grossProfit / grossRevenue) * 1000) / 10,
      operatingExpenses,
      netProfit,
      netMarginPercent: Math.round((netProfit / grossRevenue) * 1000) / 10,
      expensesBreakdown: {
        "Bột mì, Bơ lạt & Sữa": Math.round(cogs * 0.7),
        "Bao bì hộp bánh": Math.round(cogs * 0.3),
        "Điện nước & Gas nướng": Math.round(operatingExpenses * 0.4),
        "Lương nhân sự ca": Math.round(operatingExpenses * 0.6),
      },
    });
  }
  const queryParams: any = {};
  if (params?.branchId && params.branchId !== "ALL") {
    queryParams.branch_id = params.branchId;
    queryParams.branchId = params.branchId;
  }
  const response = await apiClient.get("/accounting/pnl", {
    params: queryParams,
  });
  return response.data;
};
