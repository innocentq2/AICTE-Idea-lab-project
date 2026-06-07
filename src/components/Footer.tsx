import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Footer = () => {
  const { isAdmin } = useAuth();

  return (
    <footer className="footer-panel">
      {/* Top Section */}
      <div className="footer-top-grid">
        {/* Institution Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '90px',
              height: '90px',
              backgroundImage: 'url("https://i.ytimg.com/vi/BdemYbKtii8/hqdefault.jpg")',
              backgroundSize: '180% 150%', // Zoom in to hide black bars
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundColor: 'white',
              borderRadius: '50%',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              flexShrink: 0
            }} />
            <span style={{
              fontWeight: 800,
              fontSize: '1.5rem',
              color: '#312759', // Match the logo's dark purple color
              letterSpacing: '-0.02em',
              marginLeft: '0.5rem'
            }}>
              Warana University
            </span>
          </div>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            lineHeight: '1.6',
            fontWeight: 500,
            maxWidth: '90%'
          }}>
            Tatyasaheb Kore Institute of Engineering & Technology (TKIET), Warananagar. An initiative to foster innovation, design thinking, and hands-on learning.
          </p>
        </div>

        {/* Quick Links Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Quick Links
            <div style={{ height: '2px', width: '30px', background: '#7F1D1D', borderRadius: '2px' }} />
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem', fontSize: '0.9rem' }}>
            <Link to="/ambassadors" className="footer-link">Ambassadors</Link>
            <Link to="/lab-portal" className="footer-link">Lab Portal</Link>
            <Link to="/attendance" className="footer-link">Attendance</Link>
            <Link to="/feedback" className="footer-link">Feedback</Link>
            <Link to="/questionnaire" className="footer-link">Questionnaire</Link>
            {isAdmin && <Link to="/admin" className="footer-link">Admin Portal</Link>}
          </div>
        </div>

        {/* Contact Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Contact Us
            <div style={{ height: '2px', width: '30px', background: '#7F1D1D', borderRadius: '2px' }} />
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className="footer-contact-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MapPin size={18} className="footer-icon" />
              <span style={{ fontWeight: 500 }}>Idea Lab Main Floor, TKIET Campus</span>
            </div>
            <a href="mailto:brbagane@tkietwarana.ac.in" className="footer-contact-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
              <Mail size={18} className="footer-icon" />
              <span style={{ fontWeight: 600 }}>brbagane@tkietwarana.ac.in</span>
            </a>
            <div className="footer-contact-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Phone size={18} className="footer-icon" />
              <span style={{ fontWeight: 500 }}>+91 9423840249</span>
            </div>
          </div>
        </div>
      </div>

      {/* Separator */}
      <hr style={{ border: 'none', borderTop: '1px solid rgba(0, 0, 0, 0.08)' }} />

      {/* Bottom Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        fontWeight: 600
      }}>
        <span>
          © 2026 - Till Now || AICTE IDEA Lab || All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
