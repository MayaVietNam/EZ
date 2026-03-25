import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, User, Globe, Laptop, Calendar, Package, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  pending:  { label: 'Chờ xác nhận', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
  approved: { label: 'Đã xác nhận',  cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  rejected: { label: 'Đã huỷ',       cls: 'bg-red-50 text-red-500 border-red-200' },
};

export default function WifiRequestCard({ request, index, onApprove }) {
  const s = statusConfig[request.status] || statusConfig.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={`bg-card rounded-2xl border ${request.is_new && request.status === 'pending' ? 'border-primary/40 shadow-md shadow-primary/5' : 'border-border/60'} p-5`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-accent-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground leading-tight truncate">{request.user_name || request.requester_name}</p>
            <p className="text-xs text-muted-foreground truncate">{request.requester_name} · {request.company || request.department}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {request.is_new && request.status === 'pending' && (
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
          <Badge variant="outline" className={s.cls}>{s.label}</Badge>
        </div>
      </div>

      {/* IMEI + thiết bị */}
      {request.imei && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 bg-muted/40 rounded-lg px-3 py-1.5">
          <Laptop className="w-3.5 h-3.5 shrink-0" />
          <span className="font-mono font-medium text-foreground">{request.imei}</span>
        </div>
      )}

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-3 mb-3">
        {request.country && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground col-span-2">
            <Globe className="w-3.5 h-3.5 shrink-0 text-primary" />
            <span className="truncate">{request.country}</span>
          </div>
        )}
        {(request.from_date || request.to_date) && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground col-span-2">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{request.from_date} → {request.to_date}</span>
            {request.usage_days > 0 && <span className="text-primary font-semibold">({request.usage_days} ngày)</span>}
          </div>
        )}
        {request.data_package && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Package className="w-3.5 h-3.5 shrink-0" />
            <span>{request.data_package}</span>
          </div>
        )}
        {request.total && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Banknote className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold text-foreground">{Number(String(request.total).replace(/[^0-9]/g, '')).toLocaleString('vi-VN')} VND</span>
          </div>
        )}
      </div>

      {/* Date import */}
      <p className="text-xs text-muted-foreground mb-3">
        Đăng ký: {new Date(request.created_date).toLocaleDateString('vi-VN')}
      </p>

      {/* Actions */}
      {request.status === 'pending' && (
        <div className="flex gap-2 pt-3 border-t border-border/60">
          <Button size="sm" className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onApprove(request)}>
            <CheckCircle2 className="w-4 h-4" /> Xác nhận
          </Button>
        </div>
      )}
    </motion.div>
  );
}