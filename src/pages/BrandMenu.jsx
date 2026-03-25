import React from 'react';
import { motion } from 'framer-motion';
import { Building2, LogOut, ChevronRight, BarChart2 } from 'lucide-react';
import NotificationBell from '@/components/wifi/NotificationBell';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

const BRANDS = [
{
  id: 'toyota',
  name: 'TOYOTA',
  desc: 'Ô tô & Phụ tùng',
  gradient: 'from-red-500 to-rose-600',
},
{
  id: 'yamaha',
  name: 'YAMAHA',
  desc: 'Xe máy & Nhạc cụ',
  gradient: 'from-violet-500 to-purple-600',
},
{
  id: 'mitsubishi',
  name: 'MITSUBISHI',
  desc: 'Công nghiệp & Điện tử',
  gradient: 'from-blue-500 to-sky-600',
},
{
  id: 'sumitomo',
  name: 'SUMITOMO',
  desc: 'Hạ tầng & Vật liệu',
  gradient: 'from-emerald-500 to-teal-600',
},
{
  id: 'his',
  name: 'HIS',
  desc: 'Du lịch & Dịch vụ',
  gradient: 'from-amber-500 to-orange-500',
}];


export default function BrandMenu() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-foreground tracking-tight text-sm sm:text-base">QUẢN LÝ ĐƠN THUÊ WIFI
</span>
              <p className="text-xs text-muted-foreground hidden sm:block">Corporate Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Button variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-2"
            onClick={() => base44.auth.logout()}>
              
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-card border-b border-border/50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Danh mục đối tác

            </h1>
            

            
          </motion.div>

          {/* Summary bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-6">
            
            {[
            { label: 'Thương hiệu', value: '5' },
            { label: 'Tổng dự án', value: '48' },
            { label: 'Tổng doanh thu', value: '¥9.4B' },
            { label: 'Nhân viên', value: '3,200+' }].
            map((item) =>
            <div key={item.label}>
                
                
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Brand Grid */}
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BRANDS.map((brand, i) =>
          <BrandCard key={brand.id} brand={brand} index={i} />
          )}
        </div>
      </main>
    </div>);

}

function BrandCard({ brand, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -4 }}>
      
      <Link to={`/dashboard/${brand.id}`} className="block group">
        <div className="bg-card rounded-2xl border border-border/60 overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-black/5">
          {/* Color bar */}
          <div className={`h-1.5 bg-gradient-to-r ${brand.gradient}`} />

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className={`h-1.5 w-10 rounded-full bg-gradient-to-r ${brand.gradient}`} />
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-100 scale-90">
                <ChevronRight className="w-4 h-4 text-foreground" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-foreground tracking-wide mb-0.5">{brand.name}</h3>
            <p className="text-sm text-muted-foreground">{brand.desc}</p>
            

            {/* Stats row */}
            











            
          </div>
        </div>
      </Link>
    </motion.div>);

}