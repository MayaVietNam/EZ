import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const brandConfig = {
  TOYOTA: { gradient: 'from-red-500 to-red-600', icon: '🚗', desc: 'Ô tô & Phụ tùng' },
  YAMAHA: { gradient: 'from-violet-500 to-violet-600', icon: '🏍️', desc: 'Xe máy & Nhạc cụ' },
  MITSUBISHI: { gradient: 'from-blue-500 to-blue-600', icon: '⚙️', desc: 'Công nghiệp & Điện tử' },
  SUMITOMO: { gradient: 'from-emerald-500 to-emerald-600', icon: '🏗️', desc: 'Hạ tầng & Vật liệu' },
  HIS: { gradient: 'from-amber-500 to-amber-600', icon: '✈️', desc: 'Du lịch & Dịch vụ' },
};

export default function BrandCard({ brand, index }) {
  const config = brandConfig[brand] || { gradient: 'from-primary to-primary', icon: '📦', desc: '' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link to={`/dashboard/${brand.toLowerCase()}`}>
        <div className="group relative bg-card rounded-2xl border border-border/60 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
          {/* Top gradient bar */}
          <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />

          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                {config.icon}
              </div>
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="w-4 h-4 text-foreground" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-1.5 tracking-wide">
              {brand}
            </h3>
            <p className="text-sm text-muted-foreground">
              {config.desc}
            </p>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`w-7 h-7 rounded-full border-2 border-card bg-gradient-to-br ${config.gradient} opacity-${80 - i * 20}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">+12 dự án</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
