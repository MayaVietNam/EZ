import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
{ month: 'T1', revenue: 4200, target: 4000 },
{ month: 'T2', revenue: 3800, target: 4200 },
{ month: 'T3', revenue: 5100, target: 4400 },
{ month: 'T4', revenue: 4700, target: 4600 },
{ month: 'T5', revenue: 5800, target: 4800 },
{ month: 'T6', revenue: 6200, target: 5000 },
{ month: 'T7', revenue: 5900, target: 5200 },
{ month: 'T8', revenue: 6800, target: 5400 },
{ month: 'T9', revenue: 7100, target: 5600 },
{ month: 'T10', revenue: 6500, target: 5800 },
{ month: 'T11', revenue: 7400, target: 6000 },
{ month: 'T12', revenue: 8200, target: 6200 }];


const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1.5">Tháng {label}</p>
      {payload.map((entry, i) =>
      <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value.toLocaleString()}M ¥
        </p>
      )}
    </div>);

};

export default function RevenueChart() {
  return (
    <div className="bg-card px-5 rounded-[60px] border border-border/60">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">Doanh thu</h3>
          <p className="text-sm text-muted-foreground">Thống kê theo tháng (triệu Yên)</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">Doanh thu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
            <span className="text-muted-foreground">Mục tiêu</span>
          </div>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(213, 80%, 50%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(213, 80%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(216, 20%, 90%)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 10%, 46%)', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 10%, 46%)', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="target" name="Mục tiêu" stroke="hsl(220, 10%, 75%)" strokeWidth={2} strokeDasharray="5 5" fill="none" />
            <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="hsl(213, 80%, 50%)" strokeWidth={2.5} fill="url(#revenueGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>);

}
