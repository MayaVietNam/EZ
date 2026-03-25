import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    const items = await base44.entities.WifiRequest.filter({ is_new: true, status: 'pending' });
    setCount(items.length);
  };

  useEffect(() => {
    fetchCount();
    // Poll mỗi 30 giây
    const interval = setInterval(fetchCount, 30000);

    // Real-time subscription
    const unsub = base44.entities.WifiRequest.subscribe((event) => {
      if (event.type === 'create') setCount(c => c + 1);
      if (event.type === 'update' && !event.data.is_new) setCount(c => Math.max(0, c - 1));
    });

    return () => { clearInterval(interval); unsub(); };
  }, []);

  return (
    <Link to="/wifi-orders" className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl hover:bg-secondary transition-colors">
      <Bell className="w-5 h-5 text-muted-foreground" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}