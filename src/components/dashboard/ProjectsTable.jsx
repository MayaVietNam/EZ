import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const statusConfig = {
  completed: { label: 'Hoàn thành', icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  in_progress: { label: 'Đang thực hiện', icon: Clock, cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  delayed: { label: 'Trễ hạn', icon: AlertTriangle, cls: 'bg-amber-50 text-amber-600 border-amber-200' }
};

const projects = [
{ name: 'Dự án Alpha', manager: 'Tanaka', deadline: '2026-04-15', budget: '120M ¥', status: 'in_progress' },
{ name: 'Dự án Beta', manager: 'Suzuki', deadline: '2026-03-30', budget: '85M ¥', status: 'completed' },
{ name: 'Dự án Gamma', manager: 'Sato', deadline: '2026-05-01', budget: '200M ¥', status: 'delayed' },
{ name: 'Dự án Delta', manager: 'Yamamoto', deadline: '2026-06-20', budget: '150M ¥', status: 'in_progress' },
{ name: 'Dự án Epsilon', manager: 'Watanabe', deadline: '2026-04-10', budget: '95M ¥', status: 'completed' }];


export default function ProjectsTable() {
  return (
    <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
      <div className="p-6 pb-4">
        <h3 className="text-base font-semibold text-foreground">Đơn thuê gần đây</h3>
        <p className="text-sm text-muted-foreground">Tổng quan các đơn thuê</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tên dự án</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Quản lý</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Hạn chót</TableHead>
            
            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((p, i) => {
            const s = statusConfig[p.status];
            const Icon = s.icon;
            return (
              <TableRow key={i} className="hover:bg-muted/20">
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{p.manager}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{p.deadline}</TableCell>
                <TableCell className="hidden md:table-cell font-medium">{p.budget}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${s.cls} gap-1 font-medium`}>
                    <Icon className="w-3 h-3" />
                    {s.label}
                  </Badge>
                </TableCell>
              </TableRow>);

          })}
        </TableBody>
      </Table>
    </div>);

}
