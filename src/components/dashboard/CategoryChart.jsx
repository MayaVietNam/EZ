import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
{ name: 'Sản xuất', value: 42 },
{ name: 'Marketing', value: 28 },
{ name: 'R&D', value: 35 },
{ name: 'Bán hàng', value: 50 },
{ name: 'Vận hành', value: 20 }];


const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground">{payload[0]?.value} dự án</p>
    </div>);

};

export default function CategoryChart() {
  return null;


















}
