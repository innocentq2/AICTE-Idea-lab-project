import { Link } from 'react-router-dom';
import { Calendar, Briefcase, Users } from 'lucide-react';
import bgRegular from '../assets/regular_attendance_bg.png';
import bgWorkshop from '../assets/workshop_attendance_bg.png';
import bgMeeting from '../assets/meeting_attendance_bg.png';

const AttendanceHub = () => {
  return (
    <div className="dashboard-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">Select Attendance Type</h1>
        <p className="page-subtitle">Choose the appropriate attendance form below.</p>
      </div>

      <Link to="/regular-attendance" className="dashboard-card-wrapper">
        <div className="dashboard-card" style={{
          backgroundImage: `linear-gradient(to bottom, rgba(220, 38, 38, 0.85), rgba(153, 27, 27, 0.95)), url(${bgRegular})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div className="card-icon-wrapper">
            <Calendar size={52} strokeWidth={1.5} />
          </div>
          <h2 className="dashboard-card-title">Regular Attendance</h2>
          <p className="dashboard-card-subtitle">Daily lab entry and exit</p>
        </div>
      </Link>

      <Link to="/workshop-attendance" className="dashboard-card-wrapper">
        <div className="dashboard-card" style={{
          backgroundImage: `linear-gradient(to bottom, rgba(127, 29, 29, 0.85), rgba(69, 10, 10, 0.95)), url(${bgWorkshop})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div className="card-icon-wrapper">
            <Briefcase size={52} strokeWidth={1.5} />
          </div>
          <h2 className="dashboard-card-title">Workshop Attendance</h2>
          <p className="dashboard-card-subtitle">Special events and training</p>
        </div>
      </Link>

      <Link to="/meeting-attendance" className="dashboard-card-wrapper">
        <div className="dashboard-card" style={{
          backgroundImage: `linear-gradient(to bottom, rgba(69, 10, 10, 0.85), rgba(23, 3, 3, 0.95)), url(${bgMeeting})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div className="card-icon-wrapper">
            <Users size={52} strokeWidth={1.5} />
          </div>
          <h2 className="dashboard-card-title">Meeting Attendance</h2>
          <p className="dashboard-card-subtitle">Staff and committee meetings</p>
        </div>
      </Link>
    </div>
  );
};

export default AttendanceHub;
