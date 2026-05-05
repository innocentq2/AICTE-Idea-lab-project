import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, getDoc, setDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, User, Database, Calendar, Briefcase, Users as UsersIcon, Save, CheckCircle, Menu, X } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  name: string;
  email: string;
  branch: string;
  studentClass: string;
  rollNo: string;
  mobileNo: string;
  wantToWorkOn: string;
  reasonOfWorking: string;
  timingIn: string;
  timingOut: string;
  timestamp: any;
}

interface AdminProfile {
  name: string;
  role: string;
  phone: string;
  bio: string;
}

type TabType = 'profile' | 'all' | 'regular' | 'meeting' | 'workshop';

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [collectionsData, setCollectionsData] = useState<Record<string, AttendanceRecord[]>>({});
  const [fetching, setFetching] = useState(true);
  
  // Sidebar state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile states
  const [profile, setProfile] = useState<AdminProfile>({ name: '', role: '', phone: '', bio: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      // Fetch Admin Profile
      getDoc(doc(db, 'admin_profiles', user.email!)).then(snap => {
        if (snap.exists()) {
          setProfile(snap.data() as AdminProfile);
        }
      });
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    if (activeTab === 'profile') return;

    let collectionsToFetch = [];
    if (activeTab === 'all') {
      collectionsToFetch = ['regular_attendance', 'meeting_attendance', 'workshop_attendance'];
    } else {
      let collectionName = 'regular_attendance';
      if (activeTab === 'meeting') collectionName = 'meeting_attendance';
      if (activeTab === 'workshop') collectionName = 'workshop_attendance';
      collectionsToFetch = [collectionName];
    }

    setFetching(true);
    setCollectionsData({});

    const unsubscribers = collectionsToFetch.map(colName => {
      const q = query(collection(db, colName), orderBy('timestamp', 'desc'));
      return onSnapshot(q, (querySnapshot) => {
        const data: AttendanceRecord[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as AttendanceRecord);
        });
        setCollectionsData(prev => ({
          ...prev,
          [colName]: data
        }));
        setFetching(false);
      }, (error) => {
        console.error("Error fetching data:", error);
        setFetching(false);
      });
    });

    return () => unsubscribers.forEach(unsubscribe => unsubscribe());
  }, [activeTab, isAdmin]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      await setDoc(doc(db, 'admin_profiles', user.email!), profile, { merge: true });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const getInitials = (name: string, email: string) => {
    if (name) return name.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return 'AD';
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Admin Portal...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return (
      <div className="attendance-layout">
        <div className="glass-panel" style={{ background: 'white' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#DC2626' }}>Access Denied</h2>
          <p>Sorry, your email ({user.email}) does not have admin privileges.</p>
        </div>
      </div>
    );
  }

  // Merge, Sort and Filter Data
  let displayRecords = Object.values(collectionsData).flat();
  
  displayRecords.sort((a, b) => {
    const timeA = a.timestamp?.seconds || 0;
    const timeB = b.timestamp?.seconds || 0;
    return timeB - timeA;
  });

  if (selectedDate) {
    displayRecords = displayRecords.filter(r => {
      if (!r.timestamp?.toDate) return false;
      const localDate = r.timestamp.toDate();
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      return dateStr === selectedDate;
    });
  }

  const exportPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(16);
    doc.text(`AICTE Idea Lab - Attendance Report (${activeTab.toUpperCase()})`, 14, 15);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    if (selectedDate) {
      doc.text(`Date: ${selectedDate}`, 14, 23);
    } else {
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 23);
    }

    autoTable(doc, {
      startY: 30,
      head: [['Sr. No.', 'Name', 'Email', 'Branch', 'Roll No', 'Work On', 'Reason', 'In', 'Out']],
      body: displayRecords.map((r, index) => [
        index + 1,
        r.name || '',
        r.email || '',
        r.branch || '',
        r.rollNo || '',
        r.wantToWorkOn || '',
        r.reasonOfWorking || '',
        r.timingIn || '-',
        r.timingOut || '-'
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 38, 38], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    const filename = `attendance_${activeTab}${selectedDate ? `_${selectedDate}` : ''}.pdf`;
    doc.save(filename);
  };

  const NavItem = ({ id, label, icon: Icon }: { id: TabType, label: string, icon: any }) => (
    <button 
      className={`admin-nav-item ${activeTab === id ? 'active' : ''}`}
      onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '2rem', position: 'relative' }}>
      
      {/* Mobile Sidebar Toggle */}
      <button 
        className="mobile-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{ 
          position: 'fixed', top: '80px', left: '1rem', zIndex: 100, 
          background: 'var(--gradient-maroon)', color: 'white', border: 'none', 
          borderRadius: '50%', width: '45px', height: '45px', display: 'none', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`admin-sidebar glass-panel ${sidebarOpen ? 'open' : ''}`} style={{ 
        width: '280px', flexShrink: 0, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem',
        height: 'calc(100vh - 120px)', position: 'sticky', top: '100px', overflowY: 'auto'
      }}>
        <div style={{ textAlign: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gradient-maroon)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 700,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: '4px solid white', margin: '0 auto 1rem'
          }}>
            {getInitials(profile.name, user.email!)}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            {profile.name || 'Admin User'}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.email}</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingLeft: '1rem' }}>
            Account
          </div>
          <NavItem id="profile" label="Profile Settings" icon={User} />
          
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1.5rem 0 0.5rem', paddingLeft: '1rem' }}>
            Attendance Data
          </div>
          <NavItem id="all" label="All Records" icon={Database} />
          <NavItem id="regular" label="Regular Entry" icon={Calendar} />
          <NavItem id="workshop" label="Workshops" icon={Briefcase} />
          <NavItem id="meeting" label="Meetings" icon={UsersIcon} />
        </nav>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {activeTab === 'profile' ? (
          <div className="glass-panel" style={{ background: 'white' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 className="page-title" style={{ fontSize: '2rem' }}>Admin Profile</h2>
              <p className="page-subtitle">Update your personal details and dashboard presence.</p>
            </div>

            {profileSaved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#DCFCE7', color: '#166534', padding: '1rem', borderRadius: '12px', marginBottom: '2rem' }}>
                <CheckCircle size={20} />
                <span style={{ fontWeight: 600 }}>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ maxWidth: '600px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Role / Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={profile.role}
                    onChange={e => setProfile({...profile, role: e.target.value})}
                    placeholder="e.g. Lab Coordinator"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    value={profile.phone}
                    onChange={e => setProfile({...profile, phone: e.target.value})}
                    placeholder="+91..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Short Bio</label>
                <textarea 
                  className="form-input" 
                  value={profile.bio}
                  onChange={e => setProfile({...profile, bio: e.target.value})}
                  placeholder="A brief description about your role..."
                  style={{ minHeight: '120px', resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={savingProfile}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}
              >
                <Save size={18} />
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-panel" style={{ background: 'white' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
              <div>
                <h2 className="page-title" style={{ fontSize: '2rem' }}>
                  {activeTab === 'all' && 'All Records'}
                  {activeTab === 'regular' && 'Regular Attendance'}
                  {activeTab === 'workshop' && 'Workshop Attendance'}
                  {activeTab === 'meeting' && 'Meeting Attendance'}
                </h2>
                <p className="page-subtitle" style={{ marginBottom: 0 }}>View and export attendance logs.</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input"
                  style={{ padding: '0.6rem 1rem', width: 'auto' }}
                />
                {selectedDate && (
                  <button 
                    onClick={() => setSelectedDate('')}
                    style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Clear
                  </button>
                )}
                <button 
                  onClick={exportPDF}
                  className="btn-primary" 
                  style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                  disabled={displayRecords.length === 0}
                >
                  <Download size={18} />
                  Export PDF
                </button>
              </div>
            </div>

            {/* Data Table */}
            <div className="table-container">
              {fetching && displayRecords.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Fetching records from the database...
                </div>
              ) : displayRecords.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>
                  No records found for the selected view.
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Roll No</th>
                      <th>Mobile</th>
                      <th>Work On</th>
                      <th>Time In</th>
                      <th>Time Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayRecords.map(record => (
                      <tr key={record.id}>
                        <td style={{ color: 'var(--text-muted)' }}>{record.timestamp?.toDate ? record.timestamp.toDate().toLocaleDateString() : 'N/A'}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{record.name}</td>
                        <td>{record.studentClass}</td>
                        <td>{record.rollNo}</td>
                        <td>{record.mobileNo}</td>
                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={record.wantToWorkOn}>
                          {record.wantToWorkOn}
                        </td>
                        <td style={{ fontWeight: 600, color: '#047857' }}>{record.timingIn}</td>
                        <td style={{ fontWeight: 600, color: '#B91C1C' }}>{record.timingOut}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          width: 100%;
        }

        .admin-nav-item:hover {
          background: rgba(220, 38, 38, 0.05);
          color: #DC2626;
        }

        .admin-nav-item.active {
          background: var(--gradient-red);
          color: white;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
        }

        @media (max-width: 900px) {
          .mobile-sidebar-toggle {
            display: flex !important;
          }
          .admin-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: -320px;
            height: 100vh !important;
            z-index: 99;
            transition: left 0.3s ease;
            box-shadow: var(--shadow-xl);
          }
          .admin-sidebar.open {
            left: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
