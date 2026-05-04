import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

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

type TabType = 'regular' | 'meeting' | 'workshop';

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('regular');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;

    let collectionName = 'regular_attendance';
    if (activeTab === 'meeting') collectionName = 'meeting_attendance';
    if (activeTab === 'workshop') collectionName = 'workshop_attendance';

    setFetching(true);
    const q = query(collection(db, collectionName), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: AttendanceRecord[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as AttendanceRecord);
      });
      setRecords(data);
      setFetching(false);
    }, (error) => {
      console.error("Error fetching data:", error);
      setFetching(false);
    });

    return () => unsubscribe();
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

  return (
    <div className="page-container" style={{ maxWidth: '1400px', width: '95%' }}>
      <h2 className="page-title" style={{ fontSize: '2rem' }}>Admin Dashboard</h2>
      <p className="page-subtitle">Welcome, {user.email}! Manage lab attendance below.</p>
      
      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'regular' ? 'active' : ''}`}
          onClick={() => setActiveTab('regular')}
        >
          Regular Attendance
        </button>
        <button 
          className={`admin-tab ${activeTab === 'meeting' ? 'active' : ''}`}
          onClick={() => setActiveTab('meeting')}
        >
          Meeting Attendance
        </button>
        <button 
          className={`admin-tab ${activeTab === 'workshop' ? 'active' : ''}`}
          onClick={() => setActiveTab('workshop')}
        >
          Workshop Attendance
        </button>
      </div>

      {/* Data Table */}
      <div className="table-container">
        {fetching ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading records...
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No records found for {activeTab} attendance.
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
              {records.map(record => (
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
