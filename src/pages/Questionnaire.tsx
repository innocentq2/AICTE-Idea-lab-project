import { useState } from 'react';
import { FileQuestion, CheckCircle, Send, MessageSquare } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import aicteLogo from '../assets/aicte1.png';
import aicetLogo from '../assets/AICET.png';

const BRANCHES = [
  'Civil Engineering', 'Chemical Engineering', 'Computer Science',
  'Electrical Engineering', 'Electronics & Telecom', 'Mechanical Engineering',
  'Information Technology', 'Instrumentation Engineering', 'Other'
];
const YEARS = ['FY', 'SY', 'TY', 'BE'];

const YesNoRadio = ({
  name, value, onChange
}: { name: string; value: string; onChange: (val: string) => void }) => (
  <div style={{ display: 'flex', gap: '2rem', marginTop: '0.6rem' }}>
    {['Yes', 'No'].map((opt) => (
      <label key={opt} style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
        color: value === opt ? '#D97706' : 'var(--text-muted)'
      }}>
        <input
          type="radio"
          name={name}
          value={opt}
          checked={value === opt}
          onChange={() => onChange(opt)}
          style={{ accentColor: '#D97706', width: '17px', height: '17px' }}
        />
        {opt}
      </label>
    ))}
  </div>
);

const QNum = ({ n }: { n: number }) => (
  <span style={{
    background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: 'white',
    borderRadius: '50%', width: '24px', height: '24px', minWidth: '24px',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '0.8rem', marginRight: '0.5rem'
  }}>{n}</span>
);

const Questionnaire = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const initialStudent = { name: '', branch: '', year: '', collegeName: '', rollNumber: '', contactNumber: '' };
  const initialAnswers = {
    q1: '', q2: '', q3: '', q4: '',
    q5: '', q6: '', q7: '',
    q8: '', q9: '', q10: ''
  };

  const [student, setStudent] = useState(initialStudent);
  const [answers, setAnswers] = useState(initialAnswers);

  const handleStudent = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setStudent(prev => ({ ...prev, [e.target.id]: e.target.value }));

  const handleAnswer = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setAnswers(prev => ({ ...prev, [e.target.id]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'questionnaire_responses'), {
        studentName: student.name,
        branch: student.branch,
        year: student.year,
        collegeName: student.collegeName,
        rollNumber: student.rollNumber,
        contactNumber: student.contactNumber,
        whatDidYouSee: answers.q1,
        machinesShown: answers.q2,
        materialsUsed: answers.q3,
        productsMade: answers.q4,
        understoodWorking: answers.q5,
        mostInteresting: answers.q6,
        problemsObserved: answers.q7,
        safetyExplained: answers.q8,
        wouldLearnMore: answers.q9,
        overallExperience: answers.q10,
        timestamp: serverTimestamp()
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error saving response:', err);
      alert('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1.5rem', textAlign: 'center'
      }}>
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(217,119,6,0.3)'
        }}>
          <CheckCircle size={50} color="white" />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Thank You!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '380px', margin: 0 }}>
          Your questionnaire response has been recorded successfully.
        </p>
        <button
          onClick={() => { setStudent(initialStudent); setAnswers(initialAnswers); setSubmitted(false); }}
          className="btn-primary"
          style={{ width: 'auto', padding: '0.75rem 2rem', background: 'linear-gradient(135deg,#F59E0B,#D97706)' }}
        >
          Submit Another Response
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Institutional Header — same as FeedbackForm */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <img src={aicteLogo} alt="AICTE Logo" style={{ width: '95px', height: '90px', objectFit: 'contain', flexShrink: 0 }} />
        <div style={{ textAlign: 'center', lineHeight: 1.5 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#444', marginBottom: '0.1rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            SWVSM's
          </p>
          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#222', marginBottom: '0.15rem', letterSpacing: '0.02em' }}>
            WARANA UNIVERSITY, WARANANAGAR
          </p>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#111', marginBottom: '0.15rem' }}>
            Tatyasaheb Kore Institute of Engineering &amp; Technology (TKIET), Warananagar
          </p>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#7F1D1D' }}>
            Ravindra Sakharpe AICTE Idea Lab, Warananagar
          </p>
        </div>
        <img src={aicetLogo} alt="AICET Logo" style={{ width: '95px', height: '90px', objectFit: 'contain', flexShrink: 0 }} />
      </div>

      <div style={{ borderTop: '1px solid #E2E8F0', marginBottom: '1.5rem' }} />

      {/* Form title */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg,#F59E0B,#D97706)',
          boxShadow: '0 6px 20px rgba(217,119,6,0.3)', marginBottom: '1rem'
        }}>
          <FileQuestion size={28} color="white" />
        </div>
        <h2 className="page-title" style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>
          Industry Visit — Questionnaire
        </h2>
        <p className="page-subtitle" style={{ margin: 0 }}>
          Please answer all questions based on your industry visit experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="feedback-form-wrapper">

        {/* ── Student Details ── */}
        <div className="feedback-section">
          <div className="feedback-section-header">
            <div className="feedback-section-icon">
              <MessageSquare size={20} />
            </div>
            <h3 className="feedback-section-title">Student Details</h3>
          </div>
          <div className="feedback-grid-2">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Name *</label>
              <input type="text" id="name" className="form-input" placeholder="Full Name"
                value={student.name} onChange={handleStudent} required />
            </div>
            <div className="form-group">
              <label htmlFor="branch" className="form-label">Branch / Department *</label>
              <select id="branch" className="form-input" value={student.branch} onChange={handleStudent} required style={{ appearance: 'auto' }}>
                <option value="" disabled>Select branch</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="year" className="form-label">Year (FY / SY / TY / BE) *</label>
              <select id="year" className="form-input" value={student.year} onChange={handleStudent} required style={{ appearance: 'auto' }}>
                <option value="" disabled>Select year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="collegeName" className="form-label">College Name *</label>
              <input type="text" id="collegeName" className="form-input" placeholder="Your college name"
                value={student.collegeName} onChange={handleStudent} required />
            </div>
            <div className="form-group">
              <label htmlFor="rollNumber" className="form-label">Roll Number *</label>
              <input type="text" id="rollNumber" className="form-input" placeholder="Roll Number"
                value={student.rollNumber} onChange={handleStudent} required />
            </div>
            <div className="form-group">
              <label htmlFor="contactNumber" className="form-label">Contact Number *</label>
              <input type="tel" id="contactNumber" className="form-input" placeholder="10-digit mobile number"
                value={student.contactNumber} onChange={handleStudent} required maxLength={10} />
            </div>
          </div>
        </div>

        {/* ── Questions ── */}
        <div className="feedback-section">
          <div className="feedback-section-header">
            <div className="feedback-section-icon" style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)' }}>
              <FileQuestion size={20} />
            </div>
            <h3 className="feedback-section-title">Industry Visit Questions</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

            {/* Q1 */}
            <div className="form-group">
              <label htmlFor="q1" className="form-label"><QNum n={1} />What did you see in the industry?</label>
              <textarea id="q1" className="form-input feedback-textarea"
                placeholder="Describe what you observed during your visit..."
                value={answers.q1} onChange={handleAnswer} rows={3} required />
            </div>

            {/* Q2 */}
            <div className="form-group">
              <label htmlFor="q2" className="form-label"><QNum n={2} />Which 3D printing machines were shown?</label>
              <textarea id="q2" className="form-input feedback-textarea"
                placeholder="List the machines or equipment you saw..."
                value={answers.q2} onChange={handleAnswer} rows={3} required />
            </div>

            {/* Q3 */}
            <div className="form-group">
              <label htmlFor="q3" className="form-label"><QNum n={3} />What materials are used for 3D printing?</label>
              <textarea id="q3" className="form-input feedback-textarea"
                placeholder="e.g. PLA, ABS, resin, metal powder..."
                value={answers.q3} onChange={handleAnswer} rows={3} required />
            </div>

            {/* Q4 */}
            <div className="form-group">
              <label htmlFor="q4" className="form-label"><QNum n={4} />What products are made using 3D printing there?</label>
              <textarea id="q4" className="form-input feedback-textarea"
                placeholder="Describe the products or prototypes you saw..."
                value={answers.q4} onChange={handleAnswer} rows={3} required />
            </div>

            {/* Q5 — Yes/No */}
            <div className="form-group">
              <label className="form-label"><QNum n={5} />Did you understand the working of 3D printing? *</label>
              <YesNoRadio name="q5" value={answers.q5}
                onChange={val => setAnswers(p => ({ ...p, q5: val }))} />
            </div>

            {/* Q6 */}
            <div className="form-group">
              <label htmlFor="q6" className="form-label"><QNum n={6} />What was the most interesting thing you learned?</label>
              <textarea id="q6" className="form-input feedback-textarea"
                placeholder="Share your most interesting takeaway..."
                value={answers.q6} onChange={handleAnswer} rows={3} required />
            </div>

            {/* Q7 */}
            <div className="form-group">
              <label htmlFor="q7" className="form-label"><QNum n={7} />What problems or difficulties did you observe?</label>
              <textarea id="q7" className="form-input feedback-textarea"
                placeholder="Any challenges or issues noticed during the visit..."
                value={answers.q7} onChange={handleAnswer} rows={3} />
            </div>

            {/* Q8 — Yes/No */}
            <div className="form-group">
              <label className="form-label"><QNum n={8} />Were safety rules explained properly? *</label>
              <YesNoRadio name="q8" value={answers.q8}
                onChange={val => setAnswers(p => ({ ...p, q8: val }))} />
            </div>

            {/* Q9 — Yes/No */}
            <div className="form-group">
              <label className="form-label"><QNum n={9} />Would you like to learn more about 3D printing? *</label>
              <YesNoRadio name="q9" value={answers.q9}
                onChange={val => setAnswers(p => ({ ...p, q9: val }))} />
            </div>

            {/* Q10 */}
            <div className="form-group">
              <label htmlFor="q10" className="form-label"><QNum n={10} />What is your overall experience of the visit?</label>
              <textarea id="q10" className="form-input feedback-textarea"
                placeholder="Share your overall thoughts and impressions..."
                value={answers.q10} onChange={handleAnswer} rows={4} required />
            </div>

          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: 'auto', padding: '1rem 3rem', fontSize: '1.05rem',
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              background: 'linear-gradient(135deg,#F59E0B,#D97706)',
              boxShadow: '0 8px 24px rgba(217,119,6,0.3)'
            }}
          >
            <Send size={18} />
            {loading ? 'Submitting...' : 'Submit Questionnaire'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Questionnaire;
