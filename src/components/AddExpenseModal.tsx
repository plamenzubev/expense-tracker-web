import React, { useState, useEffect } from 'react';
import { createExpense, getCategories } from '../api/client';

interface Category {
  id: number;
  name: string;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddExpenseModal({ onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) {
      setError('Please fill in title and amount');
      return;
    }
    setLoading(true);
    try {
      await createExpense({
        title,
        amount,
        date,
        note,
        category: categoryId ?? undefined,
      });
      onSuccess();
    } catch (e) {
      setError('Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>New Expense</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Title</label>
          <input
            style={styles.input}
            type="text"
            placeholder="e.g. Coffee"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label style={styles.label}>Amount</label>
          <input
            style={styles.input}
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
          />

          <label style={styles.label}>Date</label>
          <input
            style={styles.input}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <label style={styles.label}>Category (optional)</label>
          <select
            style={styles.input}
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <label style={styles.label}>Note (optional)</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Add a note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div style={styles.buttons}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#FFF', borderRadius: 16,
    padding: 32, width: '100%', maxWidth: 480,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 16 },
  error: { color: '#E53935', marginBottom: 12 },
  label: { display: 'block', fontSize: 13, color: '#666', marginBottom: 4 },
  input: {
    width: '100%', padding: '10px 14px',
    borderRadius: 8, border: '1px solid #E0E0E0',
    fontSize: 15, marginBottom: 14, boxSizing: 'border-box',
  },
  buttons: { display: 'flex', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, padding: '12px', backgroundColor: '#F0F0F0',
    color: '#666', border: 'none', borderRadius: 8,
    fontSize: 15, cursor: 'pointer',
  },
  submitBtn: {
    flex: 1, padding: '12px', backgroundColor: '#6C63FF',
    color: '#FFF', border: 'none', borderRadius: 8,
    fontSize: 15, fontWeight: 'bold', cursor: 'pointer',
  },
};