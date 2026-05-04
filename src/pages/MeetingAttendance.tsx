import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const BRANCHES = [
  'Civil Engineering',
  'Chemical Engineering',
  'ENTC Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Computer Science Engineering',
  'Computer Science and Business System Engineering',
  'Cyber Security',
  'MBA Department',
  'MCA Department',
  'YC, Warana-Science',
  'YC, Warana-Arts',
  'YC, Warana-Comerce',
  'Collage of Pharmacy',
  'Deploma TKIET',
  'ITI',
  'Architecture'
];

const CLASSES = [
  'F Y',
  'S Y',
  'T Y',
  'Final',
  'M E',
  'Teaching Staff',
  'Non Teaching Staff'
];

const MeetingAttendance = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    email: '', 
    name: '',
    branch: '',
    studentClass: '',
    rollNo: '',
    mobileNo: '',
    wantToWorkOn: '',
    reasonOfWorking: '',
    timingIn: '',
    timingOut: ''
  });

  // In a real app, this would be the actual URL of the deployed application
  const attendanceLink = window.location.href;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.email && formData.name && formData.branch && 
      formData.studentClass && formData.rollNo && formData.mobileNo && 
      formData.wantToWorkOn && formData.reasonOfWorking && 
      formData.timingIn && formData.timingOut
    ) {
      setLoading(true);
      try {
        await addDoc(collection(db, 'meeting_attendance'), {
          ...formData,
          timestamp: serverTimestamp()
        });
        
        setSubmitted(true);
        setFormData({ 
          email: '', name: '', branch: '', studentClass: '', 
          rollNo: '', mobileNo: '', wantToWorkOn: '', 
          reasonOfWorking: '', timingIn: '', timingOut: '' 
        });
        setTimeout(() => setSubmitted(false), 3000);
      } catch (error) {
        console.error('Error saving attendance:', error);
        alert('Failed to save attendance. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <h1 className="page-title" style={{ fontSize: '2rem' }}>
        Ravindra Sakharpe AICTE IDEA Lab, Warananagar.
      </h1>
      <p className="page-subtitle">Register your attendance for today's meeting.</p>

      <div className="attendance-layout">
        {/* Left Side: QR Code Display */}
        <div className="glass-panel qr-section" style={{ height: 'fit-content' }}>
          <div className="qr-code-wrapper">
            <QRCodeSVG 
              value={attendanceLink} 
              size={200}
              fgColor="#0b0f19"
              bgColor="#ffffff"
            />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            Scan to Attend
          </h3>
          <p className="qr-instruction">
            Point your phone camera at the QR code to quickly access this attendance form.
          </p>
        </div>

        {/* Right Side: Attendance Form */}
        <div className="glass-panel" style={{ background: 'white' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Participant Entry</h3>
          
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#DC2626' }}>
              <CheckCircle size={48} style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Attendance Recorded!</h4>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Thank you for attending the meeting.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email *</label>
                <input 
                  type="email" 
                  id="email" 
                  className="form-input" 
                  placeholder="Your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="name" className="form-label">Name of the Student *</label>
                <input 
                  type="text" 
                  id="name" 
                  className="form-input" 
                  placeholder="Your answer"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="branch" className="form-label">Branch of the Student *</label>
                <select 
                  id="branch" 
                  className="form-input" 
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  required
                  style={{ appearance: 'auto' }}
                >
                  <option value="" disabled>Select your branch</option>
                  {BRANCHES.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="studentClass" className="form-label">Class of the Student *</label>
                <select 
                  id="studentClass" 
                  className="form-input" 
                  value={formData.studentClass}
                  onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                  required
                  style={{ appearance: 'auto' }}
                >
                  <option value="" disabled>Select your class</option>
                  {CLASSES.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="rollNo" className="form-label">Roll No *</label>
                <input 
                  type="text" 
                  id="rollNo" 
                  className="form-input" 
                  placeholder="Your answer"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="mobileNo" className="form-label">Mobile No *</label>
                <input 
                  type="tel" 
                  id="mobileNo" 
                  className="form-input" 
                  placeholder="Your answer"
                  value={formData.mobileNo}
                  onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="wantToWorkOn" className="form-label">Want To Work on? *</label>
                <input 
                  type="text" 
                  id="wantToWorkOn" 
                  className="form-input" 
                  placeholder="Your answer"
                  value={formData.wantToWorkOn}
                  onChange={(e) => setFormData({ ...formData, wantToWorkOn: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reasonOfWorking" className="form-label">Reason of Working *</label>
                <input 
                  type="text" 
                  id="reasonOfWorking" 
                  className="form-input" 
                  placeholder="Your answer"
                  value={formData.reasonOfWorking}
                  onChange={(e) => setFormData({ ...formData, reasonOfWorking: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="timingIn" className="form-label">Timing IN *</label>
                  <input 
                    type="time" 
                    id="timingIn" 
                    className="form-input" 
                    value={formData.timingIn}
                    onChange={(e) => setFormData({ ...formData, timingIn: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="timingOut" className="form-label">Timing OUT *</label>
                  <input 
                    type="time" 
                    id="timingOut" 
                    className="form-input" 
                    value={formData.timingOut}
                    onChange={(e) => setFormData({ ...formData, timingOut: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ marginTop: '1rem', width: '100%', opacity: loading ? 0.7 : 1 }}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingAttendance;
