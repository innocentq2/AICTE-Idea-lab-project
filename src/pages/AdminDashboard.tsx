import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';

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

type TabType = 'all' | 'regular' | 'meeting' | 'workshop';

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [collectionsData, setCollectionsData] = useState<Record<string, AttendanceRecord[]>>({});
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;

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

  if (loading) {
    return <div>Loading...</div>;
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
    
    // Add title and date
    doc.setFontSize(16);
    doc.text(`AICTE Idea Lab - Attendance Report (${activeTab.toUpperCase()})`, 14, 15);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    if (selectedDate) {
      doc.text(`Filtered Date: ${selectedDate}`, 14, 23);
    } else {
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 23);
    }

    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Name', 'Email', 'Branch', 'Roll No', 'Work On', 'Reason', 'In', 'Out']],
      body: displayRecords.map(r => [
        r.timestamp?.toDate ? r.timestamp.toDate().toLocaleDateString() : 'N/A',
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

  return (
    <div className="page-container" style={{ maxWidth: '1400px', width: '95%' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 className="page-title" style={{ fontSize: '2rem' }}>Admin Dashboard</h2>
          <p className="page-subtitle" style={{ marginBottom: '1rem' }}>Welcome, {user.email}! Manage lab attendance below.</p>
        </div>
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
      
      {/* Filters and Tabs Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '1rem', gap: '1rem' }}>
        <div className="admin-tabs" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
          <button 
            className={`admin-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Lists
          </button>
          <button 
            className={`admin-tab ${activeTab === 'regular' ? 'active' : ''}`}
            onClick={() => setActiveTab('regular')}
          >
            Regular
          </button>
          <button 
            className={`admin-tab ${activeTab === 'meeting' ? 'active' : ''}`}
            onClick={() => setActiveTab('meeting')}
          >
            Meeting
          </button>
          <button 
            className={`admin-tab ${activeTab === 'workshop' ? 'active' : ''}`}
            onClick={() => setActiveTab('workshop')}
          >
            Workshop
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label htmlFor="dateFilter" style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Filter Date:</label>
          <input 
            type="date" 
            id="dateFilter"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-input"
            style={{ padding: '0.5rem 1rem', width: 'auto' }}
          />
          {selectedDate && (
            <button 
              onClick={() => setSelectedDate('')}
              style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: 600 }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        {fetching && displayRecords.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading records...
          </div>
        ) : displayRecords.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No records found for the selected filters.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Branch</th>
                <th>Class</th>
                <th>Roll No</th>
                <th>Mobile</th>
                <th>Work On</th>
                <th>Reason</th>
                <th>Time In</th>
                <th>Time Out</th>
              </tr>
            </thead>
            <tbody>
              {displayRecords.map(record => (
                <tr key={record.id}>
                  <td>{record.timestamp?.toDate ? record.timestamp.toDate().toLocaleDateString() : 'N/A'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{record.name}</td>
                  <td>{record.email}</td>
                  <td>{record.branch}</td>
                  <td>{record.studentClass}</td>
                  <td>{record.rollNo}</td>
                  <td>{record.mobileNo}</td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'normal' }}>{record.wantToWorkOn}</td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'normal' }}>{record.reasonOfWorking}</td>
                  <td style={{ fontWeight: 600 }}>{record.timingIn}</td>
                  <td style={{ fontWeight: 600 }}>{record.timingOut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
