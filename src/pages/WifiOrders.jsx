import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wifi, LogOut, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import WifiRequestCard from '@/components/wifi/WifiRequestCard';
import SheetImportButton from '@/components/wifi/SheetImportButton';



const PARTNERS = ['TOYOTA', 'YAMAHA', 'MITSUBISHI', 'SUMITOMO', 'HIS'];

const PARTNER_COLORS = {
  TOYOTA:     'from-red-500 to-rose-600',
  YAMAHA:     'from-violet-500 to-purple-600',
  MITSUBISHI: 'from-blue-500 to-sky-600',
  SUMITOMO:   'from-emerald-500 to-teal-600',
  HIS:        'from-amber-500 to-orange-500',
};

const STATUS_FILTERS = [
  { value: 'all',      label: 'Tất cả' },
  { value: 'pending',  label: 'Chờ xác nhận' },
  { value: 'approved', label: 'Đã xác nhận' },
  { value: 'rejected', label: 'Đã huỷ' },
];

export default function WifiOrders() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePartner, setActivePartner] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    const data = await base44.entities.WifiRequest.list('-created_date', 200);
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();

    // Real-time
    const unsub = base44.entities.WifiRequest.subscribe((event) => {
      if (event.type === 'create') {
        setRequests(prev => [event.data, ...prev]);
        toast.info(`🔔 Đơn mới từ ${event.data.partner}: ${event.data.requester_name}`, { duration: 6000 });
        // Gửi email thông báo cho admin
        base44.integrations.Core.SendEmail({
          to: 'admin@company.com',
          subject: `[WiFi] Đơn mới từ ${event.data.partner} - ${event.data.requester_name}`,
          body: `Có đơn đăng ký WiFi mới:\n\nĐối tác: ${event.data.partner}\nNgười đăng ký: ${event.data.requester_name}\nEmail: ${event.data.requester_email}\nThiết bị: ${event.data.imei}\nQuốc gia: ${event.data.country}\nThời gian: ${event.data.from_date} → ${event.data.to_date}\nTổng tiền: ${event.data.total} VND\n\nVui lòng vào hệ thống để xác nhận.`,
        }).catch(() => {});
      }
      if (event.type === 'update') {
        setRequests(prev => prev.map(r => r.id === event.id ? event.data : r));
      }
      if (event.type === 'delete') {
        setRequests(prev => prev.filter(r => r.id !== event.id));
      }
    });
    return () => unsub();
  }, []);

  const handleApprove = async (req) => {
    await base44.entities.WifiRequest.update(req.id, { status: 'approved', is_new: false });
    toast.success(`Đã xác nhận đơn của ${req.requester_name}`);
  };

  // Mark all visible as seen
  const markAllSeen = async () => {
    const newOnes = requests.filter(r => r.is_new);
    await Promise.all(newOnes.map(r => base44.entities.WifiRequest.update(r.id, { is_new: false })));
    setRequests(prev => prev.map(r => ({ ...r, is_new: false })));
  };

  const filtered = requests.filter(r => {
    const matchPartner = activePartner === 'all' || r.partner === activePartner;
    const matchStatus  = statusFilter === 'all' || r.status === statusFilter;
    const matchSearch  = !search || r.requester_name?.toLowerCase().includes(search.toLowerCase()) || r.requester_email?.toLowerCase().includes(search.toLowerCase());
    return matchPartner && matchStatus && matchSearch;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const newCount     = requests.filter(r => r.is_new).length;

  const partnerCount = (partner) => requests.filter(r => r.partner === partner && r.status === 'pending').length;

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
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Wifi className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">Quản lý đơn WiFi</p>
              <p className="text-xs text-muted-foreground">{pendingCount} đơn chờ duyệt</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {newCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1" onClick={markAllSeen}>
                Đánh dấu đã đọc ({newCount})
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-muted-foreground gap-2" onClick={() => base44.auth.logout()}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        {/* Partner tabs */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <button
            onClick={() => setActivePartner('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activePartner === 'all' ? 'bg-primary text-primary-foreground shadow' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
          >
            Tất cả
            {pendingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{pendingCount}</span>
            )}
          </button>
          {PARTNERS.map(p => {
            const pc = partnerCount(p);
            return (
              <button
                key={p}
                onClick={() => setActivePartner(p)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activePartner === p ? `bg-gradient-to-r ${PARTNER_COLORS[p]} text-white shadow` : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
              >
                {p}
                {pc > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{pc}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filters + Import */}
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
              </button>
            ))}
          </div>
          <SheetImportButton
            partner={activePartner === 'all' ? null : activePartner}
            onImported={fetchRequests}
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Tổng đơn', value: requests.length, color: 'text-foreground' },
            { label: 'Chờ duyệt', value: requests.filter(r => r.status === 'pending').length, color: 'text-amber-600' },
            { label: 'Đã duyệt', value: requests.filter(r => r.status === 'approved').length, color: 'text-emerald-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-card rounded-2xl border border-border/60 p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Wifi className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Không có đơn nào</p>
            <p className="text-sm mt-1">Sync từ Google Sheet hoặc chờ đơn mới</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((req, i) => (
              <WifiRequestCard
                key={req.id}
                request={req}
                index={i}
                onApprove={handleApprove}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}