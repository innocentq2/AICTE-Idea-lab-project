import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { UserCircle, LogOut, Save, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import aicteLogo from '../assets/aicte1.png';

interface AdminProfile { name: string; role: string; phone: string; bio: string; }

const TopHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AdminProfile>({ name: '', role: '', phone: '', bio: '' });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.email) {
      getDoc(doc(db, 'admin_profiles', user.email)).then(snap => {
        if (snap.exists()) setProfile(snap.data() as AdminProfile);
      });
    }
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/'); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'admin_profiles', user.email), profile, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Profile save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const initials = profile.name
    ? profile.name.substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() ?? 'AD';

  const displayName = profile.name || user?.displayName || user?.email?.split('@')[0];

  return (
    <>
      <header className="top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" className="header-logo-block">
            <div className="header-logo-icon" style={{ background: 'transparent', boxShadow: 'none' }}>
              <img src={aicteLogo} alt="Lab Logo" style={{ width: '95px', height: '90px', objectFit: 'contain' }} />
            </div>
            AICTE Idea Lab
          </Link>
          <div className="header-title-block">Innovation &amp; Incubation Center</div>
        </div>

        <div style={{ paddingRight: '1.5rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} ref={dropdownRef}>
              {/* Profile Avatar Button */}
              <button
                onClick={() => setDropdownOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  background: 'none', border: '2px solid #E2E8F0', borderRadius: '50px',
                  padding: '0.35rem 0.75rem 0.35rem 0.35rem',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: dropdownOpen ? '0 0 0 3px rgba(127,29,29,0.15)' : 'none',
                  borderColor: dropdownOpen ? '#7F1D1D' : '#E2E8F0',
                }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#7F1D1D,#450A0A)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                }}>
                  {initials}
                </div>
                <span style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}>
                  {displayName}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: '75px', right: '1.5rem',
                  background: 'white', borderRadius: '16px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #E2E8F0',
                  minWidth: '200px', zIndex: 200, overflow: 'hidden',
                  animation: 'fadeInDown 0.15s ease'
                }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F1F5F9' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>Signed in as</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>{user.email}</p>
                    {profile.role && <p style={{ fontSize: '0.8rem', color: '#7F1D1D', fontWeight: 600, marginTop: '0.15rem' }}>{profile.role}</p>}
                  </div>
                  <div style={{ padding: '0.5rem' }}>
                    <button
                      onClick={() => { setEditOpen(true); setDropdownOpen(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                        padding: '0.6rem 0.75rem', borderRadius: '10px', border: 'none',
                        background: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                        color: 'var(--text-main)', transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <UserCircle size={18} color="#7F1D1D" /> Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                        padding: '0.6rem 0.75rem', borderRadius: '10px', border: 'none',
                        background: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                        color: '#DC2626', transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
            >
              <UserCircle size={18} />
              Admin Login
            </Link>
          )}
        </div>
      </header>

      {/* Profile Edit Modal */}
      {editOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '2rem',
            width: '100%', maxWidth: '480px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
            position: 'relative', animation: 'fadeInDown 0.2s ease'
          }}>
            <button
              onClick={() => setEditOpen(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={22} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#7F1D1D,#450A0A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '1rem'
              }}>{initials}</div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Profile Settings</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</p>
              </div>
            </div>

            {saved && (
              <div style={{ background: '#DCFCE7', color: '#166534', padding: '0.75rem 1rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={16} /> Profile saved successfully!
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" placeholder="e.g. John Doe"
                  value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Role / Title</label>
                  <input type="text" className="form-input" placeholder="Lab Coordinator"
                    value={profile.role} onChange={e => setProfile(p => ({ ...p, role: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="tel" className="form-input" placeholder="+91..."
                    value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-input" placeholder="Brief description about your role..."
                  value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                  style={{ minHeight: '90px', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setEditOpen(false)}
                  style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: 'none', fontWeight: 600, cursor: 'pointer', color: 'var(--text-muted)' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}
                  style={{ width: 'auto', padding: '0.7rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default TopHeader;
