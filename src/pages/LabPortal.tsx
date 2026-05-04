import { Printer } from 'lucide-react';

const PRINTERS = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  name: `Bambu Lab ${i + 1}`,
  status: i % 4 === 0 ? 'In Use' : 'Available',
  type: '3D Printer',
  location: 'Idea Lab Main Floor'
}));

const LabPortal = () => {
  return (
    <div>
      <h1 className="page-title">Lab Equipment Portal</h1>
      <p className="page-subtitle">Real-time status of our 3D Printers and other equipment.</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        {PRINTERS.map((printer) => (
          <div key={printer.id} style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            transition: 'transform 0.3s ease, border-color 0.3s ease'
          }}
          className="printer-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ 
                background: 'var(--gradient-maroon)', 
                padding: '0.75rem', 
                borderRadius: '12px',
                color: 'white'
              }}>
                <Printer size={24} />
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                background: printer.status === 'Available' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: printer.status === 'Available' ? '#4ade80' : '#f87171',
                border: `1px solid ${printer.status === 'Available' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}>
                {printer.status}
              </span>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                {printer.name}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{printer.type}</p>
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
              📍 {printer.location}
            </div>
          </div>
        ))}
      </div>
      
      <style>{`
        .printer-card:hover {
          transform: translateY(-4px);
          border-color: rgba(220, 38, 38, 0.5) !important;
        }
      `}</style>
    </div>
  );
};

export default LabPortal;
