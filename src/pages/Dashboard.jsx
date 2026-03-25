import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LogOut, Briefcase, Wifi, CheckCircle2, Clock, XCircle, FileText, ArrowRight } from 'lucide-react';
import NotificationBell from '@/components/wifi/NotificationBell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

const BRAND_CONFIG = {
  toyota:     { name: 'TOYOTA',     icon: '🚗', gradient: 'from-red-500 to-rose-600',      desc: 'Ô tô & Phụ tùng' },
  yamaha:     { name: 'YAMAHA',     icon: '🏍️', gradient: 'from-violet-500 to-purple-600', desc: 'Xe máy & Nhạc cụ' },
  mitsubishi: { name: 'MITSUBISHI', icon: '⚙️', gradient: 'from-blue-500 to-sky-600',      desc: 'Công nghiệp & Điện tử' },
  sumitomo:   { name: 'SUMITOMO',   icon: '🏗️', gradient: 'from-emerald-500 to-teal-600',  desc: 'Hạ tầng & Vật liệu' },
  his:        { name: 'HIS',        icon: '✈️', gradient: 'from-amber-500 to-orange-500',  desc: 'Du lịch & Dịch vụ' },
};

const statusConfig = {
  pending:  { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-600 border-amber-200',   icon: Clock },
  approved: { label: 'Đã duyệt',  cls: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Từ chối',   cls: 'bg-red-50 text-red-500 border-red-200',         icon: XCircle },
};

export default function Dashboard() {
  const { unit } = useParams();
  const brand = BRAND_CONFIG[unit] || { name: unit?.toUpperCase(), icon: '📦', gradient: 'from-primary to-primary', desc: '' };
  const partnerKey = brand.name;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.WifiRequest.filter({ partner: partnerKey }, '-created_date', 100)
      .then(data => { setRequests(data); setLoading(false); });

    const unsub = base44.entities.WifiRequest.subscribe((event) => {
      if (event.data?.partner !== partnerKey) return;
      if (event.type === 'create') setRequests(p => [event.data, ...p]);
      if (event.type === 'update') setRequests(p => p.map(r => r.id === event.id ? event.data : r));
      if (event.type === 'delete') setRequests(p => p.filter(r => r.id !== event.id));
    });
    return () => unsub();
  }, [unit]);

  const total    = requests.length;
  const pending  = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;
  const recent   = requests.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="w-px h-5 bg-border" />
            <div className={`px-3 py-1.5 rounded-xl bg-gradient-to-r ${brand.gradient} flex items-center gap-2 shadow-sm`}>
              <span className="text-lg leading-none">{brand.icon}</span>
              <div>
                <p className="text-xs font-bold text-white leading-tight">{brand.name}</p>
                <p className="text-[10px] text-white/75 hidden sm:block">{brand.desc}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2" onClick={() => base44.auth.logout()}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Page title + tabs */}
      <div className="border-b border-border/50 bg-card">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-0">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Bảng điều khiển — {brand.name}</h2>
            <p className="text-muted-foreground mt-1 text-sm">Tổng quan đơn đăng ký thuê WiFi</p>
          </motion.div>
          <div className="flex items-center gap-1 mt-6">
            <Link to={`/dashboard/${unit}`} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 border-primary text-primary">
              <Briefcase className="w-4 h-4" />
              Tổng quan
            </Link>
            <Link to={`/dashboard/${unit}/wifi`} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors">
              <Wifi className="w-4 h-4" />
              Quản lý WiFi
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8 space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Tổng đơn',  value: total,    color: 'text-foreground',    bg: 'bg-accent',                    icon: FileText },
            { label: 'Chờ duyệt', value: pending,  color: 'text-amber-600',     bg: 'bg-amber-50',                  icon: Clock },
            { label: 'Đã duyệt',  value: approved, color: 'text-emerald-600',   bg: 'bg-emerald-50',                icon: CheckCircle2 },
            { label: 'Từ chối',   value: rejected, color: 'text-red-500',       bg: 'bg-red-50',                    icon: XCircle },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-card rounded-2xl border border-border/60 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent requests */}
        <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
          <div className="p-6 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Đơn thuê gần đây</h3>
              <p className="text-sm text-muted-foreground">6 đơn mới nhất của {brand.name}</p>
            </div>
            <Link to={`/dashboard/${unit}/wifi`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" />
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wifi className="w-9 h-9 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Chưa có đơn nào</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {recent.map((req) => {
                const s = statusConfig[req.status] || statusConfig.pending;
                const Icon = s.icon;
                return (
                  <div key={req.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                        <Wifi className="w-4 h-4 text-accent-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{req.requester_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{req.department || req.requester_email || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {new Date(req.created_date).toLocaleDateString('vi-VN')}
                      </span>
                      <Badge variant="outline" className={`${s.cls} gap-1 font-medium`}>
                        <Icon className="w-3 h-3" />
                        {s.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Progress bar summary */}
        {total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl border border-border/60 p-6"
          >
            <h3 className="text-base font-semibold text-foreground mb-4">Tỷ lệ xử lý đơn</h3>
            <div className="flex rounded-full overflow-hidden h-3 mb-4">
              {approved > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${(approved / total) * 100}%` }} />}
              {pending > 0  && <div className="bg-amber-400 transition-all"  style={{ width: `${(pending  / total) * 100}%` }} />}
              {rejected > 0 && <div className="bg-red-400 transition-all"   style={{ width: `${(rejected / total) * 100}%` }} />}
            </div>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-muted-foreground">Đã duyệt: <b className="text-foreground">{Math.round((approved/total)*100)}%</b></span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="text-muted-foreground">Chờ duyệt: <b className="text-foreground">{Math.round((pending/total)*100)}%</b></span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="text-muted-foreground">Từ chối: <b className="text-foreground">{Math.round((rejected/total)*100)}%</b></span></div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}