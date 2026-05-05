import { Printer, MapPin, Activity } from 'lucide-react';
import printerBg from '../assets/printer_bg.png';

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
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2.5rem',
        marginTop: '2rem'
      }}>
        {PRINTERS.map((printer) => (
          <div key={printer.id} className="ambassador-card" style={{ padding: 0 }}>
            {/* Top Image Banner */}
            <div style={{ 
              height: '100px', 
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(${printerBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '1rem'
            }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                background: printer.status === 'Available' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                alignSelf: 'flex-start'
              }}>
                {printer.status}
              </span>
            </div>
            
            <div style={{ padding: '0 1.5rem 1.5rem', position: 'relative', marginTop: '-30px', display: 'flex', flexDirection: 'column' }}>
              {/* Floating Icon */}
              <div style={{ 
                width: '60px', height: '60px', borderRadius: '16px', background: 'var(--gradient-maroon)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                boxShadow: '0 4px 10px rgba(153, 27, 27, 0.3)', border: '3px solid white', marginBottom: '1rem'
              }}>
                <Printer size={28} strokeWidth={1.5} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                {printer.name}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', background: '#F8FAFC', padding: '0.6rem 1rem', borderRadius: '8px' }}>
                  <Activity size={16} color="#DC2626" />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{printer.type}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', background: '#F8FAFC', padding: '0.6rem 1rem', borderRadius: '8px' }}>
                  <MapPin size={16} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{printer.location}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabPortal;
