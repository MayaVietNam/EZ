import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Wifi, LogOut, Search, Filter, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import NotificationBell from '@/components/wifi/NotificationBell';
import SheetImportButton from '@/components/wifi/SheetImportButton';
import MonthlyGroup from '@/components/wifi/MonthlyGroup';

const BRAND_CONFIG = {
  toyota:     { name: 'TOYOTA',     icon: '🚗', gradient: 'from-red-500 to-rose-600',      desc: 'Ô tô & Phụ tùng' },
  yamaha:     { name: 'YAMAHA',     icon: '🏍️', gradient: 'from-violet-500 to-purple-600', desc: 'Xe máy & Nhạc cụ' },
  mitsubishi: { name: 'MITSUBISHI', icon: '⚙️', gradient: 'from-blue-500 to-sky-600',      desc: 'Công nghiệp & Điện tử' },
  sumitomo:   { name: 'SUMITOMO',   icon: '🏗️', gradient: 'from-emerald-500 to-teal-600',  desc: 'Hạ tầng & Vật liệu' },
  his:        { name: 'HIS',        icon: '✈️', gradient: 'from-amber-500 to-orange-500',  desc: 'Du lịch & Dịch vụ' },
};

const STATUS_FILTERS = [
  { value: 'all',      label: 'Tất cả' },
  { value: 'pending',  label: 'Chờ xác nhận' },
  { value: 'approved', label: 'Đã xác nhận' },
  { value: 'rejected', label: 'Đã huỷ' },
];

function parseTotal(val) {
  if (!val) return 0;
  return Number(String(val).replace(/[^0-9]/g, '')) || 0;
}

function getMonthKey(dateStr) {
  if (!dateStr) return 'unknown';
  // dateStr có thể là ISO hoặc dd/mm/yyyy
  try {
    let d;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      d = new Date(dateStr);
    }
    if (isNaN(d)) return 'unknown';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  } catch { return 'unknown'; }
}

function monthLabel(key) {
  if (key === 'unknown') return 'Không xác định';
  const [y, m] = key.split('-');
  return `Tháng ${parseInt(m)} / ${y}`;
}

export default function BrandWifi() {
  const { unit } = useParams();
  const brand = BRAND_CONFIG[unit] || { name: unit?.toUpperCase(), icon: '📦', gradient: 'from-primary to-primary', desc: '' };
  const partnerKey = brand.name;

  const [requests, setRequests] = useState([]);
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    const [data, stmts] = await Promise.all([
      base44.entities.WifiRequest.filter({ partner: partnerKey }, '-created_date', 500),
      base44.entities.MonthlyStatement.filter({ partner: partnerKey }),
    ]);
    setRequests(data);
    setStatements(stmts);
    setLoading(false);
  };

  const fetchStatements = async () => {
    const stmts = await base44.entities.MonthlyStatement.filter({ partner: partnerKey });
    setStatements(stmts);
  };

  useEffect(() => {
    fetchRequests();
    const unsub = base44.entities.WifiRequest.subscribe((event) => {
      if (event.data?.partner !== partnerKey) return;
      if (event.type === 'create') {
        setRequests(prev => [event.data, ...prev]);
        toast.info(`🔔 Đơn mới: ${event.data.requester_name}`, { duration: 6000 });
        base44.integrations.Core.SendEmail({
          to: 'admin@company.com',
          subject: `[WiFi] Đơn mới từ ${event.data.partner} - ${event.data.requester_name}`,
          body: `Có đơn đăng ký WiFi mới:\n\nĐối tác: ${event.data.partner}\nNgười đăng ký: ${event.data.requester_name}\nEmail: ${event.data.requester_email}\nThiết bị: ${event.data.imei}\nQuốc gia: ${event.data.country}\nThời gian: ${event.data.from_date} → ${event.data.to_date}\nTổng tiền: ${event.data.total} VND\n\nVui lòng vào hệ thống để xác nhận.`,
        }).catch(() => {});
      }
      if (event.type === 'update') setRequests(prev => prev.map(r => r.id === event.id ? event.data : r));
      if (event.type === 'delete') setRequests(prev => prev.filter(r => r.id !== event.id));
    });
    return () => unsub();
  }, [unit]);

  const handleApprove = async (req) => {
    await base44.entities.WifiRequest.update(req.id, { status: 'approved', is_new: false });
    toast.success(`Đã xác nhận đơn của ${req.requester_name}`);
  };

  // Filter
  const filtered = requests.filter(r => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchSearch = !search || r.requester_name?.toLowerCase().includes(search.toLowerCase()) || r.requester_email?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Group by month using from_date
  const grouped = {};
  filtered.forEach(r => {
    const key = getMonthKey(r.from_date || r.created_date);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });
  const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // Stats
  const pendingCount  = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;
  const totalRevenue  = requests.filter(r => r.status === 'approved').reduce((s, r) => s + parseTotal(r.total), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/dashboard/${unit}`}>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="w-px h-5 bg-border" />
            <div className={`px-3 py-1.5 rounded-xl bg-gradient-to-r ${brand.gradient} flex items-center gap-2 shadow-sm`}>
              <span className="text-lg leading-none">{brand.icon}</span>
              <div>
                <p className="text-xs font-bold text-white leading-tight">{brand.name}</p>
                <p className="text-[10px] text-white/75 hidden sm:block">Quản lý WiFi</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Button variant="ghost" size="sm" className="text-muted-foreground gap-2" onClick={() => base44.auth.logout()}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Page title */}
      <div className="border-b border-border/50 bg-card">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-1">
              <Wifi className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">WiFi Management</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Đơn đăng ký WiFi — {brand.name}</h2>
            <p className="text-muted-foreground mt-1 text-sm">Xem, xác nhận và theo dõi bảng kê hàng tháng</p>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Tổng đơn',        value: requests.length,                              color: 'text-foreground' },
            { label: 'Chờ xác nhận',    value: pendingCount,                                 color: 'text-amber-600' },
            { label: 'Đã xác nhận',     value: approvedCount,                                color: 'text-emerald-600' },
            { label: 'Đã huỷ',          value: rejectedCount,                                color: 'text-red-500' },
            { label: 'Doanh thu (đã xác nhận)', value: totalRevenue.toLocaleString('vi-VN') + ' VND', color: 'text-primary', span: true },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`bg-card rounded-2xl border border-border/60 p-4 text-center ${stat.span ? 'col-span-2 sm:col-span-1' : ''}`}
            >
              <p className={`text-xl font-bold ${stat.color} leading-tight`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm tên, email..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {STATUS_FILTERS.map(sf => (
              <button
                key={sf.value}
                onClick={() => setStatusFilter(sf.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === sf.value ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
              >
                {sf.label}
                {sf.value === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
          <SheetImportButton partner={partnerKey} onImported={fetchRequests} />
        </div>

        {/* List grouped by month */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Wifi className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Không có đơn nào</p>
            <p className="text-sm mt-1">Nhấn "Sync từ Sheet" để tải đơn từ Google Sheet</p>
          </div>
        ) : (
          sortedMonths.map(monthKey => (
            <MonthlyGroup
              key={monthKey}
              monthKey={monthKey}
              label={monthLabel(monthKey)}
              requests={grouped[monthKey]}
              statement={statements.find(s => s.month_key === monthKey)}
              onApprove={handleApprove}
              onStatementUpdate={fetchStatements}
            />
          ))
        )}
      </main>
    </div>
  );
}