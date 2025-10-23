import React, { useState, useMemo } from 'react';
import { CheckCircle, Activity, Search, RefreshCw, Download, List, Grid, X, Eye } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: string;
  merchant_id?: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  onRefresh?: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailModal, setDetailModal] = useState<ActivityItem | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const uniqueTypes = useMemo(() => {
    const types = new Set(activities.map(a => a.type));
    return Array.from(types);
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      if (searchTerm && !act.type.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !act.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (dateFrom && new Date(act.timestamp) < new Date(dateFrom)) return false;
      if (dateTo && new Date(act.timestamp) > new Date(dateTo)) return false;
      if (statusFilter !== 'all' && act.status !== statusFilter) return false;
      if (typeFilter !== 'all' && act.type !== typeFilter) return false;
      return true;
    });
  }, [activities, searchTerm, dateFrom, dateTo, statusFilter, typeFilter]);

  const paginatedActivities = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredActivities.slice(start, end);
  }, [filteredActivities, page]);

  const totalPages = Math.ceil(filteredActivities.length / pageSize);

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Type', 'Description', 'Status', 'Timestamp'];
    const rows = filteredActivities.map(a => [
      a.id,
      a.type,
      a.description,
      a.status,
      new Date(a.timestamp).toLocaleString('en-IN'),
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recent_activity.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleMarkAsRead = () => {
    console.log('Mark as read:', Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  if (!activities || activities.length === 0) {
    return (
      <section className="bg-orange-900 bg-opacity-60 backdrop-blur-sm rounded-lg p-6 border border-orange-600 mt-6">
        <p className="text-orange-400 text-center">No recent activity.</p>
      </section>
    );
  }

  return (
    <section className="bg-orange-900 bg-opacity-60 backdrop-blur-sm rounded-lg p-6 border border-orange-600 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-orange-200 flex items-center gap-2">
          <Activity className="w-5 h-5" /> Recent Activity
        </h2>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button onClick={onRefresh} className="p-2 rounded hover:bg-orange-700 transition" title="Refresh">
              <RefreshCw className="w-4 h-4 text-orange-300" />
            </button>
          )}
          <button onClick={handleExportCSV} className="p-2 rounded hover:bg-orange-700 transition" title="Export CSV">
            <Download className="w-4 h-4 text-orange-300" />
          </button>
          <button onClick={() => setViewMode(viewMode === 'list' ? 'card' : 'list')} className="p-2 rounded hover:bg-orange-700 transition" title="Toggle View">
            {viewMode === 'list' ? <Grid className="w-4 h-4 text-orange-300" /> : <List className="w-4 h-4 text-orange-300" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-orange-500 outline-none text-sm" />
        </div>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-orange-500 outline-none text-sm" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-orange-500 outline-none text-sm" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-orange-500 outline-none text-sm">
          <option value="all">All Statuses</option>
          <option value="success">Success</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-orange-500 outline-none text-sm">
          <option value="all">All Types</option>
          {uniqueTypes.map(t => (<option key={t} value={t}>{t}</option>))}
        </select>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-800 rounded">
          <span className="text-sm text-gray-300">{selectedIds.size} selected</span>
          <button onClick={handleMarkAsRead} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">Mark as Read</button>
          <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">Clear Selection</button>
        </div>
      )}

      {viewMode === 'list' ? (
        <ul className="space-y-3">
          {paginatedActivities.map(act => (
            <li key={act.id} className="flex items-center gap-3 bg-orange-800 bg-opacity-50 rounded p-3">
              <input type="checkbox" checked={selectedIds.has(act.id)} onChange={() => handleToggleSelect(act.id)} className="w-4 h-4" />
              <div className={`p-2 rounded ${act.status === 'success' ? 'bg-green-600' : act.status === 'error' ? 'bg-red-600' : act.status === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'}`}>
                {act.status === 'success' ? <CheckCircle className="w-4 h-4 text-white" /> : <Activity className="w-4 h-4 text-white" />}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{act.type}</p>
                <p className="text-orange-300 text-sm">{act.description}</p>
              </div>
              <span className="text-xs text-orange-400">{new Date(act.timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <button onClick={() => setDetailModal(act)} className="p-1 rounded hover:bg-orange-700 transition" title="View Details"><Eye className="w-4 h-4 text-orange-300" /></button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedActivities.map(act => (
            <div key={act.id} className="bg-orange-800 bg-opacity-50 rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <input type="checkbox" checked={selectedIds.has(act.id)} onChange={() => handleToggleSelect(act.id)} className="w-4 h-4" />
                <span className={`text-xs font-medium px-2 py-1 rounded ${act.status === 'success' ? 'bg-green-600' : act.status === 'error' ? 'bg-red-600' : act.status === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'} text-white`}>{act.status}</span>
              </div>
              <h3 className="text-white font-semibold mb-1">{act.type}</h3>
              <p className="text-orange-300 text-sm mb-2">{act.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-orange-400">{new Date(act.timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <button onClick={() => setDetailModal(act)} className="p-1 rounded hover:bg-orange-700 transition" title="View Details"><Eye className="w-4 h-4 text-orange-300" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 text-sm">Previous</button>
          <span className="text-sm text-gray-300">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 text-sm">Next</button>
        </div>
      )}

      {detailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full relative">
            <button onClick={() => setDetailModal(null)} className="absolute top-2 right-2 p-1 rounded hover:bg-gray-700"><X className="w-5 h-5 text-gray-400" /></button>
            <h3 className="text-xl font-bold text-white mb-4">Activity Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold text-gray-300">ID:</span> <span className="text-white">{detailModal.id}</span></p>
              <p><span className="font-semibold text-gray-300">Type:</span> <span className="text-white">{detailModal.type}</span></p>
              <p><span className="font-semibold text-gray-300">Description:</span> <span className="text-white">{detailModal.description}</span></p>
              <p><span className="font-semibold text-gray-300">Status:</span> <span className="text-white">{detailModal.status}</span></p>
              <p><span className="font-semibold text-gray-300">Timestamp:</span> <span className="text-white">{new Date(detailModal.timestamp).toLocaleString('en-IN')}</span></p>
              {detailModal.merchant_id && (<p><span className="font-semibold text-gray-300">Merchant ID:</span> <span className="text-white">{detailModal.merchant_id}</span></p>)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
