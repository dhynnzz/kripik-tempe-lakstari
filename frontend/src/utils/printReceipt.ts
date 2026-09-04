/**
 * Utilitas Pencetakan Struk / Nota Transaksi Toko Kripik Tempe Lakstari
 * Format dirancang kompatibel untuk printer thermal (58mm/80mm) maupun printer standar (A4/A5/PDF).
 */

export interface OrderItem {
  nama_product?: string;
  jumlah?: number;
  qty?: number;
  harga_product?: number | string;
  harga_satuan?: number | string;
  subtotal?: number | string;
  berat_product?: number;
  product?: {
    nama_product?: string;
    harga_product?: number | string;
  };
}

export interface OrderData {
  id_transaksi?: number;
  nomor_invoice: string;
  tanggal_transaksi?: string | Date;
  subtotal?: number | string;
  biaya_pengiriman?: number | string;
  diskon?: number | string;
  total_pembayaran: number | string;
  metode_pembayaran?: string;
  midtrans_payment_type?: string;
  payment_type?: string;
  status_pembayaran?: string;
  status_transaksi?: string;
  pelanggan?: {
    nama_pelanggan?: string;
    no_hp?: string;
    email?: string;
  };
  alamat?: {
    nama_penerima?: string;
    no_hp_penerima?: string;
    alamat_lengkap?: string;
    kecamatan?: string;
    kota?: string;
    provinsi?: string;
    kode_pos?: string;
    catatan?: string;
  };
  pengiriman?: {
    kurir?: string;
    layanan_kurir?: string;
    nomor_resi?: string;
    status_pengiriman?: string;
  };
  details?: OrderItem[];
}

const formatRupiah = (val: number | string | undefined | null): string => {
  const num = Number(val) || 0;
  return 'Rp ' + num.toLocaleString('id-ID');
};

const formatPaymentMethod = (method?: string): string => {
  if (!method) return 'Tunai / Standar';
  const m = method.toLowerCase();
  if (m.includes('qris')) return 'QRIS (Gopay/OVO/ShopeePay)';
  if (m.includes('bca')) return 'BCA Virtual Account';
  if (m.includes('bni')) return 'BNI Virtual Account';
  if (m.includes('bri')) return 'BRI Virtual Account';
  if (m.includes('mandiri') || m.includes('echannel')) return 'Mandiri Bill / VA';
  if (m.includes('gopay')) return 'GoPay';
  if (m.includes('shopeepay')) return 'ShopeePay';
  if (m.includes('cstore') || m.includes('indomaret') || m.includes('alfamart')) return 'Gerai Retail (Indomaret/Alfamart)';
  return method.replace(/_/g, ' ').toUpperCase();
};

export const printReceipt = (order: OrderData): void => {
  if (!order || !order.nomor_invoice) {
    console.error('Data pesanan tidak valid untuk mencetak struk.');
    return;
  }

  const invoice = order.nomor_invoice;
  const tgl = order.tanggal_transaksi
    ? new Date(order.tanggal_transaksi).toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleString('id-ID');

  const customerName = order.pelanggan?.nama_pelanggan || order.alamat?.nama_penerima || 'Pelanggan Toko';
  const customerPhone = order.pelanggan?.no_hp || order.alamat?.no_hp_penerima || '-';
  const isPaid = (order.status_pembayaran || '').toLowerCase() === 'paid';
  const paymentName = formatPaymentMethod(order.midtrans_payment_type || order.payment_type || order.metode_pembayaran);

  // Rincian Item
  const items = order.details && order.details.length > 0 ? order.details : [];
  let itemsHtml = '';

  if (items.length > 0) {
    items.forEach((it) => {
      const name = it.nama_product || it.product?.nama_product || 'Kripik Tempe Lakstari';
      const qty = it.jumlah || it.qty || 1;
      const price = Number(it.harga_product || it.harga_satuan || (it.subtotal ? Number(it.subtotal) / qty : 0));
      const sub = Number(it.subtotal || price * qty);

      itemsHtml += `
        <tr>
          <td colspan="2" class="item-name">${name}</td>
        </tr>
        <tr>
          <td class="item-calc">${qty} x ${formatRupiah(price)}</td>
          <td class="item-subtotal text-right">${formatRupiah(sub)}</td>
        </tr>
      `;
    });
  } else {
    // Fallback jika item detail belum di-load
    const fallbackTotal = Number(order.subtotal || order.total_pembayaran || 0);
    itemsHtml = `
      <tr>
        <td colspan="2" class="item-name">Kripik Tempe Khas Malang (Paket Belanja)</td>
      </tr>
      <tr>
        <td class="item-calc">1 x ${formatRupiah(fallbackTotal)}</td>
        <td class="item-subtotal text-right">${formatRupiah(fallbackTotal)}</td>
      </tr>
    `;
  }

  // Biaya-biaya
  const subtotalNum = Number(order.subtotal || 0);
  const ongkirNum = Number(order.biaya_pengiriman || 0);
  const diskonNum = Number(order.diskon || 0);
  const totalNum = Number(order.total_pembayaran || subtotalNum + ongkirNum - diskonNum);

  // Alamat Pengiriman jika ada
  let shippingHtml = '';
  if (order.alamat?.alamat_lengkap) {
    shippingHtml = `
      <div class="divider-single"></div>
      <div class="section-title">ALAMAT PENGIRIMAN:</div>
      <div class="shipping-info">
        <strong>${order.alamat.nama_penerima || customerName}</strong> (${order.alamat.no_hp_penerima || customerPhone})<br/>
        ${order.alamat.alamat_lengkap}<br/>
        ${order.alamat.kecamatan ? `${order.alamat.kecamatan}, ` : ''}${order.alamat.kota || ''} ${order.alamat.kode_pos || ''}
        ${order.pengiriman?.kurir ? `<br/><em>Kurir: ${order.pengiriman.kurir.toUpperCase()} ${order.pengiriman.layanan_kurir || ''}</em>` : ''}
        ${order.pengiriman?.nomor_resi ? `<br/><em>Resi: <strong>${order.pengiriman.nomor_resi}</strong></em>` : ''}
      </div>
    `;
  }

  const receiptHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Struk - ${invoice}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 3mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: 'Courier New', Courier, 'Lucida Console', Monaco, monospace;
      font-size: 11.5px;
      line-height: 1.35;
      color: #000;
      background: #fff;
      padding: 8px;
      width: 100%;
      max-width: 320px;
      margin: 0 auto;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    
    .store-header {
      text-align: center;
      margin-bottom: 6px;
    }
    .store-header h1 {
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
      text-transform: uppercase;
    }
    .store-header p {
      font-size: 10px;
      line-height: 1.3;
      color: #222;
    }
    
    .divider-double {
      border-top: 1px dashed #000;
      border-bottom: 1px dashed #000;
      height: 3px;
      margin: 6px 0;
    }
    .divider-single {
      border-top: 1px dashed #000;
      margin: 6px 0;
    }

    .meta-table {
      width: 100%;
      font-size: 11px;
      border-collapse: collapse;
      margin-bottom: 4px;
    }
    .meta-table td {
      padding: 1px 0;
      vertical-align: top;
    }
    .meta-table .label {
      width: 75px;
      color: #333;
    }
    .meta-table .colon {
      width: 8px;
    }
    .meta-table .val {
      word-break: break-all;
    }

    .status-badge {
      display: inline-block;
      border: 1.5px solid #000;
      padding: 2px 8px;
      font-weight: 800;
      font-size: 11px;
      letter-spacing: 1px;
      margin: 4px 0;
      text-align: center;
    }

    .items-table {
      width: 100%;
      font-size: 11px;
      border-collapse: collapse;
      margin: 4px 0;
    }
    .items-table .item-name {
      font-weight: bold;
      padding-top: 4px;
      word-break: break-word;
    }
    .items-table .item-calc {
      font-size: 10px;
      color: #333;
      padding-bottom: 4px;
    }
    .items-table .item-subtotal {
      font-weight: 600;
      vertical-align: bottom;
      padding-bottom: 4px;
    }

    .totals-table {
      width: 100%;
      font-size: 11px;
      border-collapse: collapse;
      margin-top: 4px;
    }
    .totals-table td {
      padding: 1.5px 0;
    }
    .grand-total-row td {
      font-size: 13px;
      font-weight: 900;
      border-top: 1px dashed #000;
      border-bottom: 1px dashed #000;
      padding: 5px 0;
    }

    .section-title {
      font-weight: bold;
      font-size: 10.5px;
      margin-bottom: 2px;
    }
    .shipping-info {
      font-size: 10px;
      line-height: 1.35;
      color: #222;
    }

    .footer {
      text-align: center;
      margin-top: 10px;
      padding-top: 4px;
      font-size: 9.5px;
      color: #333;
    }
    .barcode-sim {
      font-size: 14px;
      letter-spacing: 5px;
      font-weight: bold;
      margin: 5px 0 2px 0;
    }

    @media print {
      body {
        width: 100%;
        max-width: 100%;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="store-header">
    <h1>KRIPIK TEMPE LAKSTARI</h1>
    <p>Oleh-Oleh Khas Malang</p>
    <p>Jl. Sanan No. 85, Blimbing, Kota Malang</p>
    <p>WhatsApp: 0812-3456-7890 | Toko Lakstari</p>
  </div>

  <div class="divider-double"></div>

  <table class="meta-table">
    <tr>
      <td class="label">No. Invoice</td>
      <td class="colon">:</td>
      <td class="val bold">${invoice}</td>
    </tr>
    <tr>
      <td class="label">Tanggal</td>
      <td class="colon">:</td>
      <td class="val">${tgl}</td>
    </tr>
    <tr>
      <td class="label">Pelanggan</td>
      <td class="colon">:</td>
      <td class="val">${customerName}</td>
    </tr>
    <tr>
      <td class="label">No. HP</td>
      <td class="colon">:</td>
      <td class="val">${customerPhone}</td>
    </tr>
    <tr>
      <td class="label">Kasir/Sistem</td>
      <td class="colon">:</td>
      <td class="val">Admin Lakstari POS</td>
    </tr>
  </table>

  <div class="divider-single"></div>

  <table class="items-table">
    ${itemsHtml}
  </table>

  <div class="divider-single"></div>

  <table class="totals-table">
    ${subtotalNum > 0 ? `
    <tr>
      <td>Subtotal Produk</td>
      <td class="text-right">${formatRupiah(subtotalNum)}</td>
    </tr>` : ''}
    ${ongkirNum > 0 ? `
    <tr>
      <td>Biaya Pengiriman</td>
      <td class="text-right">${formatRupiah(ongkirNum)}</td>
    </tr>` : ''}
    ${diskonNum > 0 ? `
    <tr>
      <td>Potongan Diskon</td>
      <td class="text-right">-${formatRupiah(diskonNum)}</td>
    </tr>` : ''}
    <tr class="grand-total-row">
      <td>TOTAL AKHIR</td>
      <td class="text-right">${formatRupiah(totalNum)}</td>
    </tr>
    <tr>
      <td style="padding-top: 4px;">Metode Bayar</td>
      <td class="text-right bold" style="padding-top: 4px;">${paymentName}</td>
    </tr>
    <tr>
      <td>Status Pesanan</td>
      <td class="text-right bold">${(order.status_transaksi || 'Selesai').toUpperCase()}</td>
    </tr>
  </table>

  <div class="text-center" style="margin: 6px 0;">
    <div class="status-badge">
      ${isPaid ? 'LUNAS / PAID' : `STATUS: ${(order.status_pembayaran || 'PENDING').toUpperCase()}`}
    </div>
  </div>

  ${shippingHtml}

  <div class="divider-double"></div>

  <div class="footer">
    <div class="barcode-sim">||| | ||||| || |||||| | |||</div>
    <p class="bold">TERIMA KASIH ATAS PESANAN ANDA</p>
    <p>Simpan struk ini sebagai bukti transaksi resmi.</p>
    <p>Kripik Tempe Gurih & Renyah Asli Malang</p>
    <p><em>www.lakstari.my.id</em></p>
  </div>
</body>
</html>
  `;

  // Gunakan invisible iframe agar browser print dialog langsung terbuka tanpa diblokir pop-up blocker
  let iframe = document.getElementById('lakstari-receipt-frame') as HTMLIFrameElement | null;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'lakstari-receipt-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
  }

  const iframeDoc = iframe.contentWindow?.document;
  if (iframeDoc) {
    iframeDoc.open();
    iframeDoc.write(receiptHtml);
    iframeDoc.close();

    setTimeout(() => {
      try {
        iframe?.contentWindow?.focus();
        iframe?.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed, falling back to window.open:', err);
        fallbackWindowPrint(receiptHtml);
      }
    }, 250);
  } else {
    fallbackWindowPrint(receiptHtml);
  }
};

const fallbackWindowPrint = (html: string) => {
  const win = window.open('', '_blank', 'width=420,height=600');
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 300);
  } else {
    alert('Pop-up terblokir oleh browser. Harap izinkan pop-up untuk mencetak struk.');
  }
};
