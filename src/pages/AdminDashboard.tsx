import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, Database, Calendar, Briefcase, Users as UsersIcon, Menu, X, MessageSquare, FileQuestion } from 'lucide-react';

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

type TabType = 'all' | 'regular' | 'meeting' | 'workshop' | 'feedback' | 'questionnaire';

interface FormRecord {
  id: string;
  [key: string]: any;
}

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [collectionsData, setCollectionsData] = useState<Record<string, AttendanceRecord[]>>({});
  const [fetching, setFetching] = useState(true);
  const [formsData, setFormsData] = useState<FormRecord[]>([]);
  const [formsFetching, setFormsFetching] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === 'feedback' || activeTab === 'questionnaire') return;

    let collectionsToFetch: string[] = [];
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
        setCollectionsData(prev => ({ ...prev, [colName]: data }));
        setFetching(false);
      }, (error) => {
        console.error('Error fetching data:', error);
        setFetching(false);
      });
    });

    return () => unsubscribers.forEach(u => u());
  }, [activeTab, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab !== 'feedback' && activeTab !== 'questionnaire') return;
    const colName = activeTab === 'feedback' ? 'feedback' : 'questionnaire_responses';
    setFormsFetching(true);
    setFormsData([]);
    const q = query(collection(db, colName), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const data: FormRecord[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() }));
      setFormsData(data);
      setFormsFetching(false);
    }, err => {
      console.error('Error fetching forms:', err);
      setFormsFetching(false);
    });
    return () => unsub();
  }, [activeTab, isAdmin]);

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
    doc.text(`Total Students: ${displayRecords.length}`, 14, 30);

    autoTable(doc, {
      startY: 37,
      head: [['Sr. No.', 'Name', 'Mobile No', 'Branch', 'Roll No', 'Work On', 'Reason', 'In', 'Out']],
      body: displayRecords.map((r, index) => [
        index + 1,
        r.name || '',
        r.mobileNo || '-',
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

  const exportFormsPDF = () => {
    const pdfDoc = new jsPDF('landscape');
    const isFeedback = activeTab === 'feedback';
    const title = isFeedback ? 'AICTE Idea Lab — Feedback Responses' : 'AICTE Idea Lab — Questionnaire Responses';

    pdfDoc.setFontSize(16);
    pdfDoc.text(title, 14, 15);
    pdfDoc.setFontSize(11);
    pdfDoc.setTextColor(100);
    pdfDoc.text(`Exported: ${new Date().toLocaleDateString()}`, 14, 23);
    pdfDoc.text(`Total Responses: ${formsData.length}`, 14, 30);

    if (isFeedback) {
      autoTable(pdfDoc, {
        startY: 37,
        head: [['Sr.', 'Name', 'Roll No', 'Branch', 'Year', 'College', 'Contact', 'Industry', 'Visit Date', 'Useful?', 'Overall']],
        body: formsData.map((r, i) => [
          i + 1,
          r.name || '-',
          r.rollNumber || '-',
          r.branch || '-',
          r.year || '-',
          r.collegeName || '-',
          r.contactNumber || '-',
          r.industryName || '-',
          r.visitDate || '-',
          r.visitUseful || '-',
          r.overallExperience ? `${r.overallExperience}/5` : '-'
        ]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [127, 29, 29], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });
    } else {
      autoTable(pdfDoc, {
        startY: 37,
        head: [['Sr.', 'Name', 'Roll No', 'Branch', 'Year', 'College', 'Contact', 'Industry', 'Understood?', 'Safety?', 'Learn More?']],
        body: formsData.map((r, i) => [
          i + 1,
          r.studentName || '-',
          r.rollNumber || '-',
          r.branch || '-',
          r.year || '-',
          r.collegeName || '-',
          r.contactNumber || '-',
          r.industryName || '-',
          r.understoodWorking || '-',
          r.safetyExplained || '-',
          r.wouldLearnMore || '-'
        ]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [127, 29, 29], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });
    }

    pdfDoc.save(`${activeTab}_responses_${new Date().toISOString().split('T')[0]}.pdf`);
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
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>

          {/* ── Attendance (accordion) ── */}
          <button
            onClick={() => setAttendanceOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: attendanceOpen ? 'rgba(127,29,29,0.08)' : 'transparent',
              color: attendanceOpen ? '#7F1D1D' : 'var(--text-main)',
              fontWeight: 700, fontSize: '0.95rem', width: '100%', transition: 'all 0.2s'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Database size={20} /> Attendance
            </span>
            <span style={{ fontSize: '0.7rem', transform: attendanceOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
          </button>

          {attendanceOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.75rem', borderLeft: '2px solid #F1F5F9', marginLeft: '1rem' }}>
              <NavItem id="all" label="All Records" icon={Database} />
              <NavItem id="regular" label="Regular Entry" icon={Calendar} />
              <NavItem id="workshop" label="Workshops" icon={Briefcase} />
              <NavItem id="meeting" label="Meetings" icon={UsersIcon} />
            </div>
          )}

          {/* ── Forms ── */}
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1rem 0 0.35rem', paddingLeft: '1rem' }}>
            Forms
          </div>
          <NavItem id="feedback" label="Feedback" icon={MessageSquare} />
          <NavItem id="questionnaire" label="Questionnaire" icon={FileQuestion} />
        </nav>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {(activeTab === 'feedback' || activeTab === 'questionnaire') ? (
          <div className="glass-panel" style={{ background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 className="page-title" style={{ fontSize: '2rem' }}>
                  {activeTab === 'feedback' ? 'Feedback Responses' : 'Questionnaire Responses'}
                </h2>
                <p className="page-subtitle" style={{ marginBottom: 0 }}>
                  {formsData.length} response{formsData.length !== 1 ? 's' : ''} collected
                </p>
              </div>
              <button
                onClick={exportFormsPDF}
                className="btn-primary"
                disabled={formsData.length === 0}
                style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
              >
                <Download size={18} />
                Export PDF
              </button>
            </div>
            <div className="table-container">
              {formsFetching ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Fetching responses...</div>
              ) : formsData.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No responses yet.</div>
              ) : activeTab === 'feedback' ? (
                <table className="admin-table">
                  <thead><tr>
                    <th>Sr.</th><th>Name</th><th>Roll No</th><th>Branch</th><th>Year</th>
                    <th>College</th><th>Contact</th><th>Industry</th>
                    <th>Visit Date</th><th>Useful?</th><th>Overall ⭐</th>
                  </tr></thead>
                  <tbody>
                    {formsData.map((r, i) => (
                      <tr key={r.id}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{r.name || '-'}</td>
                        <td>{r.rollNumber || '-'}</td>
                        <td>{r.branch || '-'}</td>
                        <td>{r.year || '-'}</td>
                        <td>{r.collegeName || '-'}</td>
                        <td>{r.contactNumber || '-'}</td>
                        <td>{r.industryName || '-'}</td>
                        <td>{r.visitDate || '-'}</td>
                        <td>{r.visitUseful || '-'}</td>
                        <td style={{ fontWeight: 700, color: '#DC2626' }}>{r.overallExperience ? `${r.overallExperience}/5` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="admin-table">
                  <thead><tr>
                    <th>Sr.</th><th>Name</th><th>Branch</th><th>Year</th>
                    <th>Roll No</th><th>Contact</th><th>Industry</th>
                    <th>Understood?</th><th>Safety?</th><th>Learn More?</th>
                  </tr></thead>
                  <tbody>
                    {formsData.map((r, i) => (
                      <tr key={r.id}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{r.studentName || '-'}</td>
                        <td>{r.branch || '-'}</td>
                        <td>{r.year || '-'}</td>
                        <td>{r.rollNumber || '-'}</td>
                        <td>{r.contactNumber || '-'}</td>
                        <td>{r.industryName || '-'}</td>
                        <td>{r.understoodWorking || '-'}</td>
                        <td>{r.safetyExplained || '-'}</td>
                        <td>{r.wouldLearnMore || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
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
                      <th>Sr. No.</th>
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
                    {displayRecords.map((record, index) => (
                      <tr key={record.id}>
                        <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
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
