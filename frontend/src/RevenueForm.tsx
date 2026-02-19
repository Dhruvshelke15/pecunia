import { useState } from 'react';
import { api } from './api';
import { PlusCircle, Loader2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export default function RevenueForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    source: '',
    category: 'Freelance',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.post('/revenue', {
        ...formData,
        amount: Number(formData.amount),
        transactionType
      });
      setMessage({ text: 'Transaction recorded!', type: 'success' });
      setFormData({ ...formData, amount: '', source: '' });
      // Trigger a custom event so Dashboard knows to refresh (Optional advanced step)
      window.dispatchEvent(new Event('transactionUpdated'));
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Failed to save.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

      <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-indigo-400" />
        New Entry
      </h2>
      
      {/* Type Toggle */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-black/20 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setTransactionType('income')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            transactionType === 'income' 
            ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' 
            : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowUpCircle className="w-4 h-4" /> Income
        </button>
        <button
          type="button"
          onClick={() => setTransactionType('expense')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            transactionType === 'expense' 
            ? 'bg-rose-500/20 text-rose-400 shadow-sm' 
            : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowDownCircle className="w-4 h-4" /> Expense
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Date</label>
          <input 
            type="date" 
            required
            className="w-full px-4 py-2 rounded-lg glass-input focus:ring-2 focus:ring-indigo-500/50 transition-all"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
        </div>

        {/* Amount */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-slate-400">$</span>
            <input 
              type="number" 
              step="0.01"
              required
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-2 rounded-lg glass-input focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
            />
          </div>
        </div>

        {/* Source */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Source</label>
          <input 
            type="text" 
            required
            placeholder={transactionType === 'income' ? "e.g. Salary, Freelance" : "e.g. Netflix, Rent"}
            className="w-full px-4 py-2 rounded-lg glass-input focus:ring-2 focus:ring-indigo-500/50 transition-all"
            value={formData.source}
            onChange={e => setFormData({...formData, source: e.target.value})}
          />
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Category</label>
          <select 
            className="w-full px-4 py-2 rounded-lg glass-input focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
            <option className="bg-slate-800">Freelance</option>
            <option className="bg-slate-800">Salary</option>
            <option className="bg-slate-800">Investments</option>
            <option className="bg-slate-800">Food</option>
            <option className="bg-slate-800">Utilities</option>
            <option className="bg-slate-800">Entertainment</option>
            <option className="bg-slate-800">Other</option>
          </select>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-6 flex justify-center items-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Transaction'}
        </button>

        {/* Status Message */}
        {message && (
          <div className={`text-center text-sm font-medium mt-2 ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}