import { Link } from 'react-router-dom';
import { Users, Info, QrCode, ClipboardList, MessageSquare, FileQuestion } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import bgAmbassadors from '../assets/ambassadors_bg.png';
import bgLabPortal from '../assets/lab_portal_bg.png';
import bgAttendance from '../assets/attendance_bg.png';
import bgAdmin from '../assets/admin_bg.png';
import LiveTelemetry from '../components/LiveTelemetry';
import Footer from '../components/Footer';

const Dashboard = () => {
  const { isAdmin } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <style>{`
        @keyframes pulse-telemetry {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.75; }
        }
        .heartbeat-icon {
          animation: pulse-telemetry 1.5s infinite ease-in-out;
          color: #EF4444;
          display: inline-block;
        }
        .telemetry-row {
          transition: background-color 0.2s ease;
        }
        .telemetry-row:hover {
          background-color: rgba(0, 0, 0, 0.02) !important;
        }
        @keyframes telemetry-spin {
          to { transform: rotate(360deg); }
        }
        .telemetry-spinner {
          animation: telemetry-spin 1s linear infinite;
        }
        /* Hide scrollbar for Chrome, Safari and Opera */
        .telemetry-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .telemetry-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
          border-radius: 4px;
        }
        .telemetry-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.12);
          border-radius: 4px;
        }
        .telemetry-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
        .footer-link {
          color: var(--text-muted);
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
        }
        .footer-link:hover {
          color: #7F1D1D;
          transform: translateX(4px);
        }
        .footer-icon {
          color: var(--text-muted);
          transition: all 0.3s ease;
        }
        .footer-contact-row:hover .footer-icon {
          color: #7F1D1D;
          transform: scale(1.1);
        }
        .footer-contact-row:hover {
          color: #7F1D1D;
        }
        .footer-contact-row {
          transition: all 0.3s ease;
          cursor: pointer;
        }
      `}</style>

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
            <div className="dashboard-card-text">
              <h2 className="dashboard-card-title">Student Ambassadors</h2>
              <p className="dashboard-card-subtitle">Meet our lab representatives</p>
            </div>
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
            <div className="dashboard-card-text">
              <h2 className="dashboard-card-title">Lab Portal</h2>
              <p className="dashboard-card-subtitle">About our innovation center</p>
            </div>
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
            <div className="dashboard-card-text">
              <h2 className="dashboard-card-title">Attendance</h2>
              <p className="dashboard-card-subtitle">Scan or enter your ID</p>
            </div>
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
            <div className="dashboard-card-text">
              <h2 className="dashboard-card-title">Feedback</h2>
              <p className="dashboard-card-subtitle">Share your lab experience</p>
            </div>
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
            <div className="dashboard-card-text">
              <h2 className="dashboard-card-title">Questionnaire</h2>
              <p className="dashboard-card-subtitle">Answer lab activity questions</p>
            </div>
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
              <div className="dashboard-card-text">
                <h2 className="dashboard-card-title">Admin Dashboard</h2>
                <p className="dashboard-card-subtitle">View and export attendance</p>
              </div>
            </div>
          </Link>
        )}
      </div>

      <LiveTelemetry />
      <Footer />
    </div>
  );
};

export default Dashboard;
