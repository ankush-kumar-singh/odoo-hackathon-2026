import React, { useState, useMemo } from 'react';
import { Vehicle, FuelLog, ExpenseLog, MaintenanceLog } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Fuel, DollarSign, Plus, X, ListCollapse, Calculator, 
  AlertTriangle, CheckCircle, Table, Landmark, HelpCircle 
} from 'lucide-react';

interface ExpensesProps {
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  expenseLogs: ExpenseLog[];
  maintenanceLogs: MaintenanceLog[];
  onAddFuelLog: (f: Omit<FuelLog, 'id'>) => void;
  onAddExpenseLog: (e: Omit<ExpenseLog, 'id'>) => void;
  role: string;
}

export default function Expenses({
  vehicles,
  fuelLogs,
  expenseLogs,
  maintenanceLogs,
  onAddFuelLog,
  onAddExpenseLog,
  role
}: ExpensesProps) {
  const [activeTab, setActiveTab] = useState<'calculator' | 'fuel' | 'expenses'>('calculator');
  const [isFuelFormOpen, setIsFuelFormOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);

  // Form states - Fuel
  const [fuelVehicleId, setFuelVehicleId] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [fuelDate, setFuelDate] = useState('2026-07-12');

  // Form states - Expenses
  const [expVehicleId, setExpVehicleId] = useState('');
  const [expType, setExpType] = useState<'Toll' | 'Permit' | 'Insurance' | 'Other'>('Toll');
  const [expCost, setExpCost] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expDate, setExpDate] = useState('2026-07-12');

  const [errorMsg, setErrorMsg] = useState('');

  const isAllowedToLog = role === 'Fleet Manager' || role === 'Financial Analyst' || role === 'Driver';

  // Compute Total Operational Cost per vehicle
  const vehicleCostSummaries = useMemo(() => {
    return vehicles.map(vehicle => {
      // 1. Fuel cost
      const fuelTotal = fuelLogs
        .filter(f => f.vehicleId === vehicle.id)
        .reduce((sum, f) => sum + f.cost, 0);

      // 2. Maintenance cost
      const maintenanceTotal = maintenanceLogs
        .filter(m => m.vehicleId === vehicle.id)
        .reduce((sum, m) => sum + m.cost, 0);

      // 3. Other expense logs
      const otherTotal = expenseLogs
        .filter(e => e.vehicleId === vehicle.id)
        .reduce((sum, e) => sum + e.cost, 0);

      const totalOpCost = fuelTotal + maintenanceTotal + otherTotal;

      return {
        id: vehicle.id,
        name: vehicle.name,
        regNum: vehicle.registrationNumber,
        fuelTotal,
        maintenanceTotal,
        otherTotal,
        totalOpCost
      };
    });
  }, [vehicles, fuelLogs, expenseLogs, maintenanceLogs]);

  const handleFuelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fuelVehicleId || !fuelLiters || !fuelCost || !fuelDate) {
      setErrorMsg('All fields are required.');
      return;
    }

    const litersVal = parseFloat(fuelLiters);
    const costVal = parseFloat(fuelCost);

    if (isNaN(litersVal) || litersVal <= 0 || isNaN(costVal) || costVal < 0) {
      setErrorMsg('Please enter positive values for liters and cost.');
      return;
    }

    onAddFuelLog({
      vehicleId: fuelVehicleId,
      liters: litersVal,
      cost: costVal,
      date: fuelDate
    });

    setFuelVehicleId('');
    setFuelLiters('');
    setFuelCost('');
    setIsFuelFormOpen(false);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!expVehicleId || !expCost || !expDesc.trim() || !expDate) {
      setErrorMsg('All fields are required.');
      return;
    }

    const costVal = parseFloat(expCost);
    if (isNaN(costVal) || costVal < 0) {
      setErrorMsg('Expense cost must be a positive number.');
      return;
    }

    onAddExpenseLog({
      vehicleId: expVehicleId,
      type: expType,
      cost: costVal,
      description: expDesc.trim(),
      date: expDate
    });

    setExpVehicleId('');
    setExpCost('');
    setExpDesc('');
    setIsExpenseFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display tracking-tight">
            <Fuel className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]" />
            Fuel & Expense Management
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-wider">
            Log fuel usage, highway tolls, and insurance bills. Real-time cost equations compute automatically per vehicle.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl gap-1">
          {[
            { id: 'calculator', label: 'OPERATIONAL COSTS', icon: Calculator },
            { id: 'fuel', label: 'FUEL LOGS', icon: Fuel },
            { id: 'expenses', label: 'TOLLS & MISC', icon: Landmark }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider cursor-pointer transition-all ${
                activeTab === tab.id 
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.25)]' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View 1: OPERATIONAL COSTS CALCULATOR */}
      {activeTab === 'calculator' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider font-display flex items-center gap-1.5">
                <Table className="h-4 w-4 text-cyan-400" />
                Computed Total Operational Costs (per vehicle)
              </h3>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mt-0.5">Equation: Fuel Costs + Maintenance Costs + Other Expenses</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-500 text-[9px] font-bold uppercase tracking-wider font-mono">
                  <th className="py-3 px-4 font-semibold">Vehicle</th>
                  <th className="py-3 px-4 font-semibold">Registration</th>
                  <th className="py-3 px-4 font-semibold text-right">Fuel Costs</th>
                  <th className="py-3 px-4 font-semibold text-right">Maintenance Costs</th>
                  <th className="py-3 px-4 font-semibold text-right">Misc. Expenses</th>
                  <th className="py-3 px-4 font-semibold text-right bg-cyan-500/5 text-cyan-400 border-l border-slate-800/60">Total Operational Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300 font-mono">
                {vehicleCostSummaries.map((summary) => (
                  <tr key={summary.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-white font-display text-xs">{summary.name}</td>
                    <td className="py-3 px-4 text-slate-400">{summary.regNum}</td>
                    <td className="py-3 px-4 text-right text-slate-300">${summary.fuelTotal.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-slate-300">${summary.maintenanceTotal.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-slate-300">${summary.otherTotal.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-extrabold bg-cyan-500/5 text-cyan-400 border-l border-slate-800/60 font-mono">
                      ${summary.totalOpCost.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* View 2: FUEL LOGS */}
      {activeTab === 'fuel' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {isAllowedToLog && (
            <div className="flex justify-between items-center bg-slate-900/40 px-5 py-3 rounded-xl border border-slate-800/60">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Record refuel receipt.</span>
              <button
                onClick={() => setIsFuelFormOpen(!isFuelFormOpen)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center gap-1.5"
              >
                {isFuelFormOpen ? <X className="h-3.5 w-3.5 stroke-[3px]" /> : <Plus className="h-3.5 w-3.5 stroke-[3px]" />}
                {isFuelFormOpen ? 'CLOSE PANEL' : 'LOG REFUELING'}
              </button>
            </div>
          )}

          <AnimatePresence>
            {isFuelFormOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <form onSubmit={handleFuelSubmit} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden grid grid-cols-1 md:grid-cols-4 gap-4 shadow-xl">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="relative z-10 font-mono">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Vehicle</label>
                    <select
                      value={fuelVehicleId}
                      required
                      onChange={(e) => setFuelVehicleId(e.target.value)}
                      className="w-full bg-slate-900/60 text-slate-300 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                    >
                      <option value="">-- Select --</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.registrationNumber})</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative z-10 font-mono">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Fuel Added (Liters)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 50"
                      value={fuelLiters}
                      onChange={(e) => setFuelLiters(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div className="relative z-10 font-mono">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Total Cost (USD)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 75"
                      value={fuelCost}
                      onChange={(e) => setFuelCost(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div className="flex items-end gap-2 relative z-10 font-mono">
                    <button
                      type="submit"
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono py-2.5 rounded-lg transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)] uppercase tracking-wider"
                    >
                      Log Receipt
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List Fuel Logs */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5">
            <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider font-display mb-4">Historical Fueling logs</h3>
            <div className="space-y-3">
              {fuelLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono uppercase border border-slate-800/50 rounded-2xl bg-slate-950/20">No fuel records registered.</div>
              ) : (
                [...fuelLogs].reverse().map((log) => {
                  const vehicleObj = vehicles.find(v => v.id === log.vehicleId);
                  return (
                    <div key={log.id} className="bg-slate-900/40 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between text-xs hover:border-cyan-500/20 transition-all shadow-md">
                      <div>
                        <strong className="text-white font-display block">
                          {vehicleObj ? `${vehicleObj.name} (${vehicleObj.registrationNumber})` : 'Deleted Vehicle'}
                        </strong>
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mt-0.5">Logged Date: {log.date}</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-slate-300 font-semibold">{log.liters} Liters</span>
                        <strong className="text-cyan-400 font-bold block mt-0.5">${log.cost} USD</strong>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* View 3: TOLLS & MISC EXPENSES */}
      {activeTab === 'expenses' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {isAllowedToLog && (
            <div className="flex justify-between items-center bg-slate-900/40 px-5 py-3 rounded-xl border border-slate-800/60">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Record receipts like road tolls, travel permits or other cargo fees.</span>
              <button
                onClick={() => setIsExpenseFormOpen(!isExpenseFormOpen)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center gap-1.5"
              >
                {isExpenseFormOpen ? <X className="h-3.5 w-3.5 stroke-[3px]" /> : <Plus className="h-3.5 w-3.5 stroke-[3px]" />}
                {isExpenseFormOpen ? 'CLOSE PANEL' : 'LOG EXPENSE'}
              </button>
            </div>
          )}

          <AnimatePresence>
            {isExpenseFormOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <form onSubmit={handleExpenseSubmit} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono relative z-10">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Vehicle</label>
                      <select
                        value={expVehicleId}
                        required
                        onChange={(e) => setExpVehicleId(e.target.value)}
                        className="w-full bg-slate-900/60 text-slate-300 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                      >
                        <option value="">-- Select --</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>{v.name} ({v.registrationNumber})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Expense Type</label>
                      <select
                        value={expType}
                        onChange={(e) => setExpType(e.target.value as any)}
                        className="w-full bg-slate-900/60 text-slate-300 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                      >
                        <option value="Toll">Toll</option>
                        <option value="Permit">Permit</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Total Cost (USD)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 50"
                        value={expCost}
                        onChange={(e) => setExpCost(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Description / Notes</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Toll booth pass"
                        value={expDesc}
                        onChange={(e) => setExpDesc(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-800/60 relative z-10 font-mono">
                    <button
                      type="submit"
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all cursor-pointer uppercase tracking-wider"
                    >
                      Save Expense Log
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List Expenses */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5">
            <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider font-display mb-4">Historical miscellaneous receipts</h3>
            <div className="space-y-3">
              {expenseLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono uppercase border border-slate-800/50 rounded-2xl bg-slate-950/20">No expense records registered.</div>
              ) : (
                [...expenseLogs].reverse().map((log) => {
                  const vehicleObj = vehicles.find(v => v.id === log.vehicleId);
                  return (
                    <div key={log.id} className="bg-slate-900/40 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between text-xs hover:border-cyan-500/20 transition-all shadow-md">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-white font-display">
                            {vehicleObj ? `${vehicleObj.name} (${vehicleObj.registrationNumber})` : 'Deleted Vehicle'}
                          </strong>
                          <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-slate-950 text-cyan-400 font-bold border border-cyan-500/15 font-mono">
                            {log.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 font-semibold">{log.description}</p>
                        <span className="text-[10px] text-slate-500 block mt-0.5 font-mono uppercase tracking-wider">Logged Date: {log.date}</span>
                      </div>
                      <div className="text-right shrink-0 font-mono">
                        <strong className="text-cyan-400 font-bold text-sm">${log.cost}</strong>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
