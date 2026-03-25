import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// URL Apps Script trả về JSON tất cả các tab
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbykdYVJBdpAtoeMEbXU5heBvehRPIWdRyIQkFnH2gw8A3h9X2BWwmN8bbrW2vl7spRi/exec';

const VALID_PARTNERS = ['TOYOTA', 'YAMAHA', 'MITSUBISHI', 'SUMITOMO', 'HIS'];

function formatDate(val) {
  if (!val) return '';
  if (typeof val === 'string' && !val.includes('T')) return val;
  try {
    const d = new Date(val);
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
  } catch { return String(val); }
}

function mapRow(row, partner) {
  const ts = row['Thời gian ghi'] || '';
  const userName = row['Tên người dùng'] || '';
  const imei = row['IMEI'] ? String(row['IMEI']) : '';
  const orderNum = row['Số thứ tự đơn'] ? String(row['Số thứ tự đơn']) : '';

  return {
    partner,
    requester_name:  row['Họ tên'] || '',
    requester_email: row['Email'] || '',
    requester_phone: row['Số điện thoại'] ? String(row['Số điện thoại']) : '',
    company:         row['Công ty'] || '',
    department:      row['Khu vực'] || '',
    tax_code:        row['Mã số thuế'] ? String(row['Mã số thuế']) : '',
    order_number:    orderNum,
    user_name:       userName,
    imei:            imei,
    from_date:       formatDate(row['Từ ngày']),
    to_date:         formatDate(row['Đến ngày']),
    usage_days:      Number(row['Số ngày sử dụng']) || 0,
    country:         row['Quốc gia'] || '',
    data_package:    row['Gói data'] || '',
    budget_code:     row['Budget Code'] || '',
    unit_price:      row['Đơn giá/ngày'] ? String(row['Đơn giá/ngày']) : '',
    subtotal:        row['Thành tiền'] ? String(row['Thành tiền']) : '',
    vat:             row['VAT (10%)'] ? String(row['VAT (10%)']) : '',
    total:           row['Tổng cộng'] ? String(row['Tổng cộng']) : '',
    status:          'pending',
    sheet_row_id:    `${ts}_${userName}_${imei}_${orderNum}`,
    is_new:          true,
  };
}

// partner = null => sync tất cả, partner = 'YAMAHA' => sync 1 đối tác
export default function SheetImportButton({ partner, onImported }) {
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setLoading(true);

    const resp = await fetch(APPS_SCRIPT_URL);
    if (!resp.ok) { toast.error('Không thể tải dữ liệu từ Sheet'); setLoading(false); return; }
    const allData = await resp.json();

    // Lấy các tab cần import
    const tabsToImport = partner
      ? { [partner]: allData[partner] || [] }
      : Object.fromEntries(VALID_PARTNERS.map(p => [p, allData[p] || []]));

    // Load existing để check trùng
    const existing = await base44.entities.WifiRequest.list('-created_date', 2000);
    const existingIds = new Set(existing.map(e => e.sheet_row_id).filter(Boolean));

    const newRows = [];
    for (const [partnerKey, rows] of Object.entries(tabsToImport)) {
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        const mapped = mapRow(row, partnerKey);
        if (mapped.requester_name && !existingIds.has(mapped.sheet_row_id)) {
          newRows.push(mapped);
        }
      }
    }

    if (!newRows.length) { toast.info('Không có đơn mới (tất cả đã được import)'); setLoading(false); return; }

    await base44.entities.WifiRequest.bulkCreate(newRows);
    toast.success(`Đã import ${newRows.length} đơn mới`);
    onImported?.();
    setLoading(false);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleImport} disabled={loading} className="gap-2">
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Đang import...' : partner ? 'Sync từ Sheet' : 'Sync tất cả'}
    </Button>
  );
}