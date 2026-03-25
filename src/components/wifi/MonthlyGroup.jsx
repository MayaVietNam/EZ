import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Send, CheckCircle2, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import WifiRequestCard from './WifiRequestCard';

function parseTotal(val) {
  if (!val) return 0;
  return Number(String(val).replace(/[^0-9]/g, '')) || 0;
}

export default function MonthlyGroup({ monthKey, label, requests, statement, onApprove, onStatementUpdate }) {
  const [open, setOpen] = useState(true);
  const [sending, setSending] = useState(false);

  const totalRevenue = requests.reduce((sum, r) => sum + parseTotal(r.total), 0);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const handleToggleSent = async () => {
    setSending(true);
    try {
      if (statement) {
        await base44.entities.MonthlyStatement.update(statement.id, {
          sent: !statement.sent,
          sent_date: !statement.sent ? new Date().toISOString().split('T')[0] : null,
        });
        toast.success(!statement.sent ? `Đã đánh dấu gửi bảng kê ${label}` : `Đã huỷ đánh dấu gửi bảng kê ${label}`);
      } else {
        await base44.entities.MonthlyStatement.create({
          partner: requests[0]?.partner,
          month_key: monthKey,
          sent: true,
          sent_date: new Date().toISOString().split('T')[0],
        });
        toast.success(`Đã đánh dấu gửi bảng kê ${label}`);
      }
      onStatementUpdate?.();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mb-6">
      {/* Month header */}
      <div className="flex items-center justify-between mb-3 bg-card border border-border/60 rounded-2xl px-4 py-3">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
        >
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span>{label}</span>
          <span className="text-xs text-muted-foreground font-normal ml-1">({requests.length} đơn)</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full">{pendingCount} chờ</span>
          )}
        </button>
        <div className="flex items-center gap-3">
          {/* Total revenue */}
          <div className="flex items-center gap-1.5 text-sm">
            <Banknote className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{totalRevenue.toLocaleString('vi-VN')} VND</span>
          </div>
          {/* Sent statement badge + button */}
          {statement?.sent ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 gap-1">
                <CheckCircle2 className="w-3 h-3" /> Đã gửi bảng kê
              </Badge>
              <button
                onClick={handleToggleSent}
                disabled={sending}
                className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
              >
                Huỷ
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs h-7"
              onClick={handleToggleSent}
              disabled={sending}
            >
              <Send className="w-3.5 h-3.5" />
              Đánh dấu đã gửi bảng kê
            </Button>
          )}
        </div>
      </div>

      {/* Cards */}
      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((req, i) => (
            <WifiRequestCard key={req.id} request={req} index={i} onApprove={onApprove} />
          ))}
        </div>
      )}
    </div>
  );
}