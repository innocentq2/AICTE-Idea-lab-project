import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Star, MessageSquare, ThumbsUp, Building2 } from 'lucide-react';
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

const YEARS = ['FY', 'SY', 'TY', 'BE'];

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent'
};

interface StarRatingProps {
  label: string;
  field: string;
  value: number;
  onChange: (field: string, value: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ label, field, value, onChange }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="feedback-rating-row">
      <span className="feedback-rating-label">{label}</span>
      <div className="feedback-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`feedback-star${star <= (hovered || value) ? ' active' : ''}`}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(field, star)}
            aria-label={`Rate ${star} stars`}
          >
            <Star size={28} fill={star <= (hovered || value) ? '#DC2626' : 'none'} />
          </button>
        ))}
        {(hovered || value) > 0 && (
          <span className="feedback-star-label">{RATING_LABELS[hovered || value]}</span>
        )}
      </div>
    </div>
  );
};

const FeedbackForm = () => {
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
    name: '',
    branch: '',
    year: '',
    collegeName: '',
    rollNumber: '',
    contactNumber: '',
    industryName: '',
    visitDate: '',
    industryType: '',
    visitDuration: '',
    visitObjectives: '',
    visitUseful: '',
    workflowUnderstanding: '',
    safetyMeasures: '',
    overallExperience: 0,
    facilitiesRating: 0,
    staffSupportRating: 0,
    equipmentRating: 0,
    learningValueRating: 0,
    suggestions: '',
    wouldRecommend: '',
    additionalComments: ''
  });

  const handleRating = (field: string, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ratingsComplete =
      formData.overallExperience > 0 &&
      formData.facilitiesRating > 0 &&
      formData.staffSupportRating > 0 &&
      formData.equipmentRating > 0 &&
      formData.learningValueRating > 0;

    if (!ratingsComplete) {
      alert('Please provide all star ratings before submitting.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        ...formData,
        timestamp: serverTimestamp()
      });
      setSubmitted(true);
      setFormData({
        name: '',
        branch: '',
        year: '',
        collegeName: '',
        rollNumber: '',
        contactNumber: '',
        industryName: '',
        visitDate: '',
        industryType: '',
        visitDuration: '',
        visitObjectives: '',
        visitUseful: '',
        workflowUnderstanding: '',
        safetyMeasures: '',
        overallExperience: 0,
        facilitiesRating: 0,
        staffSupportRating: 0,
        equipmentRating: 0,
        learningValueRating: 0,
        suggestions: '',
        wouldRecommend: '',
        additionalComments: ''
      });
    } catch (error) {
      console.error('Error saving feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
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
          🎉 Thank You!
        </h2>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '420px', margin: 0, lineHeight: 1.7 }}>
          Your feedback has been <strong>successfully submitted</strong>.<br />
          We truly appreciate your time and insights!
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
      {/* Institutional Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}
      >
        <img
          src={aicteLogo}
          alt="Lab Logo"
          style={{ width: '95px', height: '90px', objectFit: 'contain', flexShrink: 0 }}
        />

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

        <img
          src={aicetLogo}
          alt="AICET Logo"
          style={{ width: '95px', height: '90px', objectFit: 'contain', flexShrink: 0 }}
        />
      </div>

      {/* Divider + subtitle */}
      <div style={{ borderTop: '1px solid #E2E8F0', marginBottom: '1rem' }} />
      <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        {/* Add title later here  */}
      </p>

      <form onSubmit={handleSubmit} className="feedback-form-wrapper">
        {/* ── Section 1: Personal Information ── */}
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
              <input
                type="text"
                id="name"
                className="form-input"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="branch" className="form-label">Branch / Department *</label>
              <select
                id="branch"
                className="form-input"
                value={formData.branch}
                onChange={handleChange}
                required
                style={{ appearance: 'auto' }}
              >
                <option value="" disabled>Select your branch</option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="year" className="form-label">Year (FY / SY / TY / BE) *</label>
              <select
                id="year"
                className="form-input"
                value={formData.year}
                onChange={handleChange}
                required
                style={{ appearance: 'auto' }}
              >
                <option value="" disabled>Select your year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="collegeName" className="form-label">College Name *</label>
              <input
                type="text"
                id="collegeName"
                className="form-input"
                placeholder="Your college name"
                value={formData.collegeName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="rollNumber" className="form-label">Roll Number *</label>
              <input
                type="text"
                id="rollNumber"
                className="form-input"
                placeholder="Roll Number"
                value={formData.rollNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contactNumber" className="form-label">Contact Number *</label>
              <input
                type="tel"
                id="contactNumber"
                className="form-input"
                placeholder="10-digit mobile number"
                value={formData.contactNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* ── Section 2: Industry Visit Feedback ── */}
        <div className="feedback-section">
          <div className="feedback-section-header">
            <div className="feedback-section-icon">
              <Building2 size={20} />
            </div>
            <h3 className="feedback-section-title">Industry Visit Feedback</h3>
          </div>

          <div className="feedback-grid-2">
            <div className="form-group">
              <label htmlFor="industryName" className="form-label">Name of Industry / Organization *</label>
              <input
                type="text"
                id="industryName"
                className="form-input"
                placeholder="e.g. Tata Motors, Infosys..."
                value={formData.industryName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="visitDate" className="form-label">Date of Visit *</label>
              <input
                type="date"
                id="visitDate"
                className="form-input"
                value={formData.visitDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="industryType" className="form-label">Type of Industry *</label>
              <select
                id="industryType"
                className="form-input"
                value={formData.industryType}
                onChange={handleChange}
                required
                style={{ appearance: 'auto' }}
              >
                <option value="" disabled>Select industry type</option>
                {['Manufacturing', 'IT / Software', 'Pharmaceuticals', 'Automotive', 'Electronics', 'Energy / Power', 'Chemical', 'Research & Development', 'Other'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="visitDuration" className="form-label">Duration of Visit *</label>
              <select
                id="visitDuration"
                className="form-input"
                value={formData.visitDuration}
                onChange={handleChange}
                required
                style={{ appearance: 'auto' }}
              >
                <option value="" disabled>Select duration</option>
                {['Half Day', 'Full Day', '2 Days', '3+ Days'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="visitObjectives" className="form-label">Objectives of the Visit</label>
              <textarea
                id="visitObjectives"
                className="form-input feedback-textarea"
                placeholder="What were the main objectives or learning goals for this visit?"
                value={formData.visitObjectives}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {/* Industry visit useful */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Industry Visit was Useful *</label>
              <div className="feedback-radio-group" style={{ marginTop: '0.5rem' }}>
                {['Yes', 'No'].map((opt) => (
                  <label key={opt} className="feedback-radio-label">
                    <input
                      type="radio"
                      name="visitUseful"
                      value={opt}
                      checked={formData.visitUseful === opt}
                      onChange={() => setFormData((prev) => ({ ...prev, visitUseful: opt }))}
                      className="feedback-radio"
                    />
                    <span className="feedback-radio-text">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Understanding of industrial workflow */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="workflowUnderstanding" className="form-label">Understanding of Industrial Workflow</label>
              <textarea
                id="workflowUnderstanding"
                className="form-input feedback-textarea"
                placeholder="Describe how the visit helped you understand the industrial workflow..."
                value={formData.workflowUnderstanding}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {/* Safety measures explained */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="safetyMeasures" className="form-label">Safety Measures Explained</label>
              <textarea
                id="safetyMeasures"
                className="form-input feedback-textarea"
                placeholder="What safety measures or protocols were demonstrated or explained during the visit?"
                value={formData.safetyMeasures}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* ── Section 3: Ratings ── */}
        <div className="feedback-section">
          <div className="feedback-section-header">
            <div className="feedback-section-icon">
              <Star size={20} />
            </div>
            <h3 className="feedback-section-title">Rate Your Experience</h3>
          </div>

          <div className="feedback-ratings-list">
            <StarRating
              label="Overall Experience"
              field="overallExperience"
              value={formData.overallExperience}
              onChange={handleRating}
            />
            <StarRating
              label="Lab Facilities & Infrastructure"
              field="facilitiesRating"
              value={formData.facilitiesRating}
              onChange={handleRating}
            />
            <StarRating
              label="Staff Support & Mentorship"
              field="staffSupportRating"
              value={formData.staffSupportRating}
              onChange={handleRating}
            />
            <StarRating
              label="Equipment & Tools Availability"
              field="equipmentRating"
              value={formData.equipmentRating}
              onChange={handleRating}
            />
            <StarRating
              label="Learning Value & Innovation"
              field="learningValueRating"
              value={formData.learningValueRating}
              onChange={handleRating}
            />
          </div>
        </div>

        {/* ── Section 3: Open Feedback ── */}
        <div className="feedback-section">
          <div className="feedback-section-header">
            <div className="feedback-section-icon">
              <ThumbsUp size={20} />
            </div>
            <h3 className="feedback-section-title">Your Thoughts</h3>
          </div>

          <div className="form-group">
            <label htmlFor="suggestions" className="form-label">
              What did you enjoy most about the lab?
            </label>
            <textarea
              id="suggestions"
              className="form-input feedback-textarea"
              placeholder="Share what you liked..."
              value={formData.suggestions}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Would you recommend this lab to others?</label>
            <div className="feedback-radio-group">
              {['Definitely Yes', 'Yes', 'Maybe', 'No'].map((opt) => (
                <label key={opt} className="feedback-radio-label">
                  <input
                    type="radio"
                    name="wouldRecommend"
                    value={opt}
                    checked={formData.wouldRecommend === opt}
                    onChange={() => setFormData((prev) => ({ ...prev, wouldRecommend: opt }))}
                    className="feedback-radio"
                  />
                  <span className="feedback-radio-text">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="additionalComments" className="form-label">
              Suggestions for Improvement
            </label>
            <textarea
              id="additionalComments"
              className="form-input feedback-textarea"
              placeholder="How can we make the lab better for students?"
              value={formData.additionalComments}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
          disabled={loading}
        >
          {loading ? 'Submitting Feedback...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
