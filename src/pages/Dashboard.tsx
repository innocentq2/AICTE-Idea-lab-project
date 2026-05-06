import { Link } from 'react-router-dom';
import { Users, Info, QrCode, ClipboardList, MessageSquare, FileQuestion } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import bgAmbassadors from '../assets/ambassadors_bg.png';
import bgLabPortal from '../assets/lab_portal_bg.png';
import bgAttendance from '../assets/attendance_bg.png';
import bgAdmin from '../assets/admin_bg.png';

const Dashboard = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="dashboard-grid">
      <Link to="/ambassadors" className="dashboard-card-wrapper">
        <div className="dashboard-card" style={{
          backgroundImage: `linear-gradient(to bottom, rgba(127, 29, 29, 0.85), rgba(69, 10, 10, 0.95)), url(${bgAmbassadors})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div className="card-icon-wrapper">
            <Users size={52} strokeWidth={1.5} />
          </div>
          <h2 className="dashboard-card-title">Student Ambassadors</h2>
          <p className="dashboard-card-subtitle">Meet our lab representatives</p>
        </div>
      </Link>

      <Link to="/lab-portal" className="dashboard-card-wrapper">
        <div className="dashboard-card" style={{
          backgroundImage: `linear-gradient(to bottom, rgba(69, 10, 10, 0.85), rgba(23, 3, 3, 0.95)), url(${bgLabPortal})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div className="card-icon-wrapper">
            <Info size={52} strokeWidth={1.5} />
          </div>
          <h2 className="dashboard-card-title">Lab Portal</h2>
          <p className="dashboard-card-subtitle">About our innovation center</p>
        </div>
      </Link>

      <Link to="/attendance" className="dashboard-card-wrapper">
        <div className="dashboard-card" style={{
          backgroundImage: `linear-gradient(to bottom, rgba(220, 38, 38, 0.85), rgba(153, 27, 27, 0.95)), url(${bgAttendance})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div className="card-icon-wrapper">
            <QrCode size={52} strokeWidth={1.5} />
          </div>
          <h2 className="dashboard-card-title">Attendance</h2>
          <p className="dashboard-card-subtitle">Scan or enter your ID</p>
        </div>
      </Link>

      <Link to="/feedback" className="dashboard-card-wrapper">
        <div className="dashboard-card" style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(5, 150, 105, 0.85), rgba(4, 120, 87, 0.95))',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div className="card-icon-wrapper">
            <MessageSquare size={52} strokeWidth={1.5} />
          </div>
          <h2 className="dashboard-card-title">Feedback</h2>
          <p className="dashboard-card-subtitle">Share your lab experience</p>
        </div>
      </Link>

      <Link to="/questionnaire" className="dashboard-card-wrapper">
        <div className="dashboard-card" style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(217, 119, 6, 0.85), rgba(180, 83, 9, 0.95))',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div className="card-icon-wrapper">
            <FileQuestion size={52} strokeWidth={1.5} />
          </div>
          <h2 className="dashboard-card-title">Questionnaire</h2>
          <p className="dashboard-card-subtitle">Answer lab activity questions</p>
        </div>
      </Link>

      {isAdmin && (
        <Link to="/admin" className="dashboard-card-wrapper">
          <div className="dashboard-card" style={{
            backgroundImage: `linear-gradient(to bottom, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95)), url(${bgAdmin})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            <div className="card-icon-wrapper">
              <ClipboardList size={52} strokeWidth={1.5} />
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
