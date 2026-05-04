import { Link } from 'react-router-dom';
import { Users, Info, QrCode, ClipboardList } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="dashboard-grid">
      <Link to="/ambassadors" className="dashboard-card-wrapper">
        <div className="dashboard-card card-ambassador">
          <div className="card-icon-wrapper">
            <Users size={40} />
          </div>
          <h2 className="dashboard-card-title">Student Ambassadors</h2>
          <p className="dashboard-card-subtitle">Meet our lab representatives</p>
        </div>
      </Link>

      <Link to="/lab-portal" className="dashboard-card-wrapper">
        <div className="dashboard-card card-logo">
          <div className="card-icon-wrapper">
            <Info size={40} />
          </div>
          <h2 className="dashboard-card-title">Lab Portal</h2>
          <p className="dashboard-card-subtitle">About our innovation center</p>
        </div>
      </Link>

      <Link to="/attendance" className="dashboard-card-wrapper">
        <div className="dashboard-card card-attendance">
          <div className="card-icon-wrapper">
            <QrCode size={40} />
          </div>
          <h2 className="dashboard-card-title">Attendance</h2>
          <p className="dashboard-card-subtitle">Scan or enter your ID</p>
        </div>
      </Link>

      {isAdmin && (
        <Link to="/admin" className="dashboard-card-wrapper">
          <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' }}>
            <div className="card-icon-wrapper">
              <ClipboardList size={40} />
            </div>
            <h2 className="dashboard-card-title">Admin Dashboard</h2>
            <p className="dashboard-card-subtitle">View and export attendance</p>
          </div>
        </Link>
      )}
    </div>
  );
};

export default Dashboard;
