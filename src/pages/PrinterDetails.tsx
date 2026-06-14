import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Activity, User, Clock, FileText, CheckCircle, AlertTriangle, Plus, X } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import printerBg from '../assets/printer_bg.png';
import printingGif from '../assets/printing.gif';
import { useAuth } from '../contexts/AuthContext';

interface PrinterData {
  id: number;
  name: string;
  type: string;
  location: string;
  imageUrl: string;
  status: 'Available' | 'In Use';
  currentOperator: string;
  operatorEmail: string;
  operatorBranch: string;
  operatorClass: string;
  operatorMobile: string;
  operatorRollNo?: string;
  useReason: string;
  timingIn: string;
  timingOut: string;
  participants?: string[];
  objectName?: string;
  printingDuration?: string;
  materialConsumption?: string;
  sessionEndTime?: string;
}

interface SessionRecord {
  id: string;
  name: string;
  email?: string;
  branch: string;
  studentClass: string;
  rollNo?: string;
  mobileNo?: string;
  timingIn: string;
  timingOut: string;
  useReason: string;
  timestamp: any;
  participants?: string[];
  objectName?: string;
  printingDuration?: string;
  materialConsumption?: string;
  sessionEndTime?: string;
}

const BRANCHES = [
  'Computer Science Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'ENTC Engineering',
  'Electrical Engineering',
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

const parseDurationToMinutes = (durationStr: string): number => {
  const clean = durationStr.toLowerCase().trim();

  // Try matching "Xh Ym" or "XhYm" or "X h Y m"
  const hourMinRegex = /(\d+)\s*h(?:our)?s?\s*(\d+)\s*m(?:in)?s?/;
  const hmMatch = clean.match(hourMinRegex);
  if (hmMatch) {
    return parseInt(hmMatch[1]) * 60 + parseInt(hmMatch[2]);
  }

  // Try matching just hours: "Xh" or "X hours"
  const hourRegex = /(\d+(?:\.\d+)?)\s*h(?:our)?s?/;
  const hMatch = clean.match(hourRegex);
  if (hMatch) {
    return Math.round(parseFloat(hMatch[1]) * 60);
  }

  // Try matching just minutes: "Ym" or "Y mins" or "Y minutes"
  const minRegex = /(\d+)\s*m(?:in)?s?/;
  const mMatch = clean.match(minRegex);
  if (mMatch) {
    return parseInt(mMatch[1]);
  }

  // Try matching HH:MM format
  const colonRegex = /(\d+):(\d+)/;
  const colonMatch = clean.match(colonRegex);
  if (colonMatch) {
    return parseInt(colonMatch[1]) * 60 + parseInt(colonMatch[2]);
  }

  // If it's just a number, assume it's in minutes
  const numMatch = clean.match(/^(\d+)$/);
  if (numMatch) {
    return parseInt(numMatch[1]);
  }

  // Default fallback: 60 minutes
  return 60;
};

const formatDurationString = (durationStr: string): string => {
  const parts = durationStr.split(':');
  if (parts.length === 2) {
    const hrs = String(parseInt(parts[0], 10)).padStart(2, '0');
    const mins = String(parseInt(parts[1], 10)).padStart(2, '0');
    return `${hrs}:${mins}`;
  }
  return durationStr;
};

const PrinterDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const printerId = String(id);

  const [printer, setPrinter] = useState<PrinterData | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStartingSession, setIsStartingSession] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState(user?.email || '');
  const [formBranch, setFormBranch] = useState(BRANCHES[0]);
  const [formClass, setFormClass] = useState(CLASSES[0]);
  const [formRollNo, setFormRollNo] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formReason, setFormReason] = useState('');
  const [submittingSession, setSubmittingSession] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [formObjectName, setFormObjectName] = useState('');
  const [formDurationHours, setFormDurationHours] = useState('01');
  const [formDurationMinutes, setFormDurationMinutes] = useState('00');
  const [formConsumption, setFormConsumption] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!printer || printer.status !== 'In Use' || !printer.sessionEndTime) {
      setTimeLeft('');
      return;
    }

    const updateRemaining = () => {
      const diff = new Date(printer.sessionEndTime!).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hrs > 0 ? `${hrs}h ` : ''}${mins}m ${secs}s remaining`);
    };

    updateRemaining();
    const timer = setInterval(updateRemaining, 1000);
    return () => clearInterval(timer);
  }, [printer]);

  // 1. Listen to printer details
  useEffect(() => {
    if (!printerId) return;
    const unsubPrinter = onSnapshot(doc(db, 'printer_details', printerId), async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const now = new Date();
        if (data.status === 'In Use' && data.sessionEndTime && now > new Date(data.sessionEndTime)) {
          // Auto-release
          try {
            await setDoc(doc(db, 'printer_details', printerId), {
              status: 'Available',
              currentOperator: '',
              operatorEmail: '',
              operatorBranch: '',
              operatorClass: '',
              operatorMobile: '',
              operatorRollNo: '',
              useReason: '',
              timingIn: '',
              timingOut: '',
              participants: [],
              objectName: '',
              printingDuration: '',
              materialConsumption: '',
              sessionEndTime: '',
              updatedAt: serverTimestamp()
            }, { merge: true });
          } catch (err) {
            console.error('Error auto-releasing printer in details view:', err);
          }
          return;
        }

        setPrinter({
          id: Number(snap.id),
          ...data
        } as PrinterData);
      } else {
        setPrinter(null);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error fetching printer details:', err);
      setLoading(false);
    });

    return () => unsubPrinter();
  }, [printerId]);

  // 2. Listen to session history subcollection
  useEffect(() => {
    if (!printerId || !isAdmin) return;
    const historyRef = collection(db, 'printer_details', printerId, 'history');
    const q = query(historyRef, orderBy('timestamp', 'desc'));

    const unsubHistory = onSnapshot(q, (snapshot) => {
      const records: SessionRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push({
          id: docSnap.id,
          ...docSnap.data()
        } as SessionRecord);
      });
      setSessionHistory(records);
    }, (err) => {
      console.error('Error fetching session history:', err);
    });

    return () => unsubHistory();
  }, [printerId, isAdmin]);

  const addParticipant = () => {
    setParticipants([...participants, '']);
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, idx) => idx !== index));
  };

  const updateParticipant = (index: number, val: string) => {
    const updated = [...participants];
    updated[index] = val;
    setParticipants(updated);
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!printerId || !printer) return;
    if (!formName || !formEmail || !formRollNo || !formMobile || !formReason || !formObjectName || !formConsumption) {
      alert('Please fill out all required fields.');
      return;
    }

    if (formDurationHours === '00' && formDurationMinutes === '00') {
      alert('Please select a printing duration greater than 0 minutes.');
      return;
    }

    const formDuration = `${formDurationHours}:${formDurationMinutes}`;

    setSubmittingSession(true);
    try {
      const activeParticipants = participants.map(p => p.trim()).filter(p => p !== '');

      const now = new Date();
      const format24h = (date: Date) => {
        const hrs = String(date.getHours()).padStart(2, '0');
        const mins = String(date.getMinutes()).padStart(2, '0');
        const secs = String(date.getSeconds()).padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
      };

      const timeIn = format24h(now);
      const durationMinutes = parseDurationToMinutes(formDuration);
      const endTime = new Date(now.getTime() + durationMinutes * 60 * 1000);
      const timeOut = format24h(endTime);
      const displayDuration = formatDurationString(formDuration);

      const sessionData = {
        name: formName,
        email: formEmail,
        branch: formBranch,
        studentClass: formClass,
        rollNo: formRollNo,
        mobileNo: formMobile,
        timingIn: timeIn,
        timingOut: timeOut,
        useReason: formReason,
        participants: activeParticipants,
        objectName: formObjectName,
        printingDuration: displayDuration,
        materialConsumption: formConsumption,
        sessionEndTime: endTime.toISOString(),
        timestamp: serverTimestamp()
      };

      // A. Save to history subcollection
      await addDoc(collection(db, 'printer_details', printerId, 'history'), sessionData);

      // B. Update printer main status document
      await setDoc(doc(db, 'printer_details', printerId), {
        status: 'In Use',
        currentOperator: formName,
        operatorEmail: formEmail,
        operatorBranch: formBranch,
        operatorClass: formClass,
        operatorRollNo: formRollNo,
        operatorMobile: formMobile,
        useReason: formReason,
        timingIn: timeIn,
        timingOut: timeOut,
        participants: activeParticipants,
        objectName: formObjectName,
        printingDuration: displayDuration,
        materialConsumption: formConsumption,
        sessionEndTime: endTime.toISOString(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Reset Form and Modal
      setIsStartingSession(false);
      setFormName('');
      setFormRollNo('');
      setFormMobile('');
      setFormReason('');
      setParticipants([]);
      setFormObjectName('');
      setFormDurationHours('01');
      setFormDurationMinutes('00');
      setFormConsumption('');
    } catch (err) {
      console.error('Error starting session:', err);
      alert('Failed to log printing session. Please try again.');
    } finally {
      setSubmittingSession(false);
    }
  };



  if (loading) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{
          width: '40px', height: '40px', border: '3px solid #F1F5F9', borderTopColor: '#7F1D1D',
          borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem'
        }} />
        <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Loading details...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!printer) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 800 }}>Printer Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>The printer ID specified does not exist in the Idea Lab.</p>
        <button onClick={() => navigate('/lab-portal')} className="btn-primary" style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', width: 'auto', marginTop: '1.5rem', padding: '0.65rem 1.5rem' }}>
          <ArrowLeft size={16} /> Back to Lab Portal
        </button>
      </div>
    );
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };



  return (
    <div>
      <style>{`
        .details-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          margin-top: 2rem;
        }
        @media(min-width: 1024px) {
          .details-grid {
            grid-template-columns: 450px 1fr;
          }
        }
        .info-card {
          background: white;
          border-radius: 24px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.04);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          width: fit-content;
        }
        .status-badge.available {
          background: rgba(16, 185, 129, 0.1);
          color: #10B981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .status-badge.in-use {
          background: rgba(249, 115, 22, 0.1);
          color: #F97316;
          border: 1px solid rgba(249, 115, 22, 0.2);
          animation: pulse 2s infinite ease-in-out;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .history-table {
          width: 100%;
          border-collapse: collapse;
        }
        .history-table th {
          text-align: left;
          padding: 1rem;
          background: #F8FAFC;
          color: var(--text-muted);
          font-weight: 700;
          font-size: 0.82rem;
          border-bottom: 1.5px solid #E2E8F0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .history-table td {
          padding: 1rem;
          border-bottom: 1px solid #E2E8F0;
          font-size: 0.9rem;
          color: var(--text-main);
          vertical-align: middle;
        }
        .history-table tr:last-child td {
          border-bottom: none;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .form-label {
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text-main);
        }
        .form-input {
          padding: 0.65rem 1rem;
          font-size: 0.85rem;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          background: #F8FAFC;
          transition: all 0.2s ease;
          color: var(--text-main);
          font-weight: 500;
        }
        .form-input:focus {
          outline: none;
          background: white;
          border-color: #7F1D1D;
          box-shadow: 0 0 0 3px rgba(127, 29, 29, 0.12);
        }
      `}</style>

      {/* Header and Back navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/lab-portal')}
          style={{
            background: 'none', border: '1.5px solid #E2E8F0', borderRadius: '12px',
            width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-main)', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#7F1D1D'; e.currentTarget.style.color = '#7F1D1D'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = 'var(--text-main)'; }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: '1.85rem' }}>Printer Status & History</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Real-time status monitoring and student usage logs.</p>
        </div>
      </div>

      <div className="details-grid">
        {/* Left Column: Printer details & Current Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="info-card">
            {/* Cover Banner */}
            <div style={{
              height: '180px',
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%), url(${printer.status === 'In Use' ? printingGif : (printer.imageUrl || printerBg)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                }}>
                  <Printer size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: 800, textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
                    {printer.name}
                  </h2>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Current Machine Status
                </span>
                <div style={{ marginTop: '0.5rem' }}>
                  {printer.status === 'In Use' ? (
                    <span className="status-badge in-use">
                      <Activity size={15} /> In Use
                    </span>
                  ) : (
                    <span className="status-badge available">
                      <CheckCircle size={15} /> Available
                    </span>
                  )}
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '0.25rem 0' }} />

              {printer.status === 'In Use' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>Current Operator</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', color: 'var(--text-main)' }}>
                      <User size={15} color="#7F1D1D" />
                      <span style={{ fontWeight: 800, fontSize: '0.98rem' }}>{printer.currentOperator}</span>
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginLeft: '1.45rem' }}>
                      {printer.operatorBranch} ({printer.operatorClass})
                    </span>
                    {printer.participants && printer.participants.length > 0 && (
                      <div style={{ marginLeft: '1.45rem', marginTop: '0.4rem', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Group Members: </span>
                        <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{printer.participants.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>Session Window</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem', flexWrap: 'wrap' }}>
                      <Clock size={15} color="#7F1D1D" />
                      <span>{printer.timingIn} to {printer.timingOut}</span>
                      {timeLeft && (
                        <span style={{
                          fontSize: '0.75rem', padding: '0.15rem 0.45rem', borderRadius: '6px',
                          background: timeLeft === 'Expired' ? '#FEF2F2' : '#F0FDF4',
                          color: timeLeft === 'Expired' ? '#DC2626' : '#16A34A',
                          border: `1px solid ${timeLeft === 'Expired' ? '#FCA5A5' : '#BBF7D0'}`,
                          fontWeight: 700, marginLeft: '0.5rem'
                        }}>
                          {timeLeft}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>Work Description / Reason</span>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.25rem', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                      <FileText size={15} color="#7F1D1D" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <p style={{ margin: 0, fontStyle: 'italic', fontWeight: 500 }}>"{printer.useReason}"</p>
                    </div>
                  </div>

                  {printer.objectName && (
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>Object Details</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Object Name:</span>
                          <span style={{ fontWeight: 700 }}>{printer.objectName}</span>
                        </div>
                        {printer.printingDuration && (
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Duration:</span>
                            <span style={{ fontWeight: 700 }}>{printer.printingDuration}</span>
                          </div>
                        )}
                        {printer.materialConsumption && (
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Material Consumed:</span>
                            <span style={{ fontWeight: 700 }}>{printer.materialConsumption}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}


                </div>
              ) : (
                <div>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    No one is currently operating this machine. Click below to start a printing session and record your details.
                  </p>
                  <button
                    onClick={() => {
                      setIsStartingSession(true);
                    }}
                    className="btn-primary"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      marginTop: '1.25rem', padding: '0.75rem 1.5rem', width: '100%', fontSize: '0.9rem'
                    }}
                  >
                    <Plus size={16} /> Start Printing Session
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Printer Specifications */}
          <div className="info-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>Machine Specifications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Type</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{printer.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Location</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{printer.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Status Reporting</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>Dynamic (Live)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Model</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>Bambu Lab P1S / X1C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: History Logs */}
        {!isAdmin ? (
          <div className="info-card" style={{ height: 'fit-content', padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <AlertTriangle size={48} color="#94A3B8" style={{ opacity: 0.6 }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Logs Restricted</h3>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '320px', lineHeight: '1.5' }}>
                Historical session usage logs for this printer are confidential and only accessible to lab coordinators and administrators.
              </p>
            </div>
          </div>
        ) : (
          <div className="info-card" style={{ height: 'fit-content' }}>
            <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid #E2E8F0' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Session Usage Log</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Historical check-ins recorded for this 3D printer.</p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              {sessionHistory.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <AlertTriangle size={36} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>No usage history found</h4>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.88rem' }}>No session check-in has been logged for this printer yet.</p>
                </div>
              ) : (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Student Name</th>
                      <th>Branch</th>
                      <th>Time Slot</th>
                      <th>Reason of Working</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionHistory.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{formatDate(log.timestamp)}</td>
                        <td style={{ fontWeight: 700 }}>
                          {log.name}
                          {log.participants && log.participants.length > 0 && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.25rem' }}>
                              Group: {log.participants.join(', ')}
                            </div>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{log.branch}</td>
                        <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                          <span style={{ background: '#F1F5F9', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                            {log.timingIn} - {log.timingOut}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem', maxWidth: '300px' }} title={log.useReason}>
                          <div style={{ fontWeight: 600 }}>{log.useReason}</div>
                          {(log.objectName || log.printingDuration || log.materialConsumption) && (
                            <div style={{ display: 'flex', gap: '0.5rem 1rem', flexWrap: 'wrap', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {log.objectName && <span><strong style={{ color: '#7F1D1D' }}>Object:</strong> {log.objectName}</span>}
                              {log.printingDuration && <span><strong style={{ color: '#7F1D1D' }}>Duration:</strong> {log.printingDuration}</span>}
                              {log.materialConsumption && <span><strong style={{ color: '#7F1D1D' }}>Material:</strong> {log.materialConsumption}</span>}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Start Session Modal */}
      {isStartingSession && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem', backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', padding: '1.5rem 1.75rem',
            width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
            position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Start Session: {printer.name}
              </h3>
              <button
                onClick={() => setIsStartingSession(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStartSession} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Student Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Branch *</label>
                  <select
                    className="form-input"
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                  >
                    {BRANCHES.map((branch, idx) => (
                      <option key={idx} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Class *</label>
                  <select
                    className="form-input"
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                  >
                    {CLASSES.map((cls, idx) => (
                      <option key={idx} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Roll Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your roll number"
                    value={formRollNo}
                    onChange={(e) => setFormRollNo(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Enter mobile number"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Additional Participants */}
              <div className="form-group" style={{ marginTop: '0.25rem' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Additional Participants</span>
                  <button
                    type="button"
                    onClick={addParticipant}
                    style={{
                      background: 'none', border: 'none', color: '#7F1D1D',
                      fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.25rem', padding: 0
                    }}
                  >
                    <Plus size={14} /> Add Participant
                  </button>
                </label>

                {participants.map((participant, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={`Participant #${idx + 1} Name`}
                      value={participant}
                      onChange={(e) => updateParticipant(idx, e.target.value)}
                      style={{ flex: 1 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeParticipant(idx)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444',
                        border: 'none', borderRadius: '8px', width: '32px', height: '32px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0
                      }}
                      title="Remove participant"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>



              <div className="form-group">
                <label className="form-label">Work Description / Purpose *</label>
                <textarea
                  className="form-input"
                  placeholder="e.g. 3D printing gears for robotics project"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Object Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Robot Gear"
                    value={formObjectName}
                    onChange={(e) => setFormObjectName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Printing Duration *</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <select
                        className="form-input"
                        value={formDurationHours}
                        onChange={(e) => setFormDurationHours(e.target.value)}
                        style={{ width: '100%', textAlign: 'center' }}
                        required
                      >
                        {Array.from({ length: 24 }, (_, i) => {
                          const h = String(i).padStart(2, '0');
                          return <option key={h} value={h}>{h}</option>;
                        })}
                      </select>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>hr</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <select
                        className="form-input"
                        value={formDurationMinutes}
                        onChange={(e) => setFormDurationMinutes(e.target.value)}
                        style={{ width: '100%', textAlign: 'center' }}
                        required
                      >
                        {Array.from({ length: 60 }, (_, i) => {
                          const m = String(i).padStart(2, '0');
                          return <option key={m} value={m}>{m}</option>;
                        })}
                      </select>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>min</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Material Consumption *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 45g (PLA)"
                  value={formConsumption}
                  onChange={(e) => setFormConsumption(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsStartingSession(false)}
                  className="form-input"
                  style={{ cursor: 'pointer', background: 'none', border: '1.5px solid #E2E8F0', color: 'var(--text-muted)' }}
                  disabled={submittingSession}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: 'auto', padding: '0.65rem 1.5rem' }}
                  disabled={submittingSession}
                >
                  {submittingSession ? 'Starting...' : 'Start Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrinterDetails;
