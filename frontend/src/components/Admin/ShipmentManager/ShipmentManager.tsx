import { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import './ShipmentManager.css';
import Swal from 'sweetalert2';

const STATUS_OPTIONS: Record<string, string> = {
  belum_diproses: 'Belum Diproses (Menunggu Pembayaran)',
  menunggu_pickup: 'Menunggu Pickup Kurir',
  dalam_perjalanan: 'Dalam Perjalanan (Diambil Kurir)',
  terkirim: 'Terkirim (Sampai di Pelanggan)',
  dibatalkan: 'Dibatalkan',
};

const STATUS_LABELS: Record<string, string> = {
  belum_diproses: 'Belum Diproses',
  menunggu_pickup: 'Menunggu Pickup',
  dalam_perjalanan: 'Dalam Perjalanan',
  terkirim: 'Terkirim',
  dibatalkan: 'Dibatalkan',
};

const formatRupiah = (n: number | string) =>
  'Rp ' + Number(n || 0).toLocaleString('id-ID');

const formatDate = (d: string | null) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (d: string | null) => {
  if (!d) return '-';
  return new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const ShipmentManager: React.FC = () => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [selectedShipmentDetail, setSelectedShipmentDetail] = useState<any | null>(null);
  const [editingResiShipment, setEditingResiShipment] = useState<any | null>(null);
  const [resiInput, setResiInput] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalShipments, setTotalShipments] = useState(0);

  const fetchShipments = async (page: number = 1, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await apiService.getShipments(page);
      if (data && data.data) {
        setShipments(data.data);
        setCurrentPage(data.current_page || 1);
        setLastPage(data.last_page || 1);
        setTotalShipments(data.total || 0);
      } else {
        setShipments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching shipments:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments(currentPage, true);
  }, [currentPage]);

  const getStatusCount = (tab: string) => {
    if (tab === 'Semua') return shipments.length;
    const normalized = tab.toLowerCase().replace(/ /g, '_');
    return shipments.filter((s: any) => {
      const st = (s.status_pengiriman || '').toLowerCase();
      if (normalized === 'terkirim' && (st === 'terkirim' || st === 'selesai')) return true;
      if (normalized === 'dalam_perjalanan' && (st === 'dalam_perjalanan' || st === 'dikirim')) return true;
      return st === normalized;
    }).length;
  };

  const filteredShipments = shipments.filter((s: any) => {
    if (statusFilter !== 'Semua') {
      const normalizedFilter = statusFilter.toLowerCase().replace(/ /g, '_');
      const st = (s.status_pengiriman || '').toLowerCase();
      if (normalizedFilter === 'terkirim' && (st === 'terkirim' || st === 'selesai')) {
        // match
      } else if (normalizedFilter === 'dalam_perjalanan' && (st === 'dalam_perjalanan' || st === 'dikirim')) {
        // match
      } else if (st !== normalizedFilter) {
        return false;
      }
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const invoice = (s.transaksi?.nomor_invoice || '').toLowerCase();
    const resi = (s.nomor_resi || '').toLowerCase();
    const customer = (s.transaksi?.pelanggan?.nama_pelanggan || '').toLowerCase();
    const recipient = (s.alamat?.nama_penerima || '').toLowerCase();
    const phone = (s.alamat?.no_hp_penerima || s.transaksi?.pelanggan?.no_hp || '').toLowerCase();
    const courier = (s.kurir || '').toLowerCase();

    return invoice.includes(q) || resi.includes(q) || customer.includes(q) || recipient.includes(q) || phone.includes(q) || courier.includes(q);
  });

  const handleStatusChange = async (id: number, newStatus: string) => {
    if (newStatus === 'dibatalkan') {
      const result = await Swal.fire({
        title: 'Batalkan Pengiriman & Pesanan?',
        text: 'Pesanan di Biteship akan dibatalkan otomatis dan stok produk akan dikembalikan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DC2626',
        cancelButtonColor: '#64748B',
        confirmButtonText: 'Ya, Batalkan',
        cancelButtonText: 'Kembali'
      });
      if (!result.isConfirmed) return;
    }

    setUpdatingId(id);

    // Optimistic Update: langsung perbarui status lokal agar kartu tidak reload/berkedip
    setShipments((prev) =>
      prev.map((s: any) =>
        s.id_pengiriman === id ? { ...s, status_pengiriman: newStatus } : s
      )
    );

    const success = await apiService.updateShipment(id, { status_pengiriman: newStatus });
    if (success) {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      Toast.fire({
        icon: 'success',
        title: 'Status pengiriman berhasil diperbarui'
      });
      // Sinkronisasi data di latar belakang tanpa memicu spinner reload
      await fetchShipments(currentPage, false);
    } else {
      await fetchShipments(currentPage, false);
      Swal.fire({
        title: 'Gagal',
        text: 'Gagal memperbarui status pengiriman',
        icon: 'error'
      });
    }
    setUpdatingId(null);
  };

  const handleSaveResi = async () => {
    if (!editingResiShipment) return;

    const id = editingResiShipment.id_pengiriman;
    const newResi = resiInput.trim();
    setEditingResiShipment(null);

    // Optimistic Update
    setShipments((prev) =>
      prev.map((s: any) =>
        s.id_pengiriman === id ? { ...s, nomor_resi: newResi } : s
      )
    );

    const success = await apiService.updateShipment(id, {
      nomor_resi: newResi
    });

    if (success) {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      Toast.fire({
        icon: 'success',
        title: 'Nomor resi berhasil diperbarui'
      });
      await fetchShipments(currentPage, false);
    } else {
      await fetchShipments(currentPage, false);
    }
  };

  return (
    <div className="shipment-manager-container">
      {/* ═══════════ HEADER BAR ═══════════ */}
      <div className="shipment-header-bar">
        <div className="shipment-header-title">
          <h2>Manajemen Pengiriman Paket</h2>
          <p>Pantau nomor resi kurir, jadwal pickup, dan status ekspedisi secara real-time.</p>
        </div>
        <div className="sm-header-search-wrap">
          <input
            type="text"
            className="sm-header-search-input"
            placeholder="🔍 Cari invoice / resi / pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="sm-search-clear-btn" onClick={() => setSearchQuery('')} title="Hapus pencarian">✕</button>
          )}
        </div>
      </div>

      {/* ═══════════ FILTER TABS ═══════════ */}
      <div className="sm-filter-tabs">
        {['Semua', 'Belum Diproses', 'Menunggu Pickup', 'Dalam Perjalanan', 'Terkirim', 'Dibatalkan'].map((status) => {
          const count = getStatusCount(status);
          return (
            <button
              key={status}
              className={`sm-filter-tab-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              <span>{status}</span>
              {count > 0 && <span className="sm-tab-counter">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* ═══════════ DAFTAR KARTU PENGIRIMAN ═══════════ */}
      <div className="sm-cards-list">
        {isLoading ? (
          <div className="sm-loading-state">
            <div className="sm-spinner" />
            <span>Memuat data pengiriman...</span>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="sm-empty-card">
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}></span>
            <p style={{ fontWeight: 600, color: '#64748B' }}>
              {searchQuery ? `Tidak ada pengiriman yang cocok dengan "${searchQuery}"` : 'Belum ada data pengiriman untuk status ini.'}
            </p>
            {searchQuery && (
              <button
                className="sm-empty-reset-btn"
                onClick={() => setSearchQuery('')}
              >
                Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          filteredShipments.map((s: any) => {
            const rawStatus = (s.status_pengiriman || 'belum_diproses').toLowerCase();
            const recipientName = s.alamat?.nama_penerima || s.transaksi?.pelanggan?.nama_pelanggan || '-';
            const recipientPhone = s.alamat?.no_hp_penerima || s.transaksi?.pelanggan?.no_hp || '';
            const fullAddress = s.alamat ? `${s.alamat.alamat_lengkap || ''}, Kec. ${s.alamat.kecamatan || ''}, ${s.alamat.kota || ''}, ${s.alamat.provinsi || ''} ${s.alamat.kode_pos || ''}` : '-';

            return (
              <div key={s.id_pengiriman} className="sm-card">
                {/* Header Kartu (Navy) */}
                <div className="sm-card-header">
                  <div className="sm-card-invoice">
                    <span>#{s.transaksi?.nomor_invoice || `TRX-${s.id_transaksi}`}</span>
                  </div>
                  <div className="sm-card-courier-tag">
                    {s.kurir || 'Kurir Lokal'} • {s.layanan_kurir || s.layanan || 'REG'} ({s.berat_total ? (s.berat_total >= 1000 ? `${(s.berat_total / 1000).toFixed(1).replace('.0', '')}kg` : `${s.berat_total}g`) : '1kg'})
                  </div>
                </div>

                {/* Badan Kartu */}
                <div className="sm-card-body">
                  {/* Baris 1: Penerima & Resi */}
                  <div className="sm-customer-row">
                    <div className="sm-customer-info">
                      <strong className="sm-customer-name">{recipientName}</strong>
                      {recipientPhone && <span className="sm-customer-phone">({recipientPhone})</span>}
                    </div>
                    <div className="sm-customer-resi">
                      {s.nomor_resi ? (
                        <button
                          type="button"
                          className="sm-resi-tag"
                          title="Klik untuk ubah nomor resi"
                          onClick={() => {
                            setEditingResiShipment(s);
                            setResiInput(s.nomor_resi || '');
                          }}
                        >
                          Resi: <strong>{s.nomor_resi}</strong>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="sm-no-resi"
                          title="Klik untuk input resi baru"
                          onClick={() => {
                            setEditingResiShipment(s);
                            setResiInput('');
                          }}
                        >
                          + Input Resi
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Baris 2: Alamat Pengiriman */}
                  <div className="sm-address-row">
                    <span className="sm-address-dest">Tujuan:</span>
                    <span className="sm-address-text">{fullAddress}</span>
                  </div>

                  {/* Catatan Pembeli jika ada */}
                  {s.alamat?.catatan && (
                    <div className="sm-catatan-tag">
                      <span className="sm-catatan-label">Catatan:</span>
                      <span className="sm-catatan-text">{s.alamat.catatan}</span>
                    </div>
                  )}

                  {/* Baris 3: Status Badge & Informasi Waktu */}
                  <div className="sm-badges-row">
                    <span className={`sm-badge sm-badge-${rawStatus}`}>
                      {STATUS_LABELS[rawStatus] || s.status_pengiriman}
                    </span>
                    <span className="sm-info-badge">
                      Ongkir: {formatRupiah(s.biaya_pengiriman)}
                    </span>
                    {s.tanggal_dikirim && (
                      <span className="sm-info-badge">
                        Dikirim: {formatDate(s.tanggal_dikirim)}
                      </span>
                    )}
                    {s.tanggal_selesai && (
                      <span className="sm-info-badge">
                        Sampai: {formatDate(s.tanggal_selesai)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Kartu: Ubah Status & Tombol Aksi */}
                <div className="sm-card-footer">
                  <div className="sm-status-wrap">
                    <label className="sm-status-label">Status:</label>
                    <select
                      className="sm-status-select"
                      value={rawStatus === 'selesai' ? 'terkirim' : (rawStatus === 'dikirim' ? 'dalam_perjalanan' : rawStatus)}
                      disabled={updatingId === s.id_pengiriman}
                      onChange={(e) => handleStatusChange(s.id_pengiriman, e.target.value)}
                    >
                      {Object.entries(STATUS_OPTIONS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm-actions-wrap">
                    <button
                      className="sm-btn sm-btn-resi"
                      onClick={() => {
                        setEditingResiShipment(s);
                        setResiInput(s.nomor_resi || '');
                      }}
                    >
                      Edit Resi
                    </button>
                    <button
                      className="sm-btn sm-btn-detail"
                      onClick={() => setSelectedShipmentDetail(s)}
                    >
                      Detail Paket
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="sm-pagination">
            <span className="sm-page-info">Total: {totalShipments} pengiriman</span>
            <button
              className="sm-page-btn"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ‹ Sebelumnya
            </button>
            <span className="sm-page-current">Halaman {currentPage} dari {lastPage}</span>
            <button
              className="sm-page-btn"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, lastPage))}
              disabled={currentPage === lastPage}
            >
              Selanjutnya ›
            </button>
          </div>
        )}
      </div>

      {/* ═══════════ MODAL EDIT RESI ═══════════ */}
      {editingResiShipment && (
        <div className="sm-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditingResiShipment(null); }}>
          <div className="sm-modal sm-modal-sm">
            <div className="sm-modal-header">
              <h2>Input / Edit Resi: <span>{editingResiShipment.transaksi?.nomor_invoice}</span></h2>
              <button className="sm-modal-close" onClick={() => setEditingResiShipment(null)}>✕</button>
            </div>
            <div className="sm-modal-body">
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                Nomor Resi Kurir ({editingResiShipment.kurir || 'Ekspedisi'}):
              </label>
              <input
                type="text"
                value={resiInput}
                onChange={(e) => setResiInput(e.target.value)}
                placeholder="Contoh: JT8899001122"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none',
                  fontFamily: 'monospace'
                }}
                autoFocus
              />
              <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                Nomor resi ini akan langsung dapat dilacak oleh pembeli di halaman Lacak Pesanan.
              </p>
            </div>
            <div className="sm-modal-footer">
              <button
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                onClick={() => setEditingResiShipment(null)}
              >
                Batal
              </button>
              <button
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#232B45',
                  color: '#FAAC30',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                onClick={handleSaveResi}
              >
                Simpan Resi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL DETAIL PAKET & PENGIRIMAN ═══════════ */}
      {selectedShipmentDetail && (
        <div className="sm-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedShipmentDetail(null); }}>
          <div className="sm-modal">
            <div className="sm-modal-header">
              <h2>Detail Pengiriman: <span>{selectedShipmentDetail.transaksi?.nomor_invoice}</span></h2>
              <button className="sm-modal-close" onClick={() => setSelectedShipmentDetail(null)}>✕</button>
            </div>

            <div className="sm-modal-body">
              <div className="sm-modal-grid">
                {/* Kolom Kiri: Info Kurir & Resi */}
                <div>
                  <h3 className="sm-modal-section-title">Informasi Ekspedisi & Resi</h3>
                  <div className="sm-modal-info-list">
                    <div className="sm-modal-info-row">
                      <span>Kurir</span>
                      <strong>{selectedShipmentDetail.kurir || '-'} ({selectedShipmentDetail.layanan_kurir || selectedShipmentDetail.layanan || 'REG'})</strong>
                    </div>
                    <div className="sm-modal-info-row">
                      <span>Nomor Resi</span>
                      <strong style={{ fontFamily: 'monospace' }}>{selectedShipmentDetail.nomor_resi || 'Belum diisi'}</strong>
                    </div>
                    <div className="sm-modal-info-row">
                      <span>Status</span>
                      <span className={`sm-badge sm-badge-${(selectedShipmentDetail.status_pengiriman || '').toLowerCase()}`}>
                        {STATUS_LABELS[(selectedShipmentDetail.status_pengiriman || '').toLowerCase()] || selectedShipmentDetail.status_pengiriman}
                      </span>
                    </div>
                    <div className="sm-modal-info-row">
                      <span>Total Berat</span>
                      <strong>{selectedShipmentDetail.berat_total || 0} gram</strong>
                    </div>
                    <div className="sm-modal-info-row">
                      <span>Biaya Ongkir</span>
                      <strong>{formatRupiah(selectedShipmentDetail.biaya_pengiriman)}</strong>
                    </div>
                    <div className="sm-modal-info-row">
                      <span>Tgl Dikirim</span>
                      <strong>{formatDateTime(selectedShipmentDetail.tanggal_dikirim)}</strong>
                    </div>
                    <div className="sm-modal-info-row">
                      <span>Tgl Sampai</span>
                      <strong>{formatDateTime(selectedShipmentDetail.tanggal_selesai)}</strong>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Alamat Tujuan */}
                <div>
                  <h3 className="sm-modal-section-title">Alamat Penerima</h3>
                  <div className="sm-modal-info-list">
                    <div className="sm-modal-info-row">
                      <span>Nama</span>
                      <strong>{selectedShipmentDetail.alamat?.nama_penerima || selectedShipmentDetail.transaksi?.pelanggan?.nama_pelanggan || '-'}</strong>
                    </div>
                    <div className="sm-modal-info-row">
                      <span>No. Handphone</span>
                      <strong>{selectedShipmentDetail.alamat?.no_hp_penerima || selectedShipmentDetail.transaksi?.pelanggan?.no_hp || '-'}</strong>
                    </div>
                    <div className="sm-modal-info-row">
                      <span>Alamat</span>
                      <strong>{selectedShipmentDetail.alamat?.alamat_lengkap || '-'}</strong>
                    </div>
                    <div className="sm-modal-info-row">
                      <span>Wilayah</span>
                      <strong>{selectedShipmentDetail.alamat?.kecamatan}, {selectedShipmentDetail.alamat?.kota}, {selectedShipmentDetail.alamat?.provinsi} {selectedShipmentDetail.alamat?.kode_pos}</strong>
                    </div>
                    {selectedShipmentDetail.alamat?.catatan && (
                      <div className="sm-modal-info-row">
                        <span>Catatan</span>
                        <strong style={{ color: '#92400e' }}>{selectedShipmentDetail.alamat.catatan}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rincian Produk untuk Packing */}
              <h3 className="sm-modal-section-title" style={{ marginTop: '10px' }}>Rincian Isi Paket (Barang untuk Dipacking)</h3>
              <div className="sm-modal-table-wrap">
                <table className="sm-modal-table">
                  <thead>
                    <tr>
                      <th>Nama Produk</th>
                      <th style={{ textAlign: 'center' }}>Varian</th>
                      <th style={{ textAlign: 'center' }}>Jumlah</th>
                      <th style={{ textAlign: 'right' }}>Berat / Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedShipmentDetail.transaksi?.details && selectedShipmentDetail.transaksi.details.length > 0 ? (
                      selectedShipmentDetail.transaksi.details.map((d: any, idx: number) => (
                        <tr key={idx}>
                          <td><strong>{d.nama_product || d.product?.nama_product || 'Produk'}</strong></td>
                          <td style={{ textAlign: 'center' }}>{d.product?.varian_rasa || '-'}</td>
                          <td style={{ textAlign: 'center', fontWeight: 800 }}>x{d.jumlah}</td>
                          <td style={{ textAlign: 'right' }}>{d.berat_product || d.product?.berat_product || 150}g</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>Tidak ada rincian produk</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="sm-modal-footer">
              <button
                className="sm-btn sm-btn-resi"
                onClick={() => setSelectedShipmentDetail(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentManager;
