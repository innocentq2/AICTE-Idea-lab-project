import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const LiveTelemetry = () => {
  const [printers, setPrinters] = useState<any[]>([]);
  const [loadingPrinters, setLoadingPrinters] = useState(true);
  const [timeTick, setTimeTick] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'printer_details'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      list.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
      setPrinters(list);
      setLoadingPrinters(false);
    }, (error) => {
      console.error('Error fetching printers for telemetry:', error);
      setLoadingPrinters(false);
    });
    return () => unsub();
  }, []);

  const getRemainingTimeStr = (printer: any) => {
    if (printer.status !== 'In Use' || !printer.sessionEndTime) return '-';
    const diff = new Date(printer.sessionEndTime).getTime() - timeTick;
    if (diff <= 0) return '-';
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const totalPrintersCount = printers.length || 18;
  const idlePrintersCount = printers.filter(p => p.status !== 'In Use').length;

  const sortedPrinters = [...printers].sort((a, b) => {
    if (a.status === 'In Use' && b.status !== 'In Use') return -1;
    if (a.status !== 'In Use' && b.status === 'In Use') return 1;
    return (Number(a.id) || 0) - (Number(b.id) || 0);
  });

  return (
    <div className="telemetry-panel">
      {/* Header Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        paddingBottom: '1.25rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Activity className="heartbeat-icon" size={18} />
          <span style={{
            fontSize: '0.9rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: '#7F1D1D',
            textTransform: 'uppercase'
          }}>
            Live Telemetry
          </span>
        </div>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase'
        }}>
          {loadingPrinters ? 'Initializing...' : `${totalPrintersCount} Machines • ${totalPrintersCount - idlePrintersCount} Printing`}
        </div>
      </div>

      {/* Telemetry Table Container */}
      <div className="telemetry-scroll" style={{ overflowX: 'auto', maxHeight: '360px', overflowY: 'auto', position: 'relative' }}>
        {loadingPrinters ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div 
              className="telemetry-spinner"
              style={{
                width: '30px', height: '30px', border: '3px solid rgba(0,0,0,0.05)',
                borderTopColor: '#7F1D1D', borderRadius: '50%',
                margin: '0 auto 1rem'
              }} 
            />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Connecting to telemetry feed...</span>
          </div>
        ) : printers.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>
            No active machines registered on network.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>Machine</th>
                <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>Job</th>
                <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>Status</th>
                <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {sortedPrinters.map((printer, index) => {
                const isPrinting = printer.status === 'In Use';
                const machineCode = `Bambu Lab ${String(printer.id).padStart(2, '0')}`;
                const jobName = isPrinting ? (printer.objectName || 'Active Session') : '-';
                const remainingTime = getRemainingTimeStr(printer);

                return (
                  <tr 
                    key={printer.id} 
                    className="telemetry-row"
                    style={{ 
                      borderBottom: index === sortedPrinters.length - 1 ? 'none' : '1px solid rgba(0, 0, 0, 0.03)',
                    }}
                  >
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {machineCode}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.88rem', color: isPrinting ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: isPrinting ? 600 : 500 }}>
                      {jobName}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {isPrinting ? (
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.6rem',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          letterSpacing: '0.05em',
                          color: '#7F1D1D',
                          background: 'rgba(127, 29, 29, 0.06)',
                          border: '1px solid rgba(127, 29, 29, 0.25)',
                          borderRadius: '6px',
                          textTransform: 'uppercase'
                        }}>
                          Printing
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.6rem',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          letterSpacing: '0.05em',
                          color: 'var(--text-muted)',
                          background: 'rgba(100, 116, 139, 0.06)',
                          border: '1px solid rgba(100, 116, 139, 0.25)',
                          borderRadius: '6px',
                          textTransform: 'uppercase'
                        }}>
                          Idle
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.88rem', color: isPrinting ? '#7F1D1D' : 'var(--text-muted)', fontWeight: 700 }}>
                      {remainingTime}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LiveTelemetry;
