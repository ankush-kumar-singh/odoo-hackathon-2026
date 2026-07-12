import React, { useState, useMemo } from 'react';
import { Driver, DriverStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Plus, Search, Edit2, Trash2, X, AlertTriangle, 
  Mail, Phone, ShieldCheck, Heart, User, Sparkles, CheckCircle, Clock
} from 'lucide-react';

interface DriversProps {
  drivers: Driver[];
  onAddDriver: (d: Omit<Driver, 'id'>) => boolean;
  onUpdateDriver: (d: Driver) => boolean;
  onDeleteDriver: (id: string) => void;
  role: string;
}

export default function Drivers({
  drivers,
  onAddDriver,
  onUpdateDriver,
  onDeleteDriver,
  role
}: DriversProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Email reminders mock state
  const [sentReminders, setSentReminders] = useState<Record<string, boolean>>({});

  // Form states
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [safetyScore, setSafetyScore] = useState('');
  const [status, setStatus] = useState<DriverStatus>('Available');

  const isAllowedToEdit = role === 'Fleet Manager' || role === 'Safety Officer';

  const openCreateModal = () => {
    if (!isAllowedToEdit) return;
    setEditingDriver(null);
    setName('');
    setLicenseNumber('');
    setLicenseCategory('Standard (Class C)');
    setLicenseExpiryDate('');
    setContactNumber('');
    setSafetyScore('100');
    setStatus('Available');
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (driver: Driver) => {
    if (!isAllowedToEdit) return;
    setEditingDriver(driver);
    setName(driver.name);
    setLicenseNumber(driver.licenseNumber);
    setLicenseCategory(driver.licenseCategory);
    setLicenseExpiryDate(driver.licenseExpiryDate);
    setContactNumber(driver.contactNumber);
    setSafetyScore(driver.safetyScore.toString());
    setStatus(driver.status);
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !licenseNumber.trim() || !licenseCategory.trim() || !licenseExpiryDate || !contactNumber.trim() || !safetyScore) {
      setErrorMsg('All fields are required.');
      return;
    }

    const parsedScore = parseInt(safetyScore, 10);
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
      setErrorMsg('Safety score must be an integer between 0 and 100.');
      return;
    }

    const targetData = {
      name: name.trim(),
      licenseNumber: licenseNumber.trim(),
      licenseCategory: licenseCategory.trim(),
      licenseExpiryDate,
      contactNumber: contactNumber.trim(),
      safetyScore: parsedScore,
      status
    };

    if (editingDriver) {
      onUpdateDriver({ ...targetData, id: editingDriver.id });
      setSuccessMsg('Driver profile updated successfully!');
      setTimeout(() => setIsModalOpen(false), 800);
    } else {
      onAddDriver(targetData);
      setSuccessMsg('Driver profile registered successfully!');
      setTimeout(() => setIsModalOpen(false), 800);
    }
  };

  // Mock sending email reminder
  const sendEmailReminder = (driver: Driver) => {
    setSentReminders(prev => ({ ...prev, [driver.id]: true }));
    setTimeout(() => {
      // Clear or leave as sent
    }, 5000);
  };

  // Filter and processed drivers
  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            d.contactNumber.includes(searchQuery);
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchQuery, statusFilter]);

  // Check if license is expired or near expiry (within 60 days)
  const getLicenseUrgency = (expiryDateStr: string) => {
    const today = new Date('2026-07-12'); // Current mock date
    const expiryDate = new Date(expiryDateStr);
    
    if (isNaN(expiryDate.getTime())) return 'valid';
    
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'expired';
    if (diffDays <= 60) return 'critical';
    return 'valid';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display tracking-tight">
            <Users className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]" />
            Driver Management Profiles
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-wider">
            Maintain driver registration, licensing validation, and driver safety scoring.
          </p>
        </div>

        {isAllowedToEdit ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreateModal}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            REGISTER DRIVER
          </motion.button>
        ) : (
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-xl text-[11px] font-mono max-w-max">
            <AlertTriangle className="h-4 w-4" />
            <span>VIEWER MODE: ROLE OF <strong>{role}</strong> IS READ-ONLY FOR DRIVER EDITING.</span>
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, license number, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/40 border border-slate-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono transition-all"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900/40 text-slate-300 border border-slate-800/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono cursor-pointer"
          >
            <option value="All">All Driver Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Off Duty">Off Duty</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Drivers Bento/Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence initial={false}>
          {filteredDrivers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs font-mono uppercase bg-slate-950/40 border border-slate-800/80 rounded-2xl">
              NO DRIVER CORE RECORDS MATCHING FILTER CRITERIA.
            </div>
          ) : (
            filteredDrivers.map((driver) => {
              const licenseUrgency = getLicenseUrgency(driver.licenseExpiryDate);
              const isExpired = licenseUrgency === 'expired';
              const isCritical = licenseUrgency === 'critical';

              // Safety score color
              const safetyColor = driver.safetyScore >= 90 
                ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                : driver.safetyScore >= 75 
                ? 'text-amber-400 border-amber-500/20 bg-amber-500/5 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
                : 'text-rose-400 border-rose-500/20 bg-rose-500/5 shadow-[0_0_10px_rgba(244,63,94,0.1)]';

              // Status styles
              const statusStyles = {
                Available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
                'On Trip': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]',
                'Off Duty': 'bg-slate-800/50 text-slate-400 border-slate-800',
                Suspended: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.15)]',
              };

              return (
                <motion.div
                  key={driver.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/30 rounded-2xl p-5 flex flex-col justify-between transition-all relative overflow-hidden group shadow-lg"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 group-hover:border-cyan-500/20 transition-colors">
                          <User className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-xs sm:text-sm font-display tracking-tight group-hover:text-cyan-400 transition-colors">{driver.name}</h3>
                          <span className={`inline-block px-2 py-0.5 mt-1 border rounded-full text-[9px] font-bold uppercase font-mono tracking-wider ${statusStyles[driver.status]}`}>
                            {driver.status}
                          </span>
                        </div>
                      </div>

                      {/* Safety score donut badge */}
                      <div className={`p-2 border rounded-xl flex flex-col items-center ${safetyColor} min-w-[54px]`}>
                        <span className="text-xs font-bold font-mono">{driver.safetyScore}</span>
                        <span className="text-[7px] font-bold uppercase tracking-widest text-slate-500 mt-0.5 font-mono">Safety</span>
                      </div>
                    </div>

                    {/* Details list */}
                    <div className="space-y-2.5 mt-4 border-t border-slate-800/60 pt-4 text-xs text-slate-300 font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[9px] uppercase tracking-wider font-semibold">License Num</span>
                        <span className="text-slate-300">{driver.licenseNumber}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[9px] uppercase tracking-wider font-semibold">Category</span>
                        <span className="text-slate-300 truncate max-w-[150px]" title={driver.licenseCategory}>{driver.licenseCategory}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[9px] uppercase tracking-wider font-semibold">Contact</span>
                        <span className="text-slate-300 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-cyan-400" />
                          {driver.contactNumber}
                        </span>
                      </div>

                      {/* License Expiry Indicator */}
                      <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-800/60">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 text-[9px] uppercase tracking-wider font-semibold">License Expiry</span>
                          <span className={`font-mono text-[10px] font-bold ${
                            isExpired ? 'text-rose-400' : isCritical ? 'text-amber-400' : 'text-slate-300'
                          }`}>
                            {driver.licenseExpiryDate}
                          </span>
                        </div>

                        {/* Urgency warning banner */}
                        {isExpired && (
                          <div className="flex items-center gap-1.5 p-1.5 bg-rose-500/10 border border-rose-500/20 text-[9px] uppercase font-bold text-rose-400 rounded-md mt-1 shadow-[0_0_8px_rgba(239,68,68,0.1)]">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            <span>Expired License! Driving forbidden.</span>
                          </div>
                        )}

                        {isCritical && (
                          <div className="flex items-center gap-1.5 p-1.5 bg-amber-500/10 border border-amber-500/20 text-[9px] uppercase font-bold text-amber-400 rounded-md mt-1 shadow-[0_0_8px_rgba(245,158,11,0.1)]">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span>Expiring soon (within 60 days).</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-slate-800/40 font-mono">
                    <div>
                      {/* Send Email Reminder Trigger */}
                      {(isExpired || isCritical) && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => sendEmailReminder(driver)}
                          disabled={sentReminders[driver.id]}
                          className={`flex items-center gap-1 text-[9px] font-bold uppercase px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            sentReminders[driver.id]
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.05)]'
                          }`}
                        >
                          {sentReminders[driver.id] ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              <span>Reminder Sent!</span>
                            </>
                          ) : (
                            <>
                              <Mail className="h-3 w-3" />
                              <span>Send Alert</span>
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {isAllowedToEdit ? (
                        <>
                          <button
                            onClick={() => openEditModal(driver)}
                            className="p-1.5 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/40 transition-colors cursor-pointer"
                            title="Edit Driver"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteDriver(driver.id)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-slate-800/40 transition-colors cursor-pointer"
                            title="Delete Driver"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium italic">Read-only</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Driver Registration/Editing Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 overflow-hidden"
            >
              {/* Ambient Flare */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-sm font-bold text-white font-display tracking-tight">
                  {editingDriver ? 'EDIT DRIVER PROFILE' : 'REGISTER NEW FLEET DRIVER'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 relative z-10 font-mono">
                {/* Name */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Driver's Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Mercer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* License Number */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">License Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DL-773829"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                    />
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Contact Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +1 (555) 234-5678"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                    />
                  </div>

                  {/* License Category */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">License Category</label>
                    <select
                      value={licenseCategory}
                      onChange={(e) => setLicenseCategory(e.target.value)}
                      className="w-full bg-slate-900/60 text-slate-300 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                    >
                      <option value="Heavy Commercial (Class A)">Heavy Commercial (Class A)</option>
                      <option value="Commercial (Class B)">Commercial (Class B)</option>
                      <option value="Standard (Class C)">Standard (Class C)</option>
                    </select>
                  </div>

                  {/* License Expiry */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">License Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={licenseExpiryDate}
                      onChange={(e) => setLicenseExpiryDate(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                    />
                  </div>

                  {/* Safety Score */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Safety Score (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      placeholder="e.g. 95"
                      value={safetyScore}
                      onChange={(e) => setSafetyScore(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Status</label>
                    <select
                      value={status}
                      disabled={editingDriver?.status === 'On Trip'}
                      onChange={(e) => setStatus(e.target.value as DriverStatus)}
                      className="w-full bg-slate-900/60 text-slate-300 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono disabled:opacity-50"
                    >
                      <option value="Available">Available</option>
                      <option value="On Trip">On Trip</option>
                      <option value="Off Duty">Off Duty</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                    {editingDriver?.status === 'On Trip' && (
                      <p className="text-[9px] text-amber-500 mt-1 uppercase tracking-wider">Locked: Driver is currently driving.</p>
                    )}
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-1.5 p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg uppercase tracking-wider font-mono">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="flex items-center gap-1.5 p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg uppercase tracking-wider font-mono">
                    <CheckCircle className="h-4 w-4" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                  >
                    SAVE PROFILE
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
