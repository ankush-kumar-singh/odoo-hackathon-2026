import React, { useState, useMemo } from 'react';
import { MaintenanceLog, Vehicle } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, Plus, CheckCircle, X, Wrench, 
  Settings, CheckSquare, Calendar, DollarSign 
} from 'lucide-react';

interface MaintenanceProps {
  maintenanceLogs: MaintenanceLog[];
  vehicles: Vehicle[];
  onAddMaintenance: (m: Omit<MaintenanceLog, 'id' | 'startDate' | 'status'>) => void;
  onCompleteMaintenance: (maintId: string) => void;
  role: string;
}

export default function Maintenance({
  maintenanceLogs,
  vehicles,
  onAddMaintenance,
  onCompleteMaintenance,
  role
}: MaintenanceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Form states
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');

  const isAllowed = role === 'Fleet Manager';

  // Vehicles that are not retired can go into maintenance
  const maintenanceEligibleVehicles = useMemo(() => {
    return vehicles.filter(v => v.status !== 'Retired');
  }, [vehicles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedVehicleId || !description.trim() || !cost) {
      setErrorMsg('All fields are required.');
      return;
    }

    const parsedCost = parseFloat(cost);
    if (isNaN(parsedCost) || parsedCost < 0) {
      setErrorMsg('Maintenance cost must be a positive number.');
      return;
    }

    onAddMaintenance({
      vehicleId: selectedVehicleId,
      description: description.trim(),
      cost: parsedCost
    });

    // Reset Form
    setSelectedVehicleId('');
    setDescription('');
    setCost('');
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display tracking-tight">
            <Wrench className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]" />
            Maintenance Logbook
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-wider">
            File repair logs. Adding a vehicle to active maintenance instantly labels it 'In Shop', removing it from dispatch eligibility.
          </p>
        </div>

        {isAllowed ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOpen(!isOpen)}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            {isOpen ? <X className="h-4 w-4 stroke-[3px]" /> : <Plus className="h-4 w-4 stroke-[3px]" />}
            {isOpen ? 'CLOSE REPAIR ENTRY' : 'LOG MAINTENANCE'}
          </motion.button>
        ) : (
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-xl text-[11px] font-mono max-w-max uppercase">
            <AlertTriangle className="h-4 w-4" />
            <span>Viewer Mode: Role of <strong>{role}</strong> is read-only for maintenance.</span>
          </div>
        )}
      </div>

      {/* Entry Form */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <h3 className="text-sm font-bold text-white font-display uppercase tracking-tight">Record New Repair Action</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                {/* Vehicle Choice */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Select Vehicle</label>
                  <select
                    value={selectedVehicleId}
                    required
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full bg-slate-900/60 text-slate-300 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                  >
                    <option value="">-- Choose Vehicle --</option>
                    {maintenanceEligibleVehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.registrationNumber}) - Status: {v.status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-1">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Description / Repair Reason</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brakepad replacement, Oil tuning"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Estimated Cost (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="e.g. 500"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg uppercase tracking-wider font-bold font-mono">
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-semibold font-mono text-slate-500 hover:text-slate-300 cursor-pointer uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                >
                  SCHEDULE AND SEND TO SHOP
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log list */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5">
        <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider font-display mb-4">Repair History & Status</h3>

        <div className="space-y-3">
          {maintenanceLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs font-mono uppercase border border-slate-800/50 rounded-2xl bg-slate-950/20">
              No maintenance logs registered.
            </div>
          ) : (
            [...maintenanceLogs].reverse().map((log) => {
              const vehicle = vehicles.find(v => v.id === log.vehicleId);

              return (
                <div
                  key={log.id}
                  className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-cyan-500/20 transition-all shadow-md group"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-slate-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/15">
                        {log.id}
                      </span>
                      <strong className="text-white text-xs font-display">
                        {vehicle ? `${vehicle.name} (${vehicle.registrationNumber})` : 'Deleted Vehicle'}
                      </strong>
                      <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                        log.status === 'Active' 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                      }`}>
                        {log.status === 'Active' ? 'In Repair Shop' : 'Completed'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-semibold">{log.description}</p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-cyan-500" />
                        Started: {log.startDate}
                      </span>
                      {log.endDate && (
                        <span className="flex items-center gap-1">
                          <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
                          Resolved: {log.endDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 sm:border-l sm:border-slate-800/80 sm:pl-4 justify-between sm:justify-start font-mono">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Total Cost</span>
                      <strong className="text-white text-xs font-bold font-mono">${log.cost.toLocaleString()}</strong>
                    </div>

                    {log.status === 'Active' && isAllowed ? (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onCompleteMaintenance(log.id)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Close Log</span>
                      </motion.button>
                    ) : log.status === 'Active' ? (
                      <span className="text-[10px] text-slate-500 font-semibold italic uppercase tracking-wider">Read-only</span>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
