import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Flag, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      navigate('/', { replace: true });
    }
  }, [user, isLoading, navigate]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await api.get('/api/admin/reports');
      const mapped = (res.data || []).map((r) => ({
        id: r._id,
        targetTitle: r.target?.title || r.target?.name || 'Unknown',
        targetType: r.targetType,
        targetId: r.targetId,
        reportedBy: r.reporter?.name || 'Unknown',
        reason: r.reason,
        details: r.details || '',
        date: r.createdAt,
        status: r.status || 'pending',
      }));
      setReports(mapped);
    } catch (err) {
      toast.error(err.response?.status === 403 ? 'Admin access required' : 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id) => {
    try {
      await api.put(`/api/admin/reports/${id}`, { status: 'resolved' });
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r)));
      toast.success('Report marked as resolved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve');
    }
  };

  const handleDeletePod = async (reportId, targetId, targetType) => {
    if (targetType !== 'pod') {
      await handleResolve(reportId);
      return;
    }
    try {
      await api.delete(`/api/admin/pods/${targetId}`);
      await handleResolve(reportId);
      toast.success('Pod deleted and report resolved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete pod');
    }
  };

  const pendingReports = reports.filter((r) => (r.status || 'pending') === 'pending');

  if (isLoading || (!user || user.role !== 'admin')) {
    return (
      <div className="py-20 text-center text-zinc-500 text-[13px] font-medium">
        {isLoading ? 'Loading...' : 'Access denied'}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
          <ShieldAlert className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Trust & Safety Center</h1>
          <p className="text-sm font-medium text-zinc-500">Manage reported pods and active moderation queues</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Card className="p-5 border-zinc-200/80 shadow-sm flex flex-col justify-center">
          <span className="text-[12px] font-bold tracking-wider text-zinc-500 uppercase mb-1">Active Reports</span>
          <span className="text-3xl font-bold text-red-600">{loading ? '—' : pendingReports.length}</span>
        </Card>
        <Card className="p-5 border-zinc-200/80 shadow-sm flex flex-col justify-center">
          <span className="text-[12px] font-bold tracking-wider text-zinc-500 uppercase mb-1">Resolved</span>
          <span className="text-3xl font-bold text-emerald-600">{loading ? '—' : reports.filter((r) => r.status === 'resolved').length}</span>
        </Card>
        <Card className="p-5 border-zinc-200/80 shadow-sm flex flex-col justify-center">
          <span className="text-[12px] font-bold tracking-wider text-zinc-500 uppercase mb-1">System Status</span>
          <span className="text-sm font-bold text-zinc-900 flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            All services operational
          </span>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
          <Flag className="w-4 h-4 text-zinc-400" /> Moderation Queue
        </h3>
        
        {loading ? (
          <div className="p-12 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-xl">
            <p className="text-[14px] font-medium text-zinc-500">Loading reports...</p>
          </div>
        ) : pendingReports.length === 0 ? (
          <div className="p-12 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-[15px] font-semibold text-zinc-900">Queue is empty</h3>
            <p className="text-[13px] text-zinc-500 mt-1">No active reports require moderation.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingReports.map((report) => (
              <Card key={report.id} className="p-0 overflow-hidden border border-zinc-200 shadow-sm bg-white">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100/50">
                          {report.targetType}
                        </span>
                        <span className="text-[12px] font-medium text-zinc-400">
                          {new Date(report.date).toLocaleString()}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-zinc-900">{report.targetTitle}</h4>
                      <p className="text-[13px] text-zinc-500 mt-0.5">Reported by <span className="font-medium text-zinc-700">{report.reportedBy}</span> for <span className="font-medium text-zinc-900">"{report.reason}"</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      {report.targetType === 'pod' && (
                        <button onClick={() => handleDeletePod(report.id, report.targetId, report.targetType)} className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-md text-[12px] font-medium transition-colors flex items-center gap-1.5 shadow-sm">
                          <Trash2 className="w-3.5 h-3.5" /> Delete Pod
                        </button>
                      )}
                      <button onClick={() => handleResolve(report.id)} className="px-3 py-1.5 bg-zinc-900 text-white hover:bg-black rounded-md text-[12px] font-medium transition-colors shadow-sm">
                        Mark Safe
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                    <p className="text-[13px] font-medium text-zinc-800 flex items-start gap-2">
                       <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                       "{report.details}"
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
