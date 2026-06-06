import { useState, useEffect, useRef } from 'react';
import { Phone, BookOpen, Upload, Link2, RotateCcw, X, Edit2, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import ambassadorsBg from '../assets/ambassadors_bg.png';

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

interface Person {
  id: string;
  name: string;
  branch: string;
  phone: string;
  bio?: string;
  imageUrl?: string;
}

interface EditCoordinatorModalProps {
  coordinator: Person;
  onClose: () => void;
  onSave: (updatedData: Partial<Person>) => Promise<void>;
}

const EditCoordinatorModal = ({ coordinator, onClose, onSave }: EditCoordinatorModalProps) => {
  const [nameInput, setNameInput] = useState<string>(coordinator.name);
  const [branchInput, setBranchInput] = useState<string>(coordinator.branch);
  const [phoneInput, setPhoneInput] = useState<string>(coordinator.phone);
  const [bioInput, setBioInput] = useState<string>(coordinator.bio || '');
  const [imageUrlInput, setImageUrlInput] = useState<string>(coordinator.imageUrl || '');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
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
    if (!nameInput || !branchInput || !phoneInput) {
      alert("Name, Role/Branch, and Phone are required.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: nameInput,
        branch: branchInput,
        phone: phoneInput,
        bio: bioInput,
        imageUrl: imageUrlInput
      });
      onClose();
    } catch (err) {
      console.error('Error saving coordinator profile:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
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
            Edit Profile: {coordinator.name}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>Name *</label>
          <input
            type="text"
            className="form-input"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', width: '100%', borderRadius: '12px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>Designation / Role *</label>
          <input
            type="text"
            className="form-input"
            value={branchInput}
            onChange={(e) => setBranchInput(e.target.value)}
            style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', width: '100%', borderRadius: '12px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>Phone *</label>
          <input
            type="text"
            className="form-input"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', width: '100%', borderRadius: '12px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>
            Biography / Bio
          </label>
          <textarea
            className="form-input"
            placeholder="Introduce this coordinator..."
            value={bioInput}
            onChange={(e) => setBioInput(e.target.value)}
            style={{
              padding: '0.65rem 1rem', fontSize: '0.85rem', width: '100%', borderRadius: '12px',
              minHeight: '85px', resize: 'vertical', fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Profile Image Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Profile Image Preview</span>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {imageUrlInput ? (
              <img
                src={imageUrlInput}
                alt="Preview"
                style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0' }}
              />
            ) : (
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%', background: 'var(--gradient-maroon)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem', fontWeight: 700
              }}>
                {nameInput ? getInitials(nameInput) : '?'}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{nameInput || 'Name'}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Preview profile photo</span>
            </div>
          </div>
        </div>

        {/* Upload options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Option 1: Upload Photo</span>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', margin: 0 }}>
              <Link2 size={14} /> Option 2: Image URL
            </label>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/avatar.jpg"
                value={imageUrlInput.startsWith('data:') ? '' : imageUrlInput}
                onChange={(e) => {
                  setImageUrlInput(e.target.value);
                  setSelectedFileName('');
                }}
                style={{ padding: '0.65rem 1rem', fontSize: '0.8rem', width: '100%', borderRadius: '12px' }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
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
            disabled={saving}
            className="btn-primary"
            style={{
              width: 'auto', padding: '0.65rem 1.5rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.85rem'
            }}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface AddCoordinatorModalProps {
  onClose: () => void;
  onAdd: (name: string, branch: string, phone: string, bio: string, imageUrl: string) => Promise<void>;
}

const AddCoordinatorModal = ({ onClose, onAdd }: AddCoordinatorModalProps) => {
  const [nameInput, setNameInput] = useState<string>('');
  const [branchInput, setBranchInput] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [bioInput, setBioInput] = useState<string>('');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
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

  const handleAdd = async () => {
    if (!nameInput || !branchInput || !phoneInput) {
      alert("Name, Role/Branch, and Phone are required.");
      return;
    }
    setSaving(true);
    try {
      await onAdd(nameInput, branchInput, phoneInput, bioInput, imageUrlInput);
      onClose();
    } catch (err) {
      console.error('Error adding coordinator profile:', err);
      alert('Failed to add profile. Please try again.');
    } finally {
      setSaving(false);
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
            Add New Coordinator
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>Name *</label>
          <input
            type="text"
            className="form-input"
            placeholder="Full Name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', width: '100%', borderRadius: '12px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>Designation / Role *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Head of Innovation"
            value={branchInput}
            onChange={(e) => setBranchInput(e.target.value)}
            style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', width: '100%', borderRadius: '12px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>Phone *</label>
          <input
            type="text"
            className="form-input"
            placeholder="+91 XXXXXXXXXX"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', width: '100%', borderRadius: '12px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>Biography / Bio</label>
          <textarea
            className="form-input"
            placeholder="Introduce this coordinator..."
            value={bioInput}
            onChange={(e) => setBioInput(e.target.value)}
            style={{
              padding: '0.65rem 1rem', fontSize: '0.85rem', width: '100%', borderRadius: '12px',
              minHeight: '85px', resize: 'vertical', fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Profile Image Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Profile Image Preview</span>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {imageUrlInput ? (
              <img
                src={imageUrlInput}
                alt="Preview"
                style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0' }}
              />
            ) : (
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%', background: 'var(--gradient-maroon)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem', fontWeight: 700
              }}>
                {nameInput ? getInitials(nameInput) : '?'}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{nameInput || 'Name'}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Preview profile photo</span>
            </div>
          </div>
        </div>

        {/* Upload Options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Option 1: Upload Photo</span>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', margin: 0 }}>
              <Link2 size={14} /> Option 2: Image URL
            </label>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/avatar.jpg"
                value={imageUrlInput.startsWith('data:') ? '' : imageUrlInput}
                onChange={(e) => {
                  setImageUrlInput(e.target.value);
                  setSelectedFileName('');
                }}
                style={{ padding: '0.65rem 1rem', fontSize: '0.8rem', width: '100%', borderRadius: '12px' }}
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
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
            onClick={handleAdd}
            disabled={saving}
            className="btn-primary"
            style={{
              width: 'auto', padding: '0.65rem 1.5rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.85rem'
            }}
          >
            {saving ? 'Adding...' : 'Add Coordinator'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface EditAmbassadorModalProps {
  ambassador: { id: number | string; name: string };
  currentSettings: { bio?: string; imageUrl?: string };
  onClose: () => void;
  onSave: (bio: string, imageUrl: string) => Promise<void>;
  onReset: () => Promise<void>;
}

const EditAmbassadorModal = ({ ambassador, currentSettings, onClose, onSave, onReset }: EditAmbassadorModalProps) => {
  const [bioInput, setBioInput] = useState<string>(currentSettings.bio || '');
  const [imageUrlInput, setImageUrlInput] = useState<string>(currentSettings.imageUrl || '');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
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
    setSaving(true);
    try {
      await onSave(bioInput, imageUrlInput);
      onClose();
    } catch (err) {
      console.error('Error saving ambassador profile:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      await onReset();
      onClose();
    } catch (err) {
      console.error('Error resetting ambassador profile:', err);
      alert('Failed to reset profile. Please try again.');
    } finally {
      setSaving(false);
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
            Edit Profile: {ambassador.name}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Biography Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>
            Biography / Bio
          </label>
          <textarea
            className="form-input"
            placeholder="Introduce this team member..."
            value={bioInput}
            onChange={(e) => setBioInput(e.target.value)}
            style={{
              padding: '0.65rem 1rem', fontSize: '0.85rem', width: '100%', borderRadius: '12px',
              minHeight: '85px', resize: 'vertical', fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Profile Image Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Profile Image Preview</span>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {imageUrlInput ? (
              <img
                src={imageUrlInput}
                alt="Preview"
                style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0' }}
              />
            ) : (
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%', background: 'var(--gradient-maroon)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem', fontWeight: 700
              }}>
                {getInitials(ambassador.name)}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{ambassador.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Preview profile photo</span>
            </div>

            {/* Undo selection / Reset option */}
            {(imageUrlInput !== (currentSettings.imageUrl || '') || bioInput !== (currentSettings.bio || '')) && (
              <button
                type="button"
                onClick={() => {
                  setImageUrlInput(currentSettings.imageUrl || '');
                  setBioInput(currentSettings.bio || '');
                  setSelectedFileName('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                style={{
                  marginLeft: 'auto',
                  background: 'rgba(0, 0, 0, 0.05)', color: 'var(--text-muted)',
                  border: 'none', borderRadius: '50%', width: '28px', height: '28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                title="Undo changes"
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
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Option 1: Upload Photo</span>
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
              <Link2 size={14} /> Option 2: Image URL
            </label>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/avatar.jpg"
                value={imageUrlInput.startsWith('data:') ? '' : imageUrlInput} // don't show base64 string in URL box
                onChange={(e) => {
                  setImageUrlInput(e.target.value);
                  setSelectedFileName('');
                }}
                style={{ padding: '0.65rem 1rem', fontSize: '0.8rem', width: '100%', borderRadius: '12px' }}
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          {/* Reset Button (only if custom settings exist) */}
          {(currentSettings.bio || currentSettings.imageUrl) && (
            <button
              onClick={handleReset}
              disabled={saving}
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
            disabled={saving}
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
            disabled={saving}
            className="btn-primary"
            style={{
              width: 'auto', padding: '0.65rem 1.5rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.85rem'
            }}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AmbassadorDirectory = () => {
  const { user, isAdmin } = useAuth();
  const [ambassadorSettings, setAmbassadorSettings] = useState<Record<string, { bio?: string; imageUrl?: string }>>({});
  const [coordinators, setCoordinators] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Editing Profile
  const [editingAmbassador, setEditingAmbassador] = useState<{ id: number | string; name: string } | null>(null);
  const [editingCoordinator, setEditingCoordinator] = useState<Person | null>(null);
  const [isAddingCoordinator, setIsAddingCoordinator] = useState(false);

  // Listen to coordinator custom profiles from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'coordinators'), (snapshot) => {
      if (snapshot.empty) {
        // Seed default coordinator B.R. Bagane
        const newDocRef = doc(collection(db, 'coordinators'));
        setDoc(newDocRef, {
          name: 'B.R. Bagane',
          branch: 'Head of Innovation & Idea Lab',
          phone: '+91 9423840249',
          bio: '',
          imageUrl: ''
        });
      } else {
        const list: Person[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            name: data.name || '',
            branch: data.branch || '',
            phone: data.phone || '',
            bio: data.bio || '',
            imageUrl: data.imageUrl || ''
          });
        });
        setCoordinators(list);
      }
    }, (error) => {
      console.error('Error fetching coordinators:', error);
    });

    return () => unsubscribe();
  }, []);

  // Listen to ambassador custom profile settings from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'ambassador_settings'), (snapshot) => {
      const settings: Record<string, { bio?: string; imageUrl?: string }> = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        settings[doc.id] = {
          bio: data.bio || '',
          imageUrl: data.imageUrl || ''
        };
      });
      setAmbassadorSettings(settings);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching ambassador settings:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveSettings = async (bio: string, imageUrl: string) => {
    if (!editingAmbassador) return;
    await setDoc(doc(db, 'ambassador_settings', String(editingAmbassador.id)), {
      bio,
      imageUrl,
      updatedBy: user?.email || 'Admin',
      updatedAt: serverTimestamp()
    });
  };

  const handleResetSettings = async () => {
    if (!editingAmbassador) return;
    await deleteDoc(doc(db, 'ambassador_settings', String(editingAmbassador.id)));
  };

  const handleSaveCoordinator = async (updatedData: Partial<Person>) => {
    if (!editingCoordinator) return;
    await setDoc(doc(db, 'coordinators', editingCoordinator.id), {
      ...updatedData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const handleAddCoordinator = async (name: string, branch: string, phone: string, bio: string, imageUrl: string) => {
    const newDocRef = doc(collection(db, 'coordinators'));
    await setDoc(newDocRef, {
      name,
      branch,
      phone,
      bio,
      imageUrl,
      createdAt: serverTimestamp()
    });
  };

  const handleDeleteCoordinator = async (id: string, name: string) => {
    const confirmation = window.confirm(`Are you sure you want to delete coordinator "${name}"?`);
    if (confirmation) {
      await deleteDoc(doc(db, 'coordinators', id));
    }
  };

  const filteredCoordinators = coordinators;

  const filteredAmbassadors = AMBASSADORS;


  if (loading) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{
          width: '40px', height: '40px', border: '3px solid #F1F5F9', borderTopColor: '#7F1D1D',
          borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem'
        }} />
        <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Loading directory...</p>
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
        .ambassador-card {
          transition: all 0.45s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          background: white;
          border-radius: 24px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .ambassador-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 60px -15px rgba(127, 29, 29, 0.2);
          border-color: rgba(127, 29, 29, 0.35);
        }
        .ambassador-card:hover .banner-image {
          transform: scale(1.12);
          filter: brightness(0.85) blur(1px);
        }
        .glass-tag {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .glass-tag:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.28) !important;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }
        .dashed-add-card {
          border: 2px dashed #CBD5E1;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.5);
          transition: all 0.45s cubic-bezier(0.25, 0.8, 0.25, 1);
          backdrop-filter: blur(8px);
        }
        .dashed-add-card:hover {
          border-color: #7F1D1D;
          background: rgba(127, 29, 29, 0.04);
          transform: translateY(-10px);
          box-shadow: 0 20px 45px -15px rgba(127, 29, 29, 0.15);
        }
        .dashed-add-card:hover .add-icon {
          transform: scale(1.2) rotate(90deg);
          color: #7F1D1D !important;
        }
        .add-icon {
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .avatar-ring {
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .ambassador-card:hover .avatar-ring {
          transform: rotate(6deg) scale(1.06);
          border-color: #FECACA !important;
          box-shadow: 0 6px 16px rgba(0,0,0,0.3);
        }
        .search-input-wrapper {
          position: relative;
          width: 100%;
          max-width: 480px;
          transition: all 0.3s ease;
        }
        .search-input {
          width: 100%;
          padding: 0.75rem 1.25rem 0.75rem 2.8rem;
          font-size: 0.9rem;
          border: 1.5px solid #E2E8F0;
          border-radius: 16px;
          background: #F8FAFC;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          color: var(--text-main);
          font-weight: 500;
        }
        .search-input:focus {
          outline: none;
          background: white;
          border-color: #7F1D1D;
          box-shadow: 0 10px 25px -5px rgba(127, 29, 29, 0.08), 0 0 0 3px rgba(127, 29, 29, 0.12);
        }
      `}</style>


      {/* Coordinator Section */}
      {(filteredCoordinators.length > 0 || isAdmin) && (
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Idea Lab Coordinator</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '2.5rem',
            marginTop: '1.5rem'
          }}>
            {filteredCoordinators.map((coordinator) => {
              return (
                <div key={coordinator.id} className="ambassador-card" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '380px',
                  maxWidth: '520px',
                  width: '100%',
                  position: 'relative',
                  borderRadius: '24px',
                  overflow: 'hidden'
                }}>
                  {/* Background Image with Hover Zoom */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.85) 100%), url("${coordinator.imageUrl || ambassadorsBg}")`,
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
                    padding: '1.75rem'
                  }}>
                    {/* Top Row: Tag & Admin Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(4px)',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '0.3rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Coordinator
                      </span>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => setEditingCoordinator(coordinator)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                color: '#7F1D1D',
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                transition: 'transform 0.2s',
                                zIndex: 3
                              }}
                              title="Edit Profile"
                              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteCoordinator(coordinator.id, coordinator.name)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                color: '#DC2626',
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                transition: 'transform 0.2s',
                                zIndex: 3
                              }}
                              title="Delete Profile"
                              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bottom details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Mini circular avatar */}
                        <div
                          className="avatar-ring"
                          style={{
                            width: '59px', height: '59px', borderRadius: '50%',
                            background: coordinator.imageUrl ? `url("${coordinator.imageUrl}")` : 'var(--gradient-maroon)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: '2px solid white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                            fontWeight: 700, fontSize: '1.1rem', flexShrink: 0
                          }}
                        >
                          {!coordinator.imageUrl && getInitials(coordinator.name)}
                        </div>

                        <h3 style={{
                          fontSize: '1.5rem',
                          fontWeight: 800,
                          color: 'white',
                          margin: 0,
                          letterSpacing: '-0.02em',
                          textShadow: '0 2px 8px rgba(0,0,0,0.6)'
                        }}>
                          {coordinator.name}
                        </h3>
                      </div>

                      {/* Biography */}
                      {coordinator.bio && (
                        <p style={{
                          fontSize: '0.88rem',
                          color: 'rgba(255, 255, 255, 0.95)',
                          margin: '0.25rem 0',
                          fontStyle: 'italic',
                          lineHeight: '1.4',
                          textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                          title={coordinator.bio}
                        >
                          "{coordinator.bio}"
                        </p>
                      )}

                      {/* Metadata Tags */}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                        <div className="glass-tag" style={{
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                          color: 'white', background: 'rgba(255, 255, 255, 0.16)',
                          backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)',
                          padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600
                        }}>
                          <BookOpen size={14} color="#FCA5A5" />
                          <span>{coordinator.branch}</span>
                        </div>
                        <div className="glass-tag" style={{
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                          color: 'white', background: 'rgba(255, 255, 255, 0.16)',
                          backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)',
                          padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600
                        }}>
                          <Phone size={14} />
                          <span>{coordinator.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Coordinator Button Card (Admins Only) */}
            {isAdmin && (
              <div
                onClick={() => setIsAddingCoordinator(true)}
                className="dashed-add-card"
                style={{
                  maxWidth: '520px',
                  width: '100%',
                  height: '380px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  gap: '0.5rem'
                }}
              >
                <Plus size={40} className="add-icon" color="#7F1D1D" />
                <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>Add Coordinator</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ambassadors Section */}
      {(filteredAmbassadors.length > 0 || isAdmin) && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Student Ambassadors</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '3rem',
            marginTop: '2.5rem'
          }}>
            {filteredAmbassadors.map((ambassador) => {
              const settings = ambassadorSettings[String(ambassador.id)] || {};

              return (
                <div key={ambassador.id} className="ambassador-card" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '340px',
                  position: 'relative',
                  borderRadius: '24px',
                  overflow: 'hidden'
                }}>
                  {/* Background Image spanning the entire card with hover zoom */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.85) 100%), url(${settings.imageUrl || ambassadorsBg})`,
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
                    {/* Top Row: Admin Edit button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                      {isAdmin && (
                        <button
                          onClick={() => setEditingAmbassador(ambassador)}
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
                          title="Edit Profile"
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                    </div>

                    {/* Bottom Details Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Mini Avatar/Initials Badge */}
                        <div
                          className="avatar-ring"
                          style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: settings.imageUrl ? `url(${settings.imageUrl})` : 'var(--gradient-maroon)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: '2px solid white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                            fontWeight: 700, fontSize: '0.95rem', flexShrink: 0
                          }}
                        >
                          {!settings.imageUrl && getInitials(ambassador.name)}
                        </div>

                        <h3 style={{
                          fontSize: '1.35rem',
                          fontWeight: 800,
                          color: 'white',
                          margin: 0,
                          letterSpacing: '-0.02em',
                          textShadow: '0 2px 8px rgba(0,0,0,0.6)'
                        }}>
                          {ambassador.name}
                        </h3>
                      </div>

                      {/* Biography display */}
                      {settings.bio && (
                        <p style={{
                          fontSize: '0.82rem',
                          color: 'rgba(255, 255, 255, 0.95)',
                          margin: '0.25rem 0',
                          fontStyle: 'italic',
                          lineHeight: '1.4',
                          textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                          title={settings.bio}
                        >
                          "{settings.bio}"
                        </p>
                      )}

                      {/* Metadata Tags */}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                        <div className="glass-tag" style={{
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                          color: 'white', background: 'rgba(255, 255, 255, 0.16)',
                          backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)',
                          padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600
                        }}>
                          <BookOpen size={14} />
                          <span>{ambassador.branch}</span>
                        </div>
                        <div className="glass-tag" style={{
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                          color: 'white', background: 'rgba(255, 255, 255, 0.16)',
                          backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)',
                          padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600
                        }}>
                          <Phone size={14} />
                          <span>{ambassador.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Ambassador Modal */}
      {editingAmbassador && (
        <EditAmbassadorModal
          ambassador={editingAmbassador}
          currentSettings={ambassadorSettings[String(editingAmbassador.id)] || {}}
          onClose={() => setEditingAmbassador(null)}
          onSave={handleSaveSettings}
          onReset={handleResetSettings}
        />
      )}

      {/* Edit Coordinator Modal */}
      {editingCoordinator && (
        <EditCoordinatorModal
          coordinator={editingCoordinator}
          onClose={() => setEditingCoordinator(null)}
          onSave={handleSaveCoordinator}
        />
      )}

      {/* Add Coordinator Modal */}
      {isAddingCoordinator && (
        <AddCoordinatorModal
          onClose={() => setIsAddingCoordinator(false)}
          onAdd={handleAddCoordinator}
        />
      )}
    </div>
  );
};

export default AmbassadorDirectory;
