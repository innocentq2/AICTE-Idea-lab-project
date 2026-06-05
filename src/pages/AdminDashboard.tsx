import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, collectionGroup } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, Database, Calendar, Briefcase, Users as UsersIcon, Menu, X, MessageSquare, FileQuestion, Printer, Activity, CheckCircle } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  name: string;
  email: string;
  branch: string;
  studentClass: string;
  rollNo: string;
  mobileNo: string;
  wantToWorkOn: string;
  reasonOfWorking: string;
  timingIn: string;
  timingOut: string;
  timestamp: any;
}

type TabType = 'all' | 'regular' | 'meeting' | 'workshop' | 'feedback' | 'questionnaire' | 'printers';

interface FormRecord {
  id: string;
  [key: string]: any;
}

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [collectionsData, setCollectionsData] = useState<Record<string, AttendanceRecord[]>>({});
  const [fetching, setFetching] = useState(true);
  const [formsData, setFormsData] = useState<FormRecord[]>([]);
  const [formsFetching, setFormsFetching] = useState(false);
  const [selectedFormsDate, setSelectedFormsDate] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [printersList, setPrintersList] = useState<any[]>([]);
  const [printersHistory, setPrintersHistory] = useState<any[]>([]);
  const [printersFetching, setPrintersFetching] = useState(false);
  const [selectedPrinterDate, setSelectedPrinterDate] = useState<string>('');

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === 'feedback' || activeTab === 'questionnaire' || activeTab === 'printers') return;

    let collectionsToFetch: string[] = [];
    if (activeTab === 'all') {
      collectionsToFetch = ['regular_attendance', 'meeting_attendance', 'workshop_attendance'];
    } else {
      let collectionName = 'regular_attendance';
      if (activeTab === 'meeting') collectionName = 'meeting_attendance';
      if (activeTab === 'workshop') collectionName = 'workshop_attendance';
      collectionsToFetch = [collectionName];
    }

    setFetching(true);
    setCollectionsData({});

    const unsubscribers = collectionsToFetch.map(colName => {
      const q = query(collection(db, colName), orderBy('timestamp', 'desc'));
      return onSnapshot(q, (querySnapshot) => {
        const data: AttendanceRecord[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as AttendanceRecord);
        });
        setCollectionsData(prev => ({ ...prev, [colName]: data }));
        setFetching(false);
      }, (error) => {
        console.error('Error fetching data:', error);
        setFetching(false);
      });
    });

    return () => unsubscribers.forEach(u => u());
  }, [activeTab, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab !== 'feedback' && activeTab !== 'questionnaire') return;
    const colName = activeTab === 'feedback' ? 'feedback' : 'questionnaire_responses';
    setFormsFetching(true);
    setFormsData([]);
    const q = query(collection(db, colName), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const data: FormRecord[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() }));
      setFormsData(data);
      setFormsFetching(false);
    }, err => {
      console.error('Error fetching forms:', err);
      setFormsFetching(false);
    });
    return () => unsub();
  }, [activeTab, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab !== 'printers') return;
    setPrintersFetching(true);

    // 1. Listen to live printer status
    const unsubPrinters = onSnapshot(collection(db, 'printer_details'), (snap) => {
      const list: any[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      list.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
      setPrintersList(list);
    }, (err) => {
      console.error('Error fetching admin printers:', err);
    });

    // 2. Listen to all session history records across all printers
    const qHistory = query(collectionGroup(db, 'history'));
    const unsubHistory = onSnapshot(qHistory, (snap) => {
      const list: any[] = [];
      snap.forEach((docSnap) => {
        const printerId = docSnap.ref.parent.parent?.id || 'Unknown';
        list.push({
          id: docSnap.id,
          printerId,
          ...docSnap.data()
        });
      });
      // Sort by timestamp desc in-memory
      list.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setPrintersHistory(list);
      setPrintersFetching(false);
    }, (err) => {
      console.error('Error fetching admin printers history:', err);
      setPrintersFetching(false);
    });

    return () => {
      unsubPrinters();
      unsubHistory();
    };
  }, [activeTab, isAdmin]);

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Admin Portal...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return (
      <div className="attendance-layout">
        <div className="glass-panel" style={{ background: 'white' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#DC2626' }}>Access Denied</h2>
          <p>Sorry, your email ({user.email}) does not have admin privileges.</p>
        </div>
      </div>
    );
  }

  // Helper: convert Firestore timestamp to YYYY-MM-DD
  const toDateStr = (ts: any): string => {
    if (!ts?.toDate) return '';
    const d = ts.toDate();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  // Merge, Sort and Filter Attendance Data
  let displayRecords = Object.values(collectionsData).flat();
  displayRecords.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
  if (selectedDate) {
    displayRecords = displayRecords.filter(r => toDateStr(r.timestamp) === selectedDate);
  }

  // Filter Forms Data by date
  let displayForms = formsData;
  if (selectedFormsDate) {
    displayForms = formsData.filter(r => toDateStr(r.timestamp) === selectedFormsDate);
  }

  // Filter Printer logs by date
  let displayPrintersHistory = printersHistory;
  if (selectedPrinterDate) {
    displayPrintersHistory = printersHistory.filter(r => toDateStr(r.timestamp) === selectedPrinterDate);
  }

  const exportPrintersPDF = () => {
    const doc = new jsPDF('landscape');
    const MAROON: [number, number, number] = [127, 29, 29];
    const LIGHT_GRAY: [number, number, number] = [248, 250, 252];
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    // Header bar
    doc.setFillColor(...MAROON);
    doc.rect(0, 0, pw, 28, 'F');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text("SWVSM's Warana University — AICTE Idea Lab", pw / 2, 10, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("3D Printer Usage Logs Report", pw / 2, 18, { align: 'center' });
    doc.setFontSize(8);
    doc.text(
      `Exported: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}   |   Total Sessions: ${displayPrintersHistory.length}`,
      pw / 2, 25, { align: 'center' }
    );

    autoTable(doc, {
      startY: 34,
      head: [['Sr.', 'Date', 'Printer', 'Operator', 'Branch/Class', 'Object Name', 'Duration', 'Material', 'Time Slot', 'Reason']],
      body: displayPrintersHistory.map((r, i) => {
        const printerObj = printersList.find(p => String(p.id) === String(r.printerId));
        const printerName = printerObj ? printerObj.name : `Printer #${r.printerId}`;
        const dateStr = r.timestamp?.toDate ? r.timestamp.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Just now';
        return [
          i + 1,
          dateStr,
          printerName,
          r.name || '-',
          `${r.branch || '-'} (${r.studentClass || '-'})`,
          r.objectName || '-',
          r.printingDuration || '-',
          r.materialConsumption || '-',
          `${r.timingIn || '-'} - ${r.timingOut || '-'}`,
          r.useReason || '-'
        ];
      }),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: MAROON, textColor: 255, fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: 10, right: 10 },
    });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Page 1 of 1  |  Ravindra Sakharpe AICTE Idea Lab, Warananagar`, pw / 2, ph - 6, { align: 'center' });

    const filename = `printer_usage_report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const exportPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(16);
    doc.text(`AICTE Idea Lab - Attendance Report (${activeTab.toUpperCase()})`, 14, 15);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    if (selectedDate) {
      doc.text(`Date: ${selectedDate}`, 14, 23);
    } else {
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 23);
    }
    doc.text(`Total Students: ${displayRecords.length}`, 14, 30);

    autoTable(doc, {
      startY: 37,
      head: [['Sr. No.', 'Name', 'Mobile No', 'Branch', 'Roll No', 'Work On', 'Reason', 'In', 'Out']],
      body: displayRecords.map((r, index) => [
        index + 1,
        r.name || '',
        r.mobileNo || '-',
        r.branch || '',
        r.rollNo || '',
        r.wantToWorkOn || '',
        r.reasonOfWorking || '',
        r.timingIn || '-',
        r.timingOut || '-'
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 38, 38], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    const filename = `attendance_${activeTab}${selectedDate ? `_${selectedDate}` : ''}.pdf`;
    doc.save(filename);
  };

  const exportFormsPDF = () => {
    const isFeedback = activeTab === 'feedback';
    const title = isFeedback ? 'AICTE Idea Lab — Feedback Responses' : 'AICTE Idea Lab — Questionnaire Responses';
    const MAROON: [number, number, number] = [127, 29, 29];
    const LIGHT_GRAY: [number, number, number] = [248, 250, 252];
    const LABEL_BG: [number, number, number] = [241, 245, 249];
    const totalPages = displayForms.length + 1;

    // ═══════════════════════════════════════════════════════════════════
    // PAGE 1 — Landscape summary of all participants
    // ═══════════════════════════════════════════════════════════════════
    const pdfDoc = new jsPDF('landscape');
    const pw = pdfDoc.internal.pageSize.getWidth();
    const ph = pdfDoc.internal.pageSize.getHeight();

    // Header bar
    pdfDoc.setFillColor(...MAROON);
    pdfDoc.rect(0, 0, pw, 28, 'F');
    pdfDoc.setFontSize(14);
    pdfDoc.setTextColor(255, 255, 255);
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.text("SWVSM's Warana University — AICTE Idea Lab", pw / 2, 10, { align: 'center' });
    pdfDoc.setFontSize(10);
    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.text(title, pw / 2, 18, { align: 'center' });
    pdfDoc.setFontSize(8);
    pdfDoc.text(
      `Exported: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}   |   Total Participants: ${displayForms.length}`,
      pw / 2, 25, { align: 'center' }
    );

    // Summary table
    if (isFeedback) {
      autoTable(pdfDoc, {
        startY: 34,
        head: [['Sr. No.', 'Name', 'Roll No', 'Branch', 'Year', 'College', 'Contact', 'Industry', 'Visit Date', 'Useful?', 'Overall ★']],
        body: displayForms.map((r, i) => [
          i + 1, r.name || '-', r.rollNumber || '-', r.branch || '-', r.year || '-',
          r.collegeName || '-', r.contactNumber || '-', r.industryName || '-',
          r.visitDate || '-', r.visitUseful || '-',
          r.overallExperience ? `${r.overallExperience}/5` : '-'
        ]),
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: MAROON, textColor: 255, fontStyle: 'bold', fontSize: 7 },
        alternateRowStyles: { fillColor: LIGHT_GRAY },
        margin: { left: 10, right: 10 },
      });
    } else {
      autoTable(pdfDoc, {
        startY: 34,
        head: [['Sr. No.', 'Name', 'Roll No', 'Branch', 'Year', 'College', 'Contact', 'Industry', 'Understood 3D?', 'Safety?', 'Learn More?']],
        body: displayForms.map((r, i) => [
          i + 1, r.studentName || '-', r.rollNumber || '-', r.branch || '-', r.year || '-',
          r.collegeName || '-', r.contactNumber || '-', r.industryName || '-',
          r.understoodWorking || '-', r.safetyExplained || '-', r.wouldLearnMore || '-'
        ]),
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: MAROON, textColor: 255, fontStyle: 'bold', fontSize: 7 },
        alternateRowStyles: { fillColor: LIGHT_GRAY },
        margin: { left: 10, right: 10 },
      });
    }

    // Page 1 footer
    pdfDoc.setFontSize(7);
    pdfDoc.setTextColor(150);
    pdfDoc.text(`Page 1 of ${totalPages}  |  Ravindra Sakharpe AICTE Idea Lab, Warananagar`, pw / 2, ph - 6, { align: 'center' });

    // ═══════════════════════════════════════════════════════════════════
    // PAGE 2+ — Each participant's full details (portrait, one per page)
    // ═══════════════════════════════════════════════════════════════════
    displayForms.forEach((r, i) => {
      pdfDoc.addPage('a4', 'portrait');
      const ppw = pdfDoc.internal.pageSize.getWidth();
      const pph = pdfDoc.internal.pageSize.getHeight();

      // Participant header bar
      pdfDoc.setFillColor(...MAROON);
      pdfDoc.rect(0, 0, ppw, 22, 'F');
      pdfDoc.setFontSize(13);
      pdfDoc.setTextColor(255, 255, 255);
      pdfDoc.setFont('helvetica', 'bold');
      const pName = isFeedback ? (r.name || 'N/A') : (r.studentName || 'N/A');
      pdfDoc.text(`Sr. No. ${i + 1}  —  ${pName}`, 10, 14);
      pdfDoc.setFontSize(8);
      pdfDoc.setFont('helvetica', 'normal');
      pdfDoc.text(`Roll No: ${r.rollNumber || '-'}  |  ${r.branch || '-'}  |  ${r.year || '-'}`, ppw - 10, 14, { align: 'right' });

      // Personal details table
      autoTable(pdfDoc, {
        startY: 28,
        head: [['Field', 'Value', 'Field', 'Value']],
        body: isFeedback
          ? [
              ['Name', r.name || '-', 'Roll Number', r.rollNumber || '-'],
              ['Branch', r.branch || '-', 'Year', r.year || '-'],
              ['College Name', r.collegeName || '-', 'Contact Number', r.contactNumber || '-'],
              ['Industry Name', r.industryName || '-', 'Date of Visit', r.visitDate || '-'],
              ['Industry Type', r.industryType || '-', 'Visit Duration', r.visitDuration || '-'],
              ['Visit Useful?', r.visitUseful || '-', 'Would Recommend?', r.wouldRecommend || '-'],
            ]
          : [
              ['Name', r.studentName || '-', 'Roll Number', r.rollNumber || '-'],
              ['Branch', r.branch || '-', 'Year', r.year || '-'],
              ['College Name', r.collegeName || '-', 'Contact Number', r.contactNumber || '-'],
              ['Industry Visited', r.industryName || '-', '', ''],
            ],
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: MAROON, textColor: 255, fontStyle: 'bold', fontSize: 8 },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: LABEL_BG, cellWidth: 38 },
          1: { cellWidth: 55 },
          2: { fontStyle: 'bold', fillColor: LABEL_BG, cellWidth: 38 },
          3: { cellWidth: 55 },
        },
        alternateRowStyles: {},
        margin: { left: 10, right: 10 },
      });

      const afterPersonal = (pdfDoc as any).lastAutoTable.finalY + 6;

      if (isFeedback) {
        // Ratings table
        autoTable(pdfDoc, {
          startY: afterPersonal,
          head: [['Rating Category', 'Score']],
          body: [
            ['Overall Experience', r.overallExperience ? `${r.overallExperience} / 5` : '-'],
            ['Lab Facilities & Infrastructure', r.facilitiesRating ? `${r.facilitiesRating} / 5` : '-'],
            ['Staff Support & Mentorship', r.staffSupportRating ? `${r.staffSupportRating} / 5` : '-'],
            ['Equipment & Tools Availability', r.equipmentRating ? `${r.equipmentRating} / 5` : '-'],
            ['Learning Value & Innovation', r.learningValueRating ? `${r.learningValueRating} / 5` : '-'],
          ],
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: MAROON, textColor: 255, fontStyle: 'bold' },
          columnStyles: {
            0: { fontStyle: 'bold', fillColor: LABEL_BG, cellWidth: 100 },
            1: { fontStyle: 'bold', textColor: MAROON },
          },
          alternateRowStyles: {},
          margin: { left: 10, right: 10 },
        });

        const afterRatings = (pdfDoc as any).lastAutoTable.finalY + 6;

        // Open-text answers
        autoTable(pdfDoc, {
          startY: afterRatings,
          head: [['Question / Field', 'Response']],
          body: [
            ['Objectives of the Visit', r.visitObjectives || '-'],
            ['Understanding of Industrial Workflow', r.workflowUnderstanding || '-'],
            ['Safety Measures Explained', r.safetyMeasures || '-'],
            ['What did you enjoy most about the lab?', r.suggestions || '-'],
            ['Suggestions for Improvement', r.additionalComments || '-'],
          ],
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: MAROON, textColor: 255, fontStyle: 'bold' },
          columnStyles: {
            0: { fontStyle: 'bold', fillColor: LABEL_BG, cellWidth: 80 },
            1: { cellWidth: 'auto' },
          },
          alternateRowStyles: {},
          margin: { left: 10, right: 10 },
        });
      } else {
        // Questionnaire — all questions & answers
        autoTable(pdfDoc, {
          startY: afterPersonal,
          head: [['Q. No.', 'Question', 'Answer']],
          body: [
            ['Q1', 'What did you see in the industry?', r.whatDidYouSee || '-'],
            ['Q2', 'Which 3D printing machines were shown?', r.machinesShown || '-'],
            ['Q3', 'What materials are used for 3D printing?', r.materialsUsed || '-'],
            ['Q4', 'What products are made using 3D printing there?', r.productsMade || '-'],
            ['Q5', 'Did you understand the working of 3D printing?', r.understoodWorking || '-'],
            ['Q6', 'What was the most interesting thing you learned?', r.mostInteresting || '-'],
            ['Q7', 'What problems or difficulties did you observe?', r.problemsObserved || '-'],
            ['Q8', 'Were safety rules explained properly?', r.safetyExplained || '-'],
            ['Q9', 'Would you like to learn more about 3D printing?', r.wouldLearnMore || '-'],
            ['Q10', 'What is your overall experience of the visit?', r.overallExperience || '-'],
          ],
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: MAROON, textColor: 255, fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 12, fontStyle: 'bold', halign: 'center' },
            1: { cellWidth: 75, fontStyle: 'bold', fillColor: LABEL_BG },
            2: { cellWidth: 'auto' },
          },
          alternateRowStyles: {},
          margin: { left: 10, right: 10 },
        });
      }

      // Page footer
      pdfDoc.setFontSize(7);
      pdfDoc.setTextColor(150);
      pdfDoc.setFont('helvetica', 'normal');
      pdfDoc.text(
        `Page ${i + 2} of ${totalPages}  |  Ravindra Sakharpe AICTE Idea Lab, Warananagar`,
        ppw / 2, pph - 6, { align: 'center' }
      );
    });

    pdfDoc.save(`${activeTab}_detailed_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const NavItem = ({ id, label, icon: Icon }: { id: TabType, label: string, icon: any }) => (
    <button 
      className={`admin-nav-item ${activeTab === id ? 'active' : ''}`}
      onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '2rem', position: 'relative' }}>
      
      {/* Mobile Sidebar Toggle */}
      <button 
        className="mobile-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{ 
          position: 'fixed', top: '80px', left: '1rem', zIndex: 100, 
          background: 'var(--gradient-maroon)', color: 'white', border: 'none', 
          borderRadius: '50%', width: '45px', height: '45px', display: 'none', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`admin-sidebar glass-panel ${sidebarOpen ? 'open' : ''}`} style={{ 
        width: '280px', flexShrink: 0, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem',
        height: 'calc(100vh - 120px)', position: 'sticky', top: '100px', overflowY: 'auto'
      }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>

          {/* ── Attendance (accordion) ── */}
          <button
            onClick={() => setAttendanceOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: attendanceOpen ? 'rgba(127,29,29,0.08)' : 'transparent',
              color: attendanceOpen ? '#7F1D1D' : 'var(--text-main)',
              fontWeight: 700, fontSize: '0.95rem', width: '100%', transition: 'all 0.2s'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Database size={20} /> Attendance
            </span>
            <span style={{ fontSize: '0.7rem', transform: attendanceOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
          </button>

          {attendanceOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.75rem', borderLeft: '2px solid #F1F5F9', marginLeft: '1rem' }}>
              <NavItem id="all" label="All Records" icon={Database} />
              <NavItem id="regular" label="Regular Entry" icon={Calendar} />
              <NavItem id="workshop" label="Workshops" icon={Briefcase} />
              <NavItem id="meeting" label="Meetings" icon={UsersIcon} />
            </div>
          )}

          {/* ── Equipment ── */}
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1rem 0 0.35rem', paddingLeft: '1rem' }}>
            Equipment
          </div>
          <NavItem id="printers" label="3D Printers" icon={Printer} />

          {/* ── Forms ── */}
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1rem 0 0.35rem', paddingLeft: '1rem' }}>
            Forms
          </div>
          <NavItem id="feedback" label="Feedback" icon={MessageSquare} />
          <NavItem id="questionnaire" label="Questionnaire" icon={FileQuestion} />
        </nav>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {activeTab === 'printers' ? (
          <div className="glass-panel" style={{ background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 className="page-title" style={{ fontSize: '2rem' }}>
                  3D Printer Usage & Logs
                </h2>
                <p className="page-subtitle" style={{ marginBottom: 0 }}>
                  Monitor live machine usage and browse historical print logs.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="date"
                  value={selectedPrinterDate}
                  onChange={e => setSelectedPrinterDate(e.target.value)}
                  className="form-input"
                  style={{ padding: '0.6rem 1rem', width: 'auto' }}
                />
                {selectedPrinterDate && (
                  <button
                    onClick={() => setSelectedPrinterDate('')}
                    style={{ padding: '0.5rem 0.75rem', background: 'transparent', border: '1px solid #DC2626', borderRadius: '8px', color: '#DC2626', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={exportPrintersPDF}
                  className="btn-primary"
                  disabled={displayPrintersHistory.length === 0}
                  style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                >
                  <Download size={18} />
                  Export PDF
                </button>
              </div>
            </div>

            {/* Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(127,29,29,0.08)', color: '#7F1D1D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Printer size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Total Printers</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{printersList.length}</span>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(249, 115, 22, 0.08)', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Active Sessions</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F97316' }}>
                    {printersList.filter(p => p.status === 'In Use').length}
                  </span>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.08)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Available Machines</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981' }}>
                    {printersList.filter(p => p.status === 'Available').length}
                  </span>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(127,29,29,0.08)', color: '#7F1D1D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Total Print Jobs</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{printersHistory.length}</span>
                </div>
              </div>
            </div>

            {/* Live Status Section */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 1rem 0' }}>Live Printers Status</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
              {printersFetching && printersList.length === 0 ? (
                <div style={{ padding: '2rem', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>Loading printer states...</div>
              ) : printersList.length === 0 ? (
                <div style={{ padding: '2rem', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>No printers configured in Firestore.</div>
              ) : (
                printersList.map((p) => {
                  const isInUse = p.status === 'In Use';
                  return (
                    <div key={p.id} style={{ 
                      background: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem',
                      display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-main)' }}>{p.name}</h4>
                        <span style={{ 
                          fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '8px',
                          background: isInUse ? 'rgba(249, 115, 22, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: isInUse ? '#F97316' : '#10B981', border: `1px solid ${isInUse ? 'rgba(249, 115, 22, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                        }}>
                          {p.status}
                        </span>
                      </div>
                      
                      {isInUse ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', borderTop: '1px dashed #F1F5F9', paddingTop: '0.50rem' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Operator: </span>
                            <strong style={{ color: 'var(--text-main)' }}>{p.currentOperator}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Branch/Class: </span>
                            <span style={{ fontWeight: 600 }}>{p.operatorBranch} ({p.operatorClass})</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Object Name: </span>
                            <span style={{ fontWeight: 700, color: '#7F1D1D' }}>{p.objectName}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Time Slot: </span>
                            <span style={{ fontWeight: 600 }}>{p.timingIn} - {p.timingOut}</span>
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px dashed #F1F5F9', paddingTop: '0.50rem' }}>
                          Machine is available for printing.
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Print Jobs Log Table */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Historical Printing Logs</h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {displayPrintersHistory.length} record{displayPrintersHistory.length !== 1 ? 's' : ''} listed
              </span>
            </div>
            
            <div className="table-container">
              {printersFetching && displayPrintersHistory.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Fetching printer session logs...</div>
              ) : displayPrintersHistory.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {selectedPrinterDate ? `No print logs found for ${selectedPrinterDate}.` : 'No print logs recorded yet.'}
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Sr.</th>
                      <th>Date</th>
                      <th>Printer</th>
                      <th>Operator</th>
                      <th>Branch & Class</th>
                      <th>Object Name</th>
                      <th>Duration</th>
                      <th>Material</th>
                      <th>Time Slot</th>
                      <th>Reason of Working</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayPrintersHistory.map((log, index) => {
                      const printerObj = printersList.find(p => String(p.id) === String(log.printerId));
                      const printerName = printerObj ? printerObj.name : `Printer #${log.printerId}`;
                      const dateStr = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Just now';
                      return (
                        <tr key={log.id}>
                          <td>{index + 1}</td>
                          <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{dateStr}</td>
                          <td style={{ fontWeight: 700, color: '#7F1D1D' }}>{printerName}</td>
                          <td style={{ fontWeight: 700 }}>
                            {log.name}
                            {log.participants && log.participants.length > 0 && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.15rem' }}>
                                Group: {log.participants.join(', ')}
                              </div>
                            )}
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {log.branch} ({log.studentClass})
                          </td>
                          <td style={{ fontWeight: 600 }}>{log.objectName}</td>
                          <td style={{ fontWeight: 600, color: '#7F1D1D' }}>{log.printingDuration}</td>
                          <td>{log.materialConsumption}</td>
                          <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                            <span style={{ background: '#F1F5F9', padding: '0.2rem 0.4rem', borderRadius: '6px' }}>
                              {log.timingIn} - {log.timingOut}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.82rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.useReason}>
                            {log.useReason}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (activeTab === 'feedback' || activeTab === 'questionnaire') ? (
          <div className="glass-panel" style={{ background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 className="page-title" style={{ fontSize: '2rem' }}>
                  {activeTab === 'feedback' ? 'Feedback Responses' : 'Questionnaire Responses'}
                </h2>
                <p className="page-subtitle" style={{ marginBottom: 0 }}>
                  {selectedFormsDate
                    ? <><strong style={{color:'#7F1D1D'}}>{displayForms.length}</strong> of {formsData.length} response{formsData.length !== 1 ? 's' : ''} on <strong style={{color:'#7F1D1D'}}>{selectedFormsDate}</strong></>
                    : <>{formsData.length} total response{formsData.length !== 1 ? 's' : ''}</>}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="date"
                  value={selectedFormsDate}
                  onChange={e => setSelectedFormsDate(e.target.value)}
                  className="form-input"
                  style={{ padding: '0.6rem 1rem', width: 'auto' }}
                />
                {selectedFormsDate && (
                  <button
                    onClick={() => setSelectedFormsDate('')}
                    style={{ padding: '0.5rem 0.75rem', background: 'transparent', border: '1px solid #DC2626', borderRadius: '8px', color: '#DC2626', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={exportFormsPDF}
                  className="btn-primary"
                  disabled={displayForms.length === 0}
                  style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                >
                  <Download size={18} />
                  Export PDF
                </button>
              </div>
            </div>
            <div className="table-container">
              {formsFetching ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Fetching responses...</div>
              ) : displayForms.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {selectedFormsDate ? `No responses found for ${selectedFormsDate}.` : 'No responses yet.'}
                </div>
              ) : activeTab === 'feedback' ? (
                <table className="admin-table">
                  <thead><tr>
                    <th>Sr.</th><th>Name</th><th>Roll No</th><th>Branch</th><th>Year</th>
                    <th>College</th><th>Contact</th><th>Industry</th>
                    <th>Visit Date</th><th>Useful?</th><th>Overall ⭐</th>
                  </tr></thead>
                  <tbody>
                    {displayForms.map((r, i) => (
                      <tr key={r.id}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{r.name || '-'}</td>
                        <td>{r.rollNumber || '-'}</td>
                        <td>{r.branch || '-'}</td>
                        <td>{r.year || '-'}</td>
                        <td>{r.collegeName || '-'}</td>
                        <td>{r.contactNumber || '-'}</td>
                        <td>{r.industryName || '-'}</td>
                        <td>{r.visitDate || '-'}</td>
                        <td>{r.visitUseful || '-'}</td>
                        <td style={{ fontWeight: 700, color: '#DC2626' }}>{r.overallExperience ? `${r.overallExperience}/5` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="admin-table">
                  <thead><tr>
                    <th>Sr.</th><th>Name</th><th>Branch</th><th>Year</th>
                    <th>Roll No</th><th>Contact</th><th>Industry</th>
                    <th>Understood?</th><th>Safety?</th><th>Learn More?</th>
                  </tr></thead>
                  <tbody>
                    {displayForms.map((r, i) => (
                      <tr key={r.id}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{r.studentName || '-'}</td>
                        <td>{r.branch || '-'}</td>
                        <td>{r.year || '-'}</td>
                        <td>{r.rollNumber || '-'}</td>
                        <td>{r.contactNumber || '-'}</td>
                        <td>{r.industryName || '-'}</td>
                        <td>{r.understoodWorking || '-'}</td>
                        <td>{r.safetyExplained || '-'}</td>
                        <td>{r.wouldLearnMore || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ background: 'white' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
              <div>
                <h2 className="page-title" style={{ fontSize: '2rem' }}>
                  {activeTab === 'all' && 'All Records'}
                  {activeTab === 'regular' && 'Regular Attendance'}
                  {activeTab === 'workshop' && 'Workshop Attendance'}
                  {activeTab === 'meeting' && 'Meeting Attendance'}
                </h2>
                <p className="page-subtitle" style={{ marginBottom: 0 }}>View and export attendance logs.</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input"
                  style={{ padding: '0.6rem 1rem', width: 'auto' }}
                />
                {selectedDate && (
                  <button 
                    onClick={() => setSelectedDate('')}
                    style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Clear
                  </button>
                )}
                <button 
                  onClick={exportPDF}
                  className="btn-primary" 
                  style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                  disabled={displayRecords.length === 0}
                >
                  <Download size={18} />
                  Export PDF
                </button>
              </div>
            </div>

            {/* Data Table */}
            <div className="table-container">
              {fetching && displayRecords.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Fetching records from the database...
                </div>
              ) : displayRecords.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>
                  No records found for the selected view.
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Roll No</th>
                      <th>Mobile</th>
                      <th>Work On</th>
                      <th>Time In</th>
                      <th>Time Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayRecords.map((record, index) => (
                      <tr key={record.id}>
                        <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{record.name}</td>
                        <td>{record.studentClass}</td>
                        <td>{record.rollNo}</td>
                        <td>{record.mobileNo}</td>
                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={record.wantToWorkOn}>
                          {record.wantToWorkOn}
                        </td>
                        <td style={{ fontWeight: 600, color: '#047857' }}>{record.timingIn}</td>
                        <td style={{ fontWeight: 600, color: '#B91C1C' }}>{record.timingOut}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          width: 100%;
        }

        .admin-nav-item:hover {
          background: rgba(220, 38, 38, 0.05);
          color: #DC2626;
        }

        .admin-nav-item.active {
          background: var(--gradient-red);
          color: white;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
        }

        @media (max-width: 900px) {
          .mobile-sidebar-toggle {
            display: flex !important;
          }
          .admin-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: -320px;
            height: 100vh !important;
            z-index: 99;
            transition: left 0.3s ease;
            box-shadow: var(--shadow-xl);
          }
          .admin-sidebar.open {
            left: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
