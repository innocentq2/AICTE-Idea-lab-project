import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import TopHeader from './components/TopHeader';
import Dashboard from './pages/Dashboard';
import AmbassadorDirectory from './pages/AmbassadorDirectory';
import Attendance from './pages/Attendance';
import AttendanceHub from './pages/AttendanceHub';
import WorkshopAttendance from './pages/WorkshopAttendance';
import MeetingAttendance from './pages/MeetingAttendance';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import LabPortal from './pages/LabPortal';
import FeedbackForm from './pages/FeedbackForm';
import Questionnaire from './pages/Questionnaire';

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <TopHeader />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<div className="page-container"><Login /></div>} />
            <Route path="/admin" element={<div className="page-container"><AdminDashboard /></div>} />
            <Route path="/ambassadors" element={<div className="page-container"><AmbassadorDirectory /></div>} />
            <Route path="/attendance" element={<div className="page-container"><AttendanceHub /></div>} />
            <Route path="/regular-attendance" element={<div className="page-container"><Attendance /></div>} />
            <Route path="/workshop-attendance" element={<div className="page-container"><WorkshopAttendance /></div>} />
            <Route path="/meeting-attendance" element={<div className="page-container"><MeetingAttendance /></div>} />
            <Route path="/lab-portal" element={<div className="page-container"><LabPortal /></div>} />
            <Route path="/feedback" element={<div className="page-container"><FeedbackForm /></div>} />
            <Route path="/questionnaire" element={<div className="page-container"><Questionnaire /></div>} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
