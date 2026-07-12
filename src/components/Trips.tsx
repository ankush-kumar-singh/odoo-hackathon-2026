import React, { useState, useMemo } from 'react';
import { Trip, Vehicle, Driver, TripStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, Plus, X, Play, CheckCircle2, Ban, 
  AlertTriangle, DollarSign, Scale, Milestone, Compass, CheckCircle
} from 'lucide-react';

interface TripsProps {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  onAddTrip: (t: Omit<Trip, 'id' | 'createdAt'>) => void;
  onUpdateTripStatus: (tripId: string, status: TripStatus, data?: { actualDistance: number; fuelConsumed: number; finalOdometer: number; revenue: number }) => void;
  role: string;
}

export default function Trips({
  trips,
  vehicles,
  drivers,
  onAddTrip,
  onUpdateTripStatus,
  role
}: TripsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // New Trip form states
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');

  // Complete Trip modal states
  const [completingTripId, setCompletingTripId] = useState<string | null>(null);
  const [actualDistance, setActualDistance] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');
  const [revenue, setRevenue] = useState('');

  const isAllowedToDispatch = role === 'Fleet Manager' || role === 'Driver';

  // Check if a driver's license is expired
  const isLicenseExpired = (expiryDateStr: string) => {
    const today = new Date('2026-07-12');
    const expiryDate = new Date(expiryDateStr);
    return expiryDate < today;
  };

  // Filter eligible vehicles for dispatching:
  // "Retired or In Shop vehicles must never appear in the dispatch selection."
  // "A driver or vehicle already marked On Trip cannot be assigned to another trip."
  const eligibleVehicles = useMemo(() => {
    return vehicles.filter(v => v.status === 'Available');
  }, [vehicles]);

  // Filter eligible drivers for dispatching:
  // "Drivers with expired licenses or Suspended status cannot be assigned to trips."
  // "A driver or vehicle already marked On Trip cannot be assigned to another trip."
  const eligibleDrivers = useMemo(() => {
    return drivers.filter(d => {
      const isExpired = isLicenseExpired(d.licenseExpiryDate);
      const isSuspended = d.status === 'Suspended';
      const isAvailable = d.status === 'Available';
      return isAvailable && !isExpired && !isSuspended;
    });
  }, [drivers]);

  // Find currently selected vehicle and driver for live validations
  const currentSelectedVehicle = useMemo(() => {
    return vehicles.find(v => v.id === selectedVehicleId);
  }, [vehicles, selectedVehicleId]);

  const currentSelectedDriver = useMemo(() => {
    return drivers.find(d => d.id === selectedDriverId);
  }, [drivers, selectedDriverId]);

  // Live validation feedback
  const liveValidation = useMemo(() => {
    if (!cargoWeight || !currentSelectedVehicle) return null;
    const weight = parseFloat(cargoWeight);
    if (isNaN(weight)) return null;
    
    if (weight > currentSelectedVehicle.maxLoadCapacity) {
      return {
        valid: false,
        message: `Cargo weight exceeds vehicle's maximum load capacity of ${currentSelectedVehicle.maxLoadCapacity.toLocaleString()} kg!`
      };
    }
    return {
      valid: true,
      message: `Weight is within vehicle's safe limit of ${currentSelectedVehicle.maxLoadCapacity.toLocaleString()} kg.`
    };
  }, [cargoWeight, currentSelectedVehicle]);

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!source.trim() || !destination.trim() || !selectedVehicleId || !selectedDriverId || !cargoWeight || !plannedDistance) {
      setErrorMsg('All fields are required.');
      return;
    }

    const parsedWeight = parseFloat(cargoWeight);
    const parsedDistance = parseFloat(plannedDistance);

    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      setErrorMsg('Cargo weight must be a positive number.');
      return;
    }

    if (isNaN(parsedDistance) || parsedDistance <= 0) {
      setErrorMsg('Planned distance must be a positive number.');
      return;
    }

    const veh = vehicles.find(v => v.id === selectedVehicleId);
    if (veh && parsedWeight > veh.maxLoadCapacity) {
      setErrorMsg(`Cargo Weight must not exceed the vehicle's maximum load capacity of ${veh.maxLoadCapacity} kg.`);
      return;
    }

    onAddTrip({
      source: source.trim(),
      destination: destination.trim(),
      vehicleId: selectedVehicleId,
      driverId: selectedDriverId,
      cargoWeight: parsedWeight,
      plannedDistance: parsedDistance,
      status: 'Draft'
    });

    // Reset Form
    setSource('');
    setDestination('');
    setSelectedVehicleId('');
    setSelectedDriverId('');
    setCargoWeight('');
    setPlannedDistance('');
    setIsFormOpen(false);
  };

  const startCompletingTrip = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    
    setCompletingTripId(tripId);
    setActualDistance(trip.plannedDistance.toString());
    setFuelConsumed(Math.round(trip.plannedDistance * 0.35).toString()); // Mock initial estimate
    setRevenue((trip.plannedDistance * 6).toString()); // Mock revenue estimate
  };

  const [completeErrorMsg, setCompleteErrorMsg] = useState('');

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingTripId) return;
    setCompleteErrorMsg('');

    const parsedActualDistance = parseFloat(actualDistance);
    const parsedFuel = parseFloat(fuelConsumed);
    const parsedRev = parseFloat(revenue);

    if (isNaN(parsedActualDistance) || parsedActualDistance <= 0) {
      setCompleteErrorMsg('Please enter a valid actual distance.');
      return;
    }
    if (isNaN(parsedFuel) || parsedFuel < 0) {
      setCompleteErrorMsg('Please enter a valid fuel value.');
      return;
    }
    if (isNaN(parsedRev) || parsedRev < 0) {
      setCompleteErrorMsg('Please enter a valid revenue value.');
      return;
    }

    // Retrieve previous odometer
    const trip = trips.find(t => t.id === completingTripId);
    const vehicle = vehicles.find(v => v.id === trip?.vehicleId);
    const finalOdometer = (vehicle?.odometer || 0) + parsedActualDistance;

    onUpdateTripStatus(completingTripId, 'Completed', {
      actualDistance: parsedActualDistance,
      fuelConsumed: parsedFuel,
      finalOdometer,
      revenue: parsedRev
    });

    setCompletingTripId(null);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display tracking-tight">
            <Navigation className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]" />
            Trip Management & Dispatch
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-wider">
            Dispatch trucks, track delivery status transitions, and input trip logs upon cargo completion.
          </p>
        </div>

        {isAllowedToDispatch ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            {isFormOpen ? <X className="h-4 w-4 stroke-[3px]" /> : <Plus className="h-4 w-4 stroke-[3px]" />}
            {isFormOpen ? 'CLOSE DISPATCH PANEL' : 'DRAFT NEW TRIP'}
          </motion.button>
        ) : (
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-xl text-[11px] font-mono max-w-max uppercase">
            <AlertTriangle className="h-4 w-4" />
            <span>Viewer Mode: Role of <strong>{role}</strong> is restricted from drafting trips.</span>
          </div>
        )}
      </div>

      {/* Dispatch Panel Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreateTrip} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <h3 className="text-xs font-bold text-cyan-400 font-display tracking-wider flex items-center gap-1.5 border-b border-slate-800/85 pb-3 uppercase">
                <Compass className="h-4 w-4" />
                Trip Booking Desk
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono">
                {/* Source */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Departure Source</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chicago Logistics Hub"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Destination</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Detroit Distribution Center"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Planned Distance */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Planned Distance (km)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 450"
                    value={plannedDistance}
                    onChange={(e) => setPlannedDistance(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Vehicle Selection */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Select Available Vehicle</label>
                  <select
                    value={selectedVehicleId}
                    required
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full bg-slate-900/60 text-slate-300 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                  >
                    <option value="">-- Choose Vehicle --</option>
                    {eligibleVehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.registrationNumber}) - Max {v.maxLoadCapacity} kg
                      </option>
                    ))}
                  </select>
                  {eligibleVehicles.length === 0 && (
                    <p className="text-[9px] text-rose-400 mt-1 uppercase font-bold tracking-wider">No vehicles are currently Available.</p>
                  )}
                </div>

                {/* Driver Selection */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Select Available Driver</label>
                  <select
                    value={selectedDriverId}
                    required
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full bg-slate-900/60 text-slate-300 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                  >
                    <option value="">-- Choose Driver --</option>
                    {eligibleDrivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} (Safety: {d.safetyScore})
                      </option>
                    ))}
                  </select>
                  {eligibleDrivers.length === 0 && (
                    <p className="text-[9px] text-rose-400 mt-1 uppercase font-bold tracking-wider">No compliant drivers are currently Available.</p>
                  )}
                </div>

                {/* Cargo Weight */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Cargo Weight (kg)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 1200"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Live Validations feedback */}
              {liveValidation && (
                <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-1.5 font-mono uppercase tracking-wider ${
                  liveValidation.valid 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{liveValidation.message}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-center gap-1.5 font-mono uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold font-mono text-slate-500 hover:text-slate-300 cursor-pointer uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={liveValidation?.valid === false}
                  className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 px-5 py-2 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                >
                  CONFIRM & CREATE DRAFT
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trips Registry List */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5">
        <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider font-display mb-4">Trip Dispatches List</h3>
        
        <div className="space-y-4">
          {trips.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs font-mono uppercase border border-slate-800/50 rounded-2xl bg-slate-950/20">
              No trips registered yet. Draft a new trip to begin.
            </div>
          ) : (
            [...trips].reverse().map((trip) => {
              const vehicleObj = vehicles.find(v => v.id === trip.vehicleId);
              const driverObj = drivers.find(d => d.id === trip.driverId);

              // Status badges
              const badgeColors = {
                Draft: 'bg-slate-800 text-slate-400 border-slate-700',
                Dispatched: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]',
                Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
                Cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.15)]'
              };

              return (
                <motion.div
                  key={trip.id}
                  layout
                  className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-cyan-500/30 transition-all relative overflow-hidden group shadow-lg"
                >
                  {/* Left Column: Routing & Details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-[10px] font-mono font-bold bg-slate-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/15">
                        {trip.id}
                      </span>
                      <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">From:</span>
                      <strong className="text-white text-xs sm:text-sm font-display">{trip.source}</strong>
                      <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">To:</span>
                      <strong className="text-white text-xs sm:text-sm font-display">{trip.destination}</strong>

                      <span className={`px-2.5 py-0.5 ml-auto md:ml-2 border rounded-full text-[9px] font-bold uppercase tracking-wider font-mono ${badgeColors[trip.status]}`}>
                        {trip.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2 border-t border-slate-800/60 font-mono">
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase tracking-wider block mb-0.5">Assigned Vehicle</span>
                        <span className="text-slate-300 font-semibold">
                          {vehicleObj ? `${vehicleObj.name} (${vehicleObj.registrationNumber})` : 'Deleted Vehicle'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[9px] uppercase tracking-wider block mb-0.5">Assigned Driver</span>
                        <span className="text-slate-300 font-semibold">
                          {driverObj ? driverObj.name : 'Deleted Driver'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[9px] uppercase tracking-wider block mb-0.5">Cargo Weight</span>
                        <span className="text-slate-300 font-semibold flex items-center gap-1">
                          <Scale className="h-3.5 w-3.5 text-cyan-500" />
                          {trip.cargoWeight.toLocaleString()} kg
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[9px] uppercase tracking-wider block mb-0.5">Planned Distance</span>
                        <span className="text-slate-300 font-semibold flex items-center gap-1">
                          <Milestone className="h-3.5 w-3.5 text-cyan-500" />
                          {trip.plannedDistance} km
                        </span>
                      </div>
                    </div>

                    {/* Actual logs details when Completed */}
                    {trip.status === 'Completed' && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl font-mono">
                        <div>
                          <span className="text-emerald-500 text-[9px] uppercase tracking-wider block mb-0.5 font-bold">Actual Distance</span>
                          <span className="text-slate-200 font-extrabold">{trip.actualDistance} km</span>
                        </div>
                        <div>
                          <span className="text-emerald-500 text-[9px] uppercase tracking-wider block mb-0.5 font-bold">Fuel Consumed</span>
                          <span className="text-slate-200 font-extrabold">{trip.fuelConsumed} Liters</span>
                        </div>
                        <div>
                          <span className="text-emerald-400 text-[9px] uppercase tracking-wider block mb-0.5 font-bold">Generated Revenue</span>
                          <span className="text-emerald-400 font-bold">${trip.revenue?.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Interactive Lifecycle Actions */}
                  {isAllowedToDispatch && (
                    <div className="flex flex-wrap md:flex-col items-center justify-end gap-2 shrink-0 md:border-l md:border-slate-800/80 md:pl-6 font-mono">
                      
                      {/* DRAFT -> DISPATCH */}
                      {trip.status === 'Draft' && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onUpdateTripStatus(trip.id, 'Dispatched')}
                          className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs px-3 py-2 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                        >
                          <Play className="h-3.5 w-3.5 fill-slate-950" />
                          <span>Dispatch Trip</span>
                        </motion.button>
                      )}

                      {/* DISPATCHED -> COMPLETE / CANCEL */}
                      {trip.status === 'Dispatched' && (
                        <>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startCompletingTrip(trip.id)}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs px-3 py-2 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Mark Completed</span>
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onUpdateTripStatus(trip.id, 'Cancelled')}
                            className="w-full bg-slate-900 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-slate-800 hover:border-rose-900/50 text-xs px-3 py-2 rounded-xl font-semibold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            <span>Cancel Trip</span>
                          </motion.button>
                        </>
                      )}

                      {/* FINAL STATES (COMPLETED/CANCELLED) */}
                      {(trip.status === 'Completed' || trip.status === 'Cancelled') && (
                        <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold font-mono italic p-2 text-center">
                          LOCKED
                        </div>
                      )}

                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Completion Dialog Form Prompt */}
      <AnimatePresence>
        {completingTripId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCompletingTripId(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-slate-950 border border-slate-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

              <h3 className="text-sm font-bold text-white font-display tracking-tight mb-2 flex items-center gap-1.5 uppercase relative z-10 text-emerald-400">
                <CheckCircle className="h-4 w-4 text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                Finalize Trip Log
              </h3>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-4 relative z-10">
                Please input final operational details to automatically sync odometer logs and update ROI & Fuel metrics.
              </p>

              <form onSubmit={handleCompleteSubmit} className="space-y-4 relative z-10 font-mono">
                {/* Actual Distance */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Actual Distance Driven (km)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={actualDistance}
                    onChange={(e) => setActualDistance(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                {/* Fuel Consumed */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Fuel Consumed (Liters)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={fuelConsumed}
                    onChange={(e) => setFuelConsumed(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                {/* Revenue */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Gross Revenue Generated (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="number"
                      required
                      min="0"
                      value={revenue}
                      onChange={(e) => setRevenue(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {completeErrorMsg && (
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-center gap-1.5 uppercase font-bold tracking-wider">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{completeErrorMsg}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setCompletingTripId(null);
                      setCompleteErrorMsg('');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-300 cursor-pointer uppercase tracking-wider font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)] font-mono"
                  >
                    COMPLETE TRIP
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
