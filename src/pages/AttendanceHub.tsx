import { Link } from 'react-router-dom';
import { Calendar, Briefcase, Users } from 'lucide-react';

const AttendanceHub = () => {
  return (
    <div className="dashboard-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">Select Attendance Type</h1>
        <p className="page-subtitle">Choose the appropriate attendance form below.</p>
      </div>

      <Link to="/regular-attendance" className="dashboard-card-wrapper">
        <div className="dashboard-card card-attendance">
          <div className="card-icon-wrapper">
            <Calendar size={40} />
          </div>
          <h2 className="dashboard-card-title">Regular Attendance</h2>
          <p className="dashboard-card-subtitle">Daily lab entry and exit</p>
        </div>
      </Link>

      <Link to="/workshop-attendance" className="dashboard-card-wrapper">
        <div className="dashboard-card card-ambassador">
          <div className="card-icon-wrapper">
            <Briefcase size={40} />
          </div>
          <h2 className="dashboard-card-title">Workshop Attendance</h2>
          <p className="dashboard-card-subtitle">Special events and training</p>
        </div>
      </Link>

      <Link to="/meeting-attendance" className="dashboard-card-wrapper">
        <div className="dashboard-card card-logo">
          <div className="card-icon-wrapper">
            <Users size={40} />
          </div>
          <h2 className="dashboard-card-title">Meeting Attendance</h2>
          <p className="dashboard-card-subtitle">Staff and committee meetings</p>
        </div>
      </Link>
    </div>
  );
};

export default AttendanceHub;
