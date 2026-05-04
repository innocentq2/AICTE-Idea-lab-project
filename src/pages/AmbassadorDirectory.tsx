import { Phone, BookOpen, Star } from 'lucide-react';

const COORDINATOR = {
  name: 'B.R. Bagane',
  branch: 'Head of Innovation & Idea Lab',
  phone: '+91 9423840249'
};

const AMBASSADORS = [
  {
    id: 1,
    name: 'Atharva Anil Kolap',
    branch: 'Mechanical (S.Y.)',
    phone: '+91 9373875958'
  },
  {
    id: 2,
    name: 'Patil Sahil Sunil',
    branch: 'Mechanical (S.Y.)',
    phone: '+91 7276802658'
  },
  {
    id: 3,
    name: 'Mokashi Rupam Ramchandra',
    branch: 'Mechanical (T.Y.)',
    phone: '+91 7875236466'
  },
  {
    id: 4,
    name: 'Patharvat Sachidanand Shivaji',
    branch: 'CSE (S.Y.)',
    phone: '+91 9607024685'
  },
  {
    id: 5,
    name: 'Patil Swastik Sanjay',
    branch: 'Mechanical (T.Y.)',
    phone: '+91 7499204891'
  },
  {
    id: 6,
    name: 'Kirti Bhagwan Lohar',
    branch: 'CSE (S.Y.)',
    phone: '+91 8530386641'
  },
  {
    id: 7,
    name: 'Dashwant Dhruv Prithviraj',
    branch: 'Chemical (T.Y.)',
    phone: '+91 9022208107'
  },
  {
    id: 8,
    name: 'Rajkiran Ravindra Shinde',
    branch: 'ENTC (T.Y.)',
    phone: '+91 9767975375'
  },
  {
    id: 9,
    name: 'Radhika Sanjay Magar',
    branch: 'CSE (S.Y.)',
    phone: '+91 9359460315'
  },
  {
    id: 10,
    name: 'Sonkade Prathamesh Baragali',
    branch: 'Mechanical (S.Y.)',
    phone: '+91 7776922261'
  }
];

const AmbassadorDirectory = () => {
  return (
    <div>
      <h1 className="page-title">Team Directory</h1>
      <p className="page-subtitle">Meet the coordinator and student ambassadors driving innovation in the lab.</p>

      {/* Coordinator Section */}
      <div style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Idea Lab Coordinator</h2>
        <div className="ambassador-card" style={{ padding: '1.5rem', maxWidth: '400px', borderTop: '4px solid #DC2626' }}>
          <div className="ambassador-info">
            <h3 className="ambassador-name" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Star size={20} color="#DC2626" fill="#DC2626" />
              {COORDINATOR.name}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <BookOpen size={18} />
                <span style={{ fontWeight: 600, color: '#DC2626' }}>{COORDINATOR.branch}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Phone size={18} />
                <span style={{ fontWeight: 500 }}>{COORDINATOR.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ambassadors Section */}
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Student Ambassadors</h2>
        <div className="ambassador-grid">
          {AMBASSADORS.map((ambassador) => (
            <div key={ambassador.id} className="ambassador-card" style={{ padding: '1rem' }}>
              <div className="ambassador-info">
                <h3 className="ambassador-name">{ambassador.name}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <BookOpen size={18} />
                    <span style={{ fontWeight: 500 }}>{ambassador.branch}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <Phone size={18} />
                    <span style={{ fontWeight: 500 }}>{ambassador.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AmbassadorDirectory;
