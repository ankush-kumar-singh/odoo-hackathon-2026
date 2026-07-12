import React, { useState, useMemo } from 'react';
import { Vehicle, VehicleType, VehicleStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Edit2, Trash2, X, AlertTriangle, 
  Settings, Layers, Compass, Check, CheckCircle, ShieldAlert 
} from 'lucide-react';

interface VehiclesProps {
  vehicles: Vehicle[];
  onAddVehicle: (v: Omit<Vehicle, 'id'>) => boolean; // returns success
  onUpdateVehicle: (v: Vehicle) => boolean; // returns success
  onDeleteVehicle: (id: string) => void;
  role: string;
}

export default function Vehicles({
  vehicles,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  role
}: VehiclesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof Vehicle>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [regNum, setRegNum] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<VehicleType>('Truck');
  const [maxLoadCapacity, setMaxLoadCapacity] = useState('');
  const [odometer, setOdometer] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [status, setStatus] = useState<VehicleStatus>('Available');
  const [region, setRegion] = useState('');

  const isAllowedToEdit = role === 'Fleet Manager';

  // Handle open modal for create
  const openCreateModal = () => {
    if (!isAllowedToEdit) return;
    setEditingVehicle(null);
    setRegNum('');
    setName('');
    setType('Truck');
    setMaxLoadCapacity('');
    setOdometer('');
    setAcquisitionCost('');
    setStatus('Available');
    setRegion('North');
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  // Handle open modal for edit
  const openEditModal = (vehicle: Vehicle) => {
    if (!isAllowedToEdit) return;
    setEditingVehicle(vehicle);
    setRegNum(vehicle.registrationNumber);
    setName(vehicle.name);
    setType(vehicle.type);
    setMaxLoadCapacity(vehicle.maxLoadCapacity.toString());
    setOdometer(vehicle.odometer.toString());
    setAcquisitionCost(vehicle.acquisitionCost.toString());
    setStatus(vehicle.status);
    setRegion(vehicle.region);
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!regNum.trim() || !name.trim() || !maxLoadCapacity || !odometer || !acquisitionCost || !region.trim()) {
      setErrorMsg('All fields are required.');
      return;
    }

    const parsedCapacity = parseFloat(maxLoadCapacity);
    const parsedOdometer = parseFloat(odometer);
    const parsedCost = parseFloat(acquisitionCost);

    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      setErrorMsg('Load capacity must be a positive number.');
      return;
    }
    if (isNaN(parsedOdometer) || parsedOdometer < 0) {
      setErrorMsg('Odometer cannot be negative.');
      return;
    }
    if (isNaN(parsedCost) || parsedCost < 0) {
      setErrorMsg('Acquisition cost cannot be negative.');
      return;
    }

    const targetData = {
      registrationNumber: regNum.trim(),
      name: name.trim(),
      type,
      maxLoadCapacity: parsedCapacity,
      odometer: parsedOdometer,
      acquisitionCost: parsedCost,
      status,
      region: region.trim()
    };

    if (editingVehicle) {
      // Update
      const success = onUpdateVehicle({ ...targetData, id: editingVehicle.id });
      if (success) {
        setSuccessMsg('Vehicle updated successfully!');
        setTimeout(() => setIsModalOpen(false), 800);
      } else {
        setErrorMsg('Registration number already exists. It must be unique.');
      }
    } else {
      // Add
      const success = onAddVehicle(targetData);
      if (success) {
        setSuccessMsg('Vehicle added successfully!');
        setTimeout(() => setIsModalOpen(false), 800);
      } else {
        setErrorMsg('Registration number already exists. It must be unique.');
      }
    }
  };

  // Sorting logic
  const handleSort = (field: keyof Vehicle) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered and sorted vehicles
  const processedVehicles = useMemo(() => {
    return vehicles
      .filter(v => {
        const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              v.region.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'All' || v.type === typeFilter;
        const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        let valueA = a[sortField];
        let valueB = b[sortField];

        if (typeof valueA === 'string') {
          valueA = valueA.toLowerCase();
          valueB = (valueB as string).toLowerCase();
        }

        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [vehicles, searchQuery, typeFilter, statusFilter, sortField, sortDirection]);

  return (
    <div className="space-y-6">
      {/* Title & Action Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display tracking-tight">
            <Layers className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]" />
            Vehicle Registry
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-wider">
            Manage your fleet of vehicles. Registration numbers must be completely unique.
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
            ADD NEW VEHICLE
          </motion.button>
        ) : (
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-xl text-[11px] font-mono max-w-max">
            <ShieldAlert className="h-4 w-4" />
            <span>VIEWER MODE: ROLE OF <strong>{role}</strong> IS READ-ONLY.</span>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, registration, or region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/40 border border-slate-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-mono"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-900/40 text-slate-300 border border-slate-800/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Truck">Trucks</option>
            <option value="Van">Vans</option>
            <option value="Sedan">Sedans</option>
            <option value="Reefer">Reefers</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900/40 text-slate-300 border border-slate-800/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
      </div>

      {/* Vehicle Grid & Cards */}
      <div className="overflow-hidden bg-slate-950/40 border border-slate-800/80 rounded-2xl shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-500 text-[9px] uppercase tracking-wider font-mono">
                <th className="py-3 px-4 font-semibold cursor-pointer select-none" onClick={() => handleSort('name')}>
                  Name / Model {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-3 px-4 font-semibold cursor-pointer select-none" onClick={() => handleSort('registrationNumber')}>
                  Registration {sortField === 'registrationNumber' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-3 px-4 font-semibold cursor-pointer select-none" onClick={() => handleSort('type')}>
                  Type {sortField === 'type' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-3 px-4 font-semibold cursor-pointer select-none text-right" onClick={() => handleSort('maxLoadCapacity')}>
                  Max Capacity {sortField === 'maxLoadCapacity' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-3 px-4 font-semibold cursor-pointer select-none text-right" onClick={() => handleSort('odometer')}>
                  Odometer {sortField === 'odometer' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-3 px-4 font-semibold cursor-pointer select-none text-right" onClick={() => handleSort('acquisitionCost')}>
                  Acq. Cost {sortField === 'acquisitionCost' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-3 px-4 font-semibold cursor-pointer select-none" onClick={() => handleSort('region')}>
                  Region {sortField === 'region' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-3 px-4 font-semibold cursor-pointer select-none" onClick={() => handleSort('status')}>
                  Status {sortField === 'status' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs font-mono">
              <AnimatePresence initial={false}>
                {processedVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500 font-medium">
                      No vehicles found matching criteria.
                    </td>
                  </tr>
                ) : (
                  processedVehicles.map((vehicle) => {
                    const statusStyles = {
                      Available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
                      'On Trip': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]',
                      'In Shop': 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
                      Retired: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.15)]',
                    };

                    return (
                      <motion.tr
                        key={vehicle.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-900/20 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-200">
                          {vehicle.name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 font-medium">
                          {vehicle.registrationNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {vehicle.type}
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-300">
                          {vehicle.maxLoadCapacity.toLocaleString()} kg
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-300 font-mono">
                          {vehicle.odometer.toLocaleString()} km
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-300">
                          ${vehicle.acquisitionCost.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {vehicle.region}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-bold tracking-wide uppercase ${statusStyles[vehicle.status]}`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {isAllowedToEdit ? (
                              <>
                                <button
                                  onClick={() => openEditModal(vehicle)}
                                  className="p-1.5 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/40 transition-colors cursor-pointer"
                                  title="Edit Vehicle"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteVehicle(vehicle.id)}
                                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-slate-800/40 transition-colors cursor-pointer"
                                  title="Delete Vehicle"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-medium font-mono uppercase">Read Only</span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
         {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             {/* Backdrop */}
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
             />

             {/* Modal Body */}
             <motion.div
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 overflow-hidden"
             >
               {/* Ambient Flare */}
               <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

               <div className="flex justify-between items-center mb-6 relative z-10">
                 <h3 className="text-sm font-bold text-white font-display tracking-tight">
                   {editingVehicle ? 'EDIT VEHICLE CORE PROFILE' : 'ADD NEW VEHICLE CORE'}
                 </h3>
                 <button
                   onClick={() => setIsModalOpen(false)}
                   className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
                 >
                   <X className="h-4 w-4" />
                 </button>
               </div>

               <form onSubmit={handleSave} className="space-y-4 relative z-10 font-mono">
                 <div className="grid grid-cols-2 gap-4">
                   {/* Reg Number */}
                   <div className="col-span-2 sm:col-span-1">
                     <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Registration Number (Unique)</label>
                     <input
                       type="text"
                       required
                       placeholder="e.g. TRK-8829"
                       value={regNum}
                       onChange={(e) => setRegNum(e.target.value)}
                       className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                     />
                   </div>

                   {/* Name */}
                   <div className="col-span-2 sm:col-span-1">
                     <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Vehicle Name / Model</label>
                     <input
                       type="text"
                       required
                       placeholder="e.g. Ford Transit Cargo"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                     />
                   </div>

                   {/* Type */}
                   <div>
                     <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Vehicle Type</label>
                     <select
                       value={type}
                       onChange={(e) => setType(e.target.value as VehicleType)}
                       className="w-full bg-slate-900/60 text-slate-300 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                     >
                       <option value="Truck">Truck</option>
                       <option value="Van">Van</option>
                       <option value="Sedan">Sedan</option>
                       <option value="Reefer">Reefer</option>
                     </select>
                   </div>

                   {/* Region */}
                   <div>
                     <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Operational Region</label>
                     <input
                       type="text"
                       required
                       placeholder="e.g. North"
                       value={region}
                       onChange={(e) => setRegion(e.target.value)}
                       className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                     />
                   </div>

                   {/* Max Load Capacity */}
                   <div>
                     <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Max Load Capacity (kg)</label>
                     <input
                       type="number"
                       required
                       placeholder="e.g. 5000"
                       value={maxLoadCapacity}
                       onChange={(e) => setMaxLoadCapacity(e.target.value)}
                       className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                     />
                   </div>

                   {/* Odometer */}
                   <div>
                     <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Current Odometer (km)</label>
                     <input
                       type="number"
                       required
                       placeholder="e.g. 15000"
                       value={odometer}
                       onChange={(e) => setOdometer(e.target.value)}
                       className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                     />
                   </div>

                   {/* Acquisition Cost */}
                   <div>
                     <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Acquisition Cost (USD)</label>
                     <input
                       type="number"
                       required
                       placeholder="e.g. 45000"
                       value={acquisitionCost}
                       onChange={(e) => setAcquisitionCost(e.target.value)}
                       className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                     />
                   </div>

                   {/* Status */}
                   <div>
                     <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Status</label>
                     <select
                       value={status}
                       onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                       disabled={editingVehicle?.status === 'On Trip'}
                       className="w-full bg-slate-900/60 text-slate-300 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono disabled:opacity-50"
                     >
                       <option value="Available">Available</option>
                       <option value="On Trip">On Trip</option>
                       <option value="In Shop">In Shop</option>
                       <option value="Retired">Retired</option>
                     </select>
                     {editingVehicle?.status === 'On Trip' && (
                       <p className="text-[9px] text-amber-500 mt-1 uppercase tracking-wider">Status locked: assigned to active trip.</p>
                     )}
                   </div>
                 </div>

                 {/* Feedback Logs */}
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

                 {/* Footer buttons */}
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
                     SAVE VEHICLE PROFILE
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
