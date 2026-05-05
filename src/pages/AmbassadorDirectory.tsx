import { Phone, BookOpen, Star, User } from 'lucide-react';

const COORDINATOR = {
  name: 'B.R. Bagane',
  branch: 'Head of Innovation & Idea Lab',
  phone: '+91 9423840249'
};

const AMBASSADORS = [
  { id: 1, name: 'Atharva Anil Kolap', branch: 'Mechanical (S.Y.)', phone: '+91 9373875958' },
  { id: 2, name: 'Patil Sahil Sunil', branch: 'Mechanical (S.Y.)', phone: '+91 7276802658' },
  { id: 3, name: 'Mokashi Rupam Ramchandra', branch: 'Mechanical (T.Y.)', phone: '+91 7875236466' },
  { id: 4, name: 'Patharvat Sachidanand Shivaji', branch: 'CSE (S.Y.)', phone: '+91 9607024685' },
  { id: 5, name: 'Patil Swastik Sanjay', branch: 'Mechanical (T.Y.)', phone: '+91 7499204891' },
  { id: 6, name: 'Kirti Bhagwan Lohar', branch: 'CSE (S.Y.)', phone: '+91 8530386641' },
  { id: 7, name: 'Dashwant Dhruv Prithviraj', branch: 'Chemical (T.Y.)', phone: '+91 9022208107' },
  { id: 8, name: 'Rajkiran Ravindra Shinde', branch: 'ENTC (T.Y.)', phone: '+91 9767975375' },
  { id: 9, name: 'Radhika Sanjay Magar', branch: 'CSE (S.Y.)', phone: '+91 9359460315' },
  { id: 10, name: 'Sonkade Prathamesh Baragali', branch: 'Mechanical (S.Y.)', phone: '+91 7776922261' }
];

const getInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const AmbassadorDirectory = () => {
  return (
    <div>
      <h1 className="page-title">Team Directory</h1>
      <p className="page-subtitle">Meet the coordinator and student ambassadors driving innovation in the lab.</p>

      {/* Coordinator Section */}
      <div style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Idea Lab Coordinator</h2>
        <div className="ambassador-card" style={{ maxWidth: '400px', padding: 0 }}>
          <div style={{ height: '80px', background: 'var(--gradient-red)' }}></div>
          <div style={{ padding: '0 1.5rem 1.5rem', position: 'relative', marginTop: '-40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: 'white', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: '4px solid white', marginBottom: '1rem'
            }}>
              <Star size={36} color="#DC2626" fill="#DC2626" />
            </div>
            
            <h3 className="ambassador-name" style={{ marginBottom: '0.5rem' }}>{COORDINATOR.name}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '12px', width: '100%', justifyContent: 'center' }}>
                <BookOpen size={18} color="#DC2626" />
                <span style={{ fontWeight: 700, color: '#DC2626' }}>{COORDINATOR.branch}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '12px', width: '100%', justifyContent: 'center' }}>
                <Phone size={18} />
                <span style={{ fontWeight: 600 }}>{COORDINATOR.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ambassadors Section */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Student Ambassadors</h2>
        <div className="ambassador-grid">
          {AMBASSADORS.map((ambassador, index) => (
            <div key={ambassador.id} className="ambassador-card" style={{ padding: 0 }}>
              <div style={{ 
                height: '70px', 
                background: index % 2 === 0 ? 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)' : 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)'
              }}></div>
              
              <div style={{ padding: '0 1.5rem 1.5rem', position: 'relative', marginTop: '-35px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  width: '70px', height: '70px', borderRadius: '50%', background: 'var(--gradient-maroon)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem', fontWeight: 700,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: '4px solid white', marginBottom: '1rem'
                }}>
                  {getInitials(ambassador.name)}
                </div>

                <h3 className="ambassador-name" style={{ fontSize: '1.2rem', textAlign: 'center', minHeight: '3rem', display: 'flex', alignItems: 'center' }}>
                  {ambassador.name}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', alignItems: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', background: '#F8FAFC', padding: '0.5rem', borderRadius: '8px', width: '100%', justifyContent: 'center' }}>
                    <BookOpen size={16} />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ambassador.branch}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', background: '#F8FAFC', padding: '0.5rem', borderRadius: '8px', width: '100%', justifyContent: 'center' }}>
                    <Phone size={16} />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ambassador.phone}</span>
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
