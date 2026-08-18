import { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import './AdminManager.css';

const AdminManager: React.FC = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ nama_admin: '', username: '', email: '', password: '' });

  const fetchAdmins = async () => {
    const data = await apiService.getAdmins();
    setAdmins(data);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.nama_admin || !newAdmin.email || !newAdmin.password) return;

    const payload = {
       ...newAdmin,
       username: newAdmin.username || newAdmin.email.split('@')[0],
    };

    const success = await apiService.addAdminAccount(payload);
    if(success) {
       fetchAdmins();
       setNewAdmin({ nama_admin: '', username: '', email: '', password: '' });
       setIsModalOpen(false);
    } else {
       alert("Gagal menambahkan admin. Pastikan email/username belum terpakai.");
    }
  };

  const toggleStatus = async (id: number) => {
    const admin = admins.find((a: any) => a.id_admin === id);
    if(!admin) return;
    const newStatus = admin.status_admin === 'aktif' ? 'nonaktif' : 'aktif';
    const success = await apiService.updateAdminStatus(id, newStatus);
    if(success) fetchAdmins();
  };

  return (
    <div className="admin-manager-container">
      {/* Header Bar */}
      <div className="admin-manager-header-bar">
        <div className="admin-manager-header-title">
          <h2>Menu Pengelola Akun Admin</h2>
          <p>Tambah akun pengelola baru, kelola status aktif/nonaktif, dan pantau waktu Last Login.</p>
        </div>

        <button 
          className="btn-add-admin"
          onClick={() => setIsModalOpen(true)}
        >
          + Tambah Admin
        </button>
      </div>

      {/* Tabel Admin */}
      <div className="admin-table-card">
        <table className="admin-account-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Pengelola</th>
              <th>Username</th>
              <th>Email</th>
              <th>Status Akun</th>
              <th>Terakhir Login</th>
              <th>Aksi Status</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a: any) => (
              <tr key={a.id_admin}>
                <td><strong>#{a.id_admin}</strong></td>
                <td style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>{a.nama_admin}</td>
                <td><code>@{a.username}</code></td>
                <td>{a.email}</td>
                <td>
                  <span style={{
                    background: a.status_admin === 'aktif' ? '#DCFCE7' : '#FEE2E2',
                    color: a.status_admin === 'aktif' ? '#166534' : '#991B1B',
                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700
                  }}>
                    {a.status_admin}
                  </span>
                </td>
                <td style={{ fontSize: '12px', color: '#64748B' }}>
                  {a.last_login ? new Date(a.last_login).toLocaleString('id-ID') : 'Belum Pernah'}
                </td>
                <td>
                  <button 
                    onClick={() => toggleStatus(a.id_admin)}
                    style={{
                      background: a.status_admin === 'aktif' ? '#FEE2E2' : '#DCFCE7',
                      color: a.status_admin === 'aktif' ? '#991B1B' : '#166534',
                      border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer'
                    }}
                  >
                    {a.status_admin === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
                <tr>
                  <td colSpan={7} style={{textAlign: 'center', padding: '20px'}}>Belum ada admin terdaftar.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Admin */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{ background: '#fff', padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: 'var(--primary-dark)' }}>Tambah Akun Admin Baru</h3>
            <form onSubmit={handleAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold'}}>Nama Lengkap</label>
                <input required type="text" value={newAdmin.nama_admin} onChange={e => setNewAdmin({...newAdmin, nama_admin: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={{display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold'}}>Username (Opsional)</label>
                <input type="text" value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} style={inputStyle} placeholder="Otomatis dari email jika kosong" />
              </div>
              <div>
                <label style={{display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold'}}>Email Address</label>
                <input required type="email" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={{display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold'}}>Password (Hash MD5/Bcrypt via Server)</label>
                <input required type="password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} style={inputStyle} />
                <span style={{ fontSize: '10px', color: '#64748B' }}>*Sesuai PRD, password akan di-hash Bcrypt oleh Laravel demi keamanan (Zero Leak).</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: '#E2E8F0', color: '#1E293B', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' }}>Batal</button>
                <button type="submit" style={{ background: 'var(--primary-dark)', color: 'var(--primary-accent)', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' }}>Simpan Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' as const };

export default AdminManager;
