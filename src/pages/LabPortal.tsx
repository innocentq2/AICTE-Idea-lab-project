import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, MapPin, Activity, Camera, Upload, Link2, RotateCcw, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import printerBg from '../assets/printer_bg.png';

interface EditBannerModalProps {
  printer: { id: number; name: string };
  currentImage: string;
  onClose: () => void;
  onSave: (imageUrl: string) => Promise<void>;
  onReset: () => Promise<void>;
}

const EditBannerModal = ({ printer, currentImage, onClose, onSave, onReset }: EditBannerModalProps) => {
  const [imageUrlInput, setImageUrlInput] = useState<string>(currentImage);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [savingImage, setSavingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        alert("Image size is too large. Please select an image under 800KB.");
        return;
      }
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrlInput(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!imageUrlInput) return;
    setSavingImage(true);
    try {
      await onSave(imageUrlInput);
      onClose();
    } catch (err) {
      console.error('Error saving image:', err);
      alert('Failed to save printer image. Please try again.');
    } finally {
      setSavingImage(false);
    }
  };

  const handleReset = async () => {
    setSavingImage(true);
    try {
      await onReset();
      onClose();
    } catch (err) {
      console.error('Error resetting image:', err);
      alert('Failed to reset printer image. Please try again.');
    } finally {
      setSavingImage(false);
    }
  };

  return (
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
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Edit Banner: {printer.name}
          </h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Image Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Banner Preview</span>
          <div style={{ 
            height: '110px', borderRadius: '12px',
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(${imageUrlInput || printerBg})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            border: '1px solid #E2E8F0', display: 'flex', alignItems: 'flex-end', padding: '1rem',
            position: 'relative'
          }}>
            <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 700 }}>{printer.name} banner</span>

            {/* Undo selection / Reset option */}
            {imageUrlInput !== currentImage && (
              <button
                type="button"
                onClick={() => {
                  setImageUrlInput(currentImage);
                  setSelectedFileName('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                style={{
                  position: 'absolute', top: '10px', right: '10px',
                  background: 'rgba(0, 0, 0, 0.7)', color: 'white',
                  border: 'none', borderRadius: '50%', width: '28px', height: '28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  zIndex: 10, transition: 'all 0.2s'
                }}
                title="Undo current selection"
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Inputs Block */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          
          {/* Option A: Local Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Option 1: Upload Image</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #CBD5E1', borderRadius: '12px', padding: '1rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '0.4rem', background: '#F8FAFC', cursor: 'pointer', transition: 'all 0.2s',
                color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600, flex: 1, minHeight: '85px'
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#7F1D1D')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#CBD5E1')}
            >
              <Upload size={18} color="#7F1D1D" style={{ flexShrink: 0 }} />
              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%', fontSize: '0.75rem' }}>
                {selectedFileName ? selectedFileName : 'Choose file (Max 800KB)'}
              </span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
          </div>

          {/* Option B: Image URL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', margin: 0 }}>
              <Link2 size={14} /> Option 2: Web URL
            </label>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://example.com/image.jpg"
                value={imageUrlInput.startsWith('data:') ? '' : imageUrlInput} // don't show base64 string in URL box
                onChange={(e) => {
                  setImageUrlInput(e.target.value);
                  setSelectedFileName(''); // clear uploaded file name if URL is entered
                }} 
                style={{ padding: '0.65rem 1rem', fontSize: '0.8rem', width: '100%', borderRadius: '12px' }}
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          {/* Reset Button (only if custom image currently exists) */}
          {currentImage && (
            <button
              onClick={handleReset}
              disabled={savingImage}
              style={{
                padding: '0.65rem 1.25rem', borderRadius: '10px',
                border: '1.5px solid #DC2626', background: 'none',
                color: '#DC2626', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem'
              }}
            >
              <RotateCcw size={14} />
              Reset to Default
            </button>
          )}

          <button 
            type="button" 
            onClick={onClose}
            disabled={savingImage}
            style={{ 
              padding: '0.65rem 1.25rem', borderRadius: '10px', 
              border: '1.5px solid #E2E8F0', background: 'none', 
              color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Cancel
          </button>

          <button 
            onClick={handleSave}
            disabled={savingImage || !imageUrlInput}
            className="btn-primary"
            style={{ 
              width: 'auto', padding: '0.65rem 1.5rem', 
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.85rem'
            }}
          >
            {savingImage ? 'Saving...' : 'Save Banner'}
          </button>
        </div>
      </div>
    </div>
  );
};

const LabPortal = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [printers, setPrinters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Editing Image
  const [editingPrinter, setEditingPrinter] = useState<any | null>(null);

  // Listen to printer_details from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'printer_details'), async (snapshot) => {
      if (snapshot.empty) {
        // Auto-seed 18 default printers if collection is empty
        try {
          for (let i = 1; i <= 18; i++) {
            await setDoc(doc(db, 'printer_details', String(i)), {
              id: i,
              name: `Bambu Lab ${i}`,
              type: '3D Printer',
              location: 'Idea Lab Main Floor',
              imageUrl: '',
              status: 'Available',
              currentOperator: '',
              operatorEmail: '',
              operatorBranch: '',
              operatorClass: '',
              operatorMobile: '',
              useReason: '',
              timingIn: '',
              timingOut: '',
              createdAt: serverTimestamp()
            });
          }
        } catch (err) {
          console.error('Error seeding default printers:', err);
        }
        return;
      }

      const list: any[] = [];
      const now = new Date();
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let currentStatus = data.status;
        
        if (currentStatus === 'In Use' && data.sessionEndTime && now > new Date(data.sessionEndTime)) {
          currentStatus = 'Available';
          setDoc(doc(db, 'printer_details', docSnap.id), {
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
          }, { merge: true }).catch((err) => {
            console.error('Error auto-releasing printer from portal:', err);
          });
        }

        list.push({
          dbId: docSnap.id,
          ...data,
          status: currentStatus
        });
      });

      // Sort by printer id ascending
      list.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
      setPrinters(list);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching printer details:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveImage = async (imageUrl: string) => {
    if (!editingPrinter) return;
    await setDoc(doc(db, 'printer_details', String(editingPrinter.id)), {
      imageUrl,
      updatedBy: user?.email || 'Admin',
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const handleResetImage = async () => {
    if (!editingPrinter) return;
    await setDoc(doc(db, 'printer_details', String(editingPrinter.id)), {
      imageUrl: '',
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  if (loading) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ 
          width: '40px', height: '40px', border: '3px solid #F1F5F9', borderTopColor: '#7F1D1D',
          borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem'
        }} />
        <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Loading equipment portal data...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .equipment-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          background: white;
          border-radius: 24px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .equipment-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px -12px rgba(127, 29, 29, 0.12);
          border-color: rgba(127, 29, 29, 0.2);
        }
        .equipment-card:hover .banner-image {
          transform: scale(1.08);
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Lab Equipment Portal</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Real-time view of our 3D Printers and other equipment.</p>
        </div>
        {isAdmin && (
          <span style={{ 
            fontSize: '0.8rem', fontWeight: 700, padding: '0.5rem 1rem', borderRadius: '8px', 
            background: 'rgba(127, 29, 29, 0.1)', color: '#7F1D1D', border: '1px solid rgba(127, 29, 29, 0.2)' 
          }}>
            Admin Mode Active
          </span>
        )}
      </div>

      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '2.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Access Printers</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '3rem',
        marginTop: '1.5rem'
      }}>
        {printers.map((printer) => {
          return (
            <div 
              key={printer.id} 
              className="equipment-card" 
              onClick={() => navigate(`/lab-portal/printer/${printer.id}`)}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '340px',
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                border: '1px solid #E2E8F0',
                cursor: 'pointer'
              }}
            >
              
              {/* Background Image spanning the entire card with hover zoom */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.85) 100%), url(${printer.imageUrl || printerBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 1
              }}
              className="banner-image"
              />

              {/* Card Content Overlay */}
              <div style={{ 
                position: 'relative', 
                zIndex: 2, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                padding: '1.5rem'
              }}>
                {/* Top Row: Camera Button & Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexDirection: 'row-reverse' }}>
                  {/* Status Badge */}
                  <span style={{
                    background: printer.status === 'In Use' ? 'rgba(249, 115, 22, 0.25)' : 'rgba(16, 185, 129, 0.25)',
                    backdropFilter: 'blur(8px)',
                    color: printer.status === 'In Use' ? '#FFEDD5' : '#D1FAE5',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.35rem 0.85rem',
                    borderRadius: '8px',
                    border: printer.status === 'In Use' ? '1px solid rgba(249, 115, 22, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    zIndex: 3
                  }}>
                    {printer.status || 'Available'}
                  </span>

                  {/* Admin Image Edit Button */}
                  {isAdmin ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPrinter(printer);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)', 
                        color: '#7F1D1D',
                        border: '1.5px solid #F1F5F9', 
                        borderRadius: '50%', 
                        width: '36px', 
                        height: '36px',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        cursor: 'pointer', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transition: 'all 0.2s',
                        zIndex: 3
                      }}
                      title="Change Printer Image"
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <Camera size={16} />
                    </button>
                  ) : <div />}
                </div>

                {/* Bottom Details Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Floating Icon */}
                    <div style={{ 
                      width: '48px', height: '48px', borderRadius: '14px', 
                      background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', flexShrink: 0
                    }}>
                      <Printer size={22} strokeWidth={1.5} />
                    </div>

                    <h3 style={{ 
                      fontSize: '1.45rem', 
                      fontWeight: 800, 
                      color: 'white', 
                      margin: 0,
                      letterSpacing: '-0.02em',
                      textShadow: '0 2px 8px rgba(0,0,0,0.6)'
                    }}>
                      {printer.name}
                    </h3>
                  </div>

                  {/* Metadata Tags */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.4rem', 
                      color: 'white', background: 'rgba(255, 255, 255, 0.16)', 
                      backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600
                    }}>
                      <Activity size={14} color="#EF4444" />
                      <span>{printer.type}</span>
                    </div>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.4rem', 
                      color: 'white', background: 'rgba(255, 255, 255, 0.16)', 
                      backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600
                    }}>
                      <MapPin size={14} />
                      <span>{printer.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Image Modal */}
      {editingPrinter && (
        <EditBannerModal
          printer={editingPrinter}
          currentImage={editingPrinter.imageUrl || ''}
          onClose={() => setEditingPrinter(null)}
          onSave={handleSaveImage}
          onReset={handleResetImage}
        />
      )}
    </div>
  );
};

export default LabPortal;
