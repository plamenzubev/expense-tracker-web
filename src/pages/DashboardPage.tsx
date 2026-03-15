import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getExpenses, deleteExpense } from "../api/client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import AddExpenseModal from "../components/AddExpenseModal";

interface Expense {
  id: number;
  title: string;
  amount: string;
  date: string;
  note: string;
  category_name: string;
}

const COLORS = [
  "#6C63FF",
  "#FF6584",
  "#43C6AC",
  "#FFD93D",
  "#FF9A3C",
  "#4D96FF",
];

export default function DashboardPage() {
  const { logout } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      await deleteExpense(id);
      fetchExpenses();
    }
  };

  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  // Group by category for pie chart
  const chartData = expenses.reduce((acc: any[], e) => {
    const name = e.category_name || "Uncategorized";
    const existing = acc.find((item) => item.name === name);
    if (existing) {
      existing.value += parseFloat(e.amount);
    } else {
      acc.push({ name, value: parseFloat(e.amount) });
    }
    return acc;
  }, []);

  if (loading) {
    return (
      <div style={styles.centered}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>💰 Expense Tracker</h1>
        <button style={styles.logoutBtn} onClick={logout}>
          Logout
        </button>
      </div>

      <div style={styles.content}>
        {/* Stats Row */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Expenses</p>
            <p style={styles.statValue}>${total.toFixed(2)}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Transactions</p>
            <p style={styles.statValue}>{expenses.length}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Average</p>
            <p style={styles.statValue}>
              ${expenses.length ? (total / expenses.length).toFixed(2) : "0.00"}
            </p>
          </div>
        </div>

        <div style={styles.mainRow}>
          {/* Expense List */}
          <div style={styles.listCard}>
            <div style={styles.listHeader}>
              <h2 style={styles.cardTitle}>Recent Expenses</h2>
              <button style={styles.addBtn} onClick={() => setModalOpen(true)}>
                + Add Expense
              </button>
            </div>

            {expenses.length === 0 ? (
              <p style={styles.empty}>No expenses yet. Add your first!</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} style={styles.tr}>
                      <td style={styles.td}>{expense.title}</td>
                      <td style={styles.td}>
                        {expense.category_name || "Uncategorized"}
                      </td>
                      <td style={styles.td}>{expense.date}</td>
                      <td
                        style={{
                          ...styles.td,
                          color: "#6C63FF",
                          fontWeight: "bold",
                        }}
                      >
                        ${parseFloat(expense.amount).toFixed(2)}
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.deleteBtn}
                          onClick={() => handleDelete(expense.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pie Chart */}
          {chartData.length > 0 && (
            <div style={styles.chartCard}>
              <h2 style={styles.cardTitle}>Expenses by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `$${Number(value).toFixed(2)}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <AddExpenseModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            fetchExpenses();
          }}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: "100vh", backgroundColor: "#F8F9FA" },
  centered: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    backgroundColor: "#6C63FF",
  },
  headerTitle: { color: "#FFF", fontSize: 24, margin: 0 },
  logoutBtn: {
    backgroundColor: "transparent",
    color: "#FFF",
    border: "1px solid #FFF",
    borderRadius: 8,
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: 14,
  },
  content: { padding: 32 },
  statsRow: { display: "flex", gap: 16, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  statLabel: { color: "#666", fontSize: 14, margin: "0 0 8px 0" },
  statValue: { color: "#1A1A2E", fontSize: 28, fontWeight: "bold", margin: 0 },
  mainRow: { display: "flex", gap: 24, alignItems: "flex-start" },
  listCard: {
    flex: 2,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  chartCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#1A1A2E", margin: 0 },
  addBtn: {
    backgroundColor: "#6C63FF",
    color: "#FFF",
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: 14,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "8px 12px",
    borderBottom: "2px solid #F0F0F0",
    color: "#666",
    fontSize: 13,
  },
  tr: { borderBottom: "1px solid #F8F9FA" },
  td: { padding: "12px", fontSize: 14, color: "#1A1A2E" },
  deleteBtn: {
    backgroundColor: "#FFE5E5",
    color: "#E53935",
    border: "none",
    borderRadius: 6,
    padding: "4px 10px",
    cursor: "pointer",
    fontSize: 13,
  },
  empty: { color: "#999", textAlign: "center", padding: "32px 0" },
};
