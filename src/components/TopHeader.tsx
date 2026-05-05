import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import aicteLogo from '../assets/aicte1.png';

const TopHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState<string>('');

  useEffect(() => {
    if (user?.email) {
      getDoc(doc(db, 'admin_profiles', user.email)).then(snap => {
        if (snap.exists() && snap.data().name) {
          setProfileName(snap.data().name);
        } else {
          setProfileName('');
        }
      });
    } else {
      setProfileName('');
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const displayName = profileName || user?.displayName || user?.email?.split('@')[0];

  return (
    <header className="top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" className="header-logo-block">
          <div className="header-logo-icon" style={{ background: 'transparent', boxShadow: 'none' }}>
            <img src={aicteLogo} alt="Lab Logo" style={{ width: '95px', height: '90px', objectFit: 'contain' }} />
          </div>
          AICTE Idea Lab
        </Link>
        <div className="header-title-block">
          Innovation & Incubation Center
        </div>
      </div>

      <div style={{ paddingRight: '1.5rem' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
              {displayName}
            </span>
            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
          >
            <UserCircle size={18} />
            Admin Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default TopHeader;
