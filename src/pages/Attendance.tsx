import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import aicteLogo from '../assets/aicte1.png';
import aicetLogo from '../assets/AICET.png';

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

const Attendance = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (!submitted) return;
    setCountdown(4);
    const tick = setInterval(() => setCountdown(c => c - 1), 1000);
    const redirect = setTimeout(() => navigate('/'), 4000);
    return () => { clearInterval(tick); clearTimeout(redirect); };
  }, [submitted, navigate]);
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
        await addDoc(collection(db, 'regular_attendance'), {
          ...formData,
          timestamp: serverTimestamp()
        });
        
        setSubmitted(true);
        setFormData({ 
          email: '', name: '', branch: '', studentClass: '', 
          rollNo: '', mobileNo: '', wantToWorkOn: '', 
          reasonOfWorking: '', timingIn: '', timingOut: '' 
        });
      } catch (error) {
        console.error('Error saving attendance:', error);
        alert('Failed to save attendance. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: '70vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1.5rem', textAlign: 'center', padding: '2rem'
      }}>
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #DC2626, #7F1D1D)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 40px rgba(220,38,38,0.35)', animation: 'pulse 1.5s infinite'
        }}>
          <CheckCircle size={56} color="white" />
        </div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
          🎉 Attendance Recorded!
        </h2>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '420px', margin: 0, lineHeight: 1.7 }}>
          Thank you for checking in to the <strong>IDEA Lab</strong>.<br />
          Have a productive session!
        </p>
        <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: 0 }}>
          Redirecting to home in <strong style={{ color: '#DC2626' }}>{countdown}</strong> seconds...
        </p>
        <button
          className="btn-primary"
          style={{ width: 'auto', padding: '0.75rem 2rem' }}
          onClick={() => navigate('/')}
        >
          Go to Home Now
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
        <img src={aicteLogo} alt="Lab Logo" style={{ width: '95px', height: '90px', objectFit: 'contain' }} />
        <h1 className="page-title" style={{ fontSize: '2rem', margin: 0, background: 'none', color: '#000', WebkitTextFillColor: 'initial', textAlign: 'center' }}>
          Ravindra Sakharpe IDEA Lab
        </h1>
        <img src={aicetLogo} alt="AICET Logo" style={{ width: '95px', height: '90px', objectFit: 'contain' }} />
      </div>
      <p className="page-subtitle">Mark your presence in the innovation lab today.</p>

      <div className="attendance-layout">
        {/* Left Side: QR Code Display */}
        <div className="glass-panel qr-section" style={{ height: 'fit-content', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '1.5rem' }}>
            Scan to Attend
          </h3>
          <div className="qr-code-wrapper" style={{ 
            background: 'white', padding: '1rem', borderRadius: '20px', 
            boxShadow: '0 12px 30px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0',
            display: 'inline-block'
          }}>
            <QRCodeSVG 
              value={attendanceLink} 
              size={200}
              fgColor="#0b0f19"
              bgColor="#ffffff"
            />
          </div>
          <p className="qr-instruction" style={{ marginTop: '1.5rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Point your phone camera at the QR code to quickly access this attendance form from your mobile device.
          </p>
        </div>

        {/* Right Side: Attendance Form */}
        <div className="glass-panel" style={{ background: 'white' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Student Entry</h3>
          
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#DC2626' }}>
              <CheckCircle size={48} style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Attendance Recorded!</h4>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Thank you for checking in.</p>
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

export default Attendance;
