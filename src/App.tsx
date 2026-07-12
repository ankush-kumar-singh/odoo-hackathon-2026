import React, { useState } from 'react';
import { 
  initialVehicles, 
  initialDrivers, 
  initialTrips, 
  initialMaintenanceLogs, 
  initialFuelLogs, 
  initialExpenseLogs 
} from './data/mockData';
import { Vehicle, Driver, Trip, MaintenanceLog, FuelLog, ExpenseLog, UserRole, TripStatus } from './types';
import Dashboard from './components/Dashboard';
import Vehicles from './components/Vehicles';
import Drivers from './components/Drivers';
import Trips from './components/Trips';
import Maintenance from './components/Maintenance';
import Expenses from './components/Expenses';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Truck, Users, Navigation, Wrench, Fuel, Sparkles, 
  Download, ShieldAlert, CheckCircle, ChevronDown, Award, Compass, RotateCcw 
} from 'lucide-react';

export default function App() {
  // Global States
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenseLogs, setExpenseLogs] = useState<ExpenseLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Global Navigation Filters State
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  // Compute filtered datasets globally so they are shared consistently across views
  const filteredVehicles = React.useMemo(() => {
    return vehicles.filter(v => {
      const matchType = selectedType === 'All' || v.type === selectedType;
      const matchStatus = selectedStatus === 'All' || v.status === selectedStatus;
      const matchRegion = selectedRegion === 'All' || v.region === selectedRegion;
      return matchType && matchStatus && matchRegion;
    });
  }, [vehicles, selectedType, selectedStatus, selectedRegion]);

  const filteredVehicleIds = React.useMemo(() => new Set(filteredVehicles.map(v => v.id)), [filteredVehicles]);

  const filteredTrips = React.useMemo(() => {
    return trips.filter(t => filteredVehicleIds.has(t.vehicleId));
  }, [trips, filteredVehicleIds]);

  const filteredMaintenanceLogs = React.useMemo(() => {
    return maintenanceLogs.filter(m => filteredVehicleIds.has(m.vehicleId));
  }, [maintenanceLogs, filteredVehicleIds]);

  const filteredFuelLogs = React.useMemo(() => {
    return fuelLogs.filter(f => filteredVehicleIds.has(f.vehicleId));
  }, [fuelLogs, filteredVehicleIds]);

  const filteredExpenseLogs = React.useMemo(() => {
    return expenseLogs.filter(e => filteredVehicleIds.has(e.vehicleId));
  }, [expenseLogs, filteredVehicleIds]);

  // Unique regions list generated from all actual loaded vehicles
  const regionsList = React.useMemo(() => {
    return ['All', ...Array.from(new Set(vehicles.map(v => v.region)))];
  }, [vehicles]);

  // Load data from MongoDB on mount
  React.useEffect(() => {
    async function loadData() {
      try {
        const [vData, dData, tData, mData, fData, eData] = await Promise.all([
          fetch("/api/vehicles").then(res => res.json()),
          fetch("/api/drivers").then(res => res.json()),
          fetch("/api/trips").then(res => res.json()),
          fetch("/api/maintenance").then(res => res.json()),
          fetch("/api/fuel").then(res => res.json()),
          fetch("/api/expenses").then(res => res.json())
        ]);
        setVehicles(Array.isArray(vData) ? vData : []);
        setDrivers(Array.isArray(dData) ? dData : []);
        setTrips(Array.isArray(tData) ? tData : []);
        setMaintenanceLogs(Array.isArray(mData) ? mData : []);
        setFuelLogs(Array.isArray(fData) ? fData : []);
        setExpenseLogs(Array.isArray(eData) ? eData : []);
      } catch (err) {
        console.error("Failed to load initial data from MongoDB:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Layout and Role States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vehicles' | 'drivers' | 'trips' | 'maintenance' | 'expenses'>('dashboard');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Fleet Manager');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Success Notification banner
  const [systemNotification, setSystemNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setSystemNotification(message);
    setTimeout(() => {
      setSystemNotification(null);
    }, 4000);
  };

  // --- CRUD HANDLERS WITH MONGODB BACKEND SYNCHRONIZATION ---

  // Vehicles
  const handleAddVehicle = (v: Omit<Vehicle, 'id'>) => {
    const regExists = vehicles.some(veh => veh.registrationNumber.toLowerCase() === v.registrationNumber.toLowerCase());
    if (regExists) return false;

    const newVehicle: Vehicle = {
      ...v,
      id: `veh-${Date.now()}`
    };
    
    // Optimistic local state update
    setVehicles(prev => [...prev, newVehicle]);
    showNotification(`Vehicle ${v.name} successfully registered.`);

    // Persistent backend sync
    fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newVehicle)
    }).catch(err => console.error("Failed to persist vehicle to database:", err));

    return true;
  };

  const handleUpdateVehicle = (v: Vehicle) => {
    const regExists = vehicles.some(veh => veh.id !== v.id && veh.registrationNumber.toLowerCase() === v.registrationNumber.toLowerCase());
    if (regExists) return false;

    // Optimistic local state update
    setVehicles(prev => prev.map(veh => veh.id === v.id ? v : veh));
    showNotification(`Vehicle ${v.name} updated successfully.`);

    // Persistent backend sync
    fetch(`/api/vehicles/${v.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v)
    }).catch(err => console.error("Failed to update vehicle in database:", err));

    return true;
  };

  const handleDeleteVehicle = (id: string) => {
    const veh = vehicles.find(v => v.id === id);
    
    // Optimistic local state update
    setVehicles(prev => prev.filter(v => v.id !== id));
    showNotification(`Vehicle ${veh?.name || ''} removed from fleet.`);

    // Persistent backend sync
    fetch(`/api/vehicles/${id}`, {
      method: "DELETE"
    }).catch(err => console.error("Failed to delete vehicle from database:", err));
  };

  // Drivers
  const handleAddDriver = (d: Omit<Driver, 'id'>) => {
    const newDriver: Driver = {
      ...d,
      id: `drv-${Date.now()}`
    };
    
    // Optimistic local state update
    setDrivers(prev => [...prev, newDriver]);
    showNotification(`Driver ${d.name} successfully registered.`);

    // Persistent backend sync
    fetch("/api/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDriver)
    }).catch(err => console.error("Failed to persist driver to database:", err));

    return true;
  };

  const handleUpdateDriver = (d: Driver) => {
    // Optimistic local state update
    setDrivers(prev => prev.map(drv => drv.id === d.id ? d : drv));
    showNotification(`Driver ${d.name} profile updated.`);

    // Persistent backend sync
    fetch(`/api/drivers/${d.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d)
    }).catch(err => console.error("Failed to update driver in database:", err));

    return true;
  };

  const handleDeleteDriver = (id: string) => {
    const drv = drivers.find(d => d.id === id);
    
    // Optimistic local state update
    setDrivers(prev => prev.filter(d => d.id !== id));
    showNotification(`Driver ${drv?.name || ''} removed from rosters.`);

    // Persistent backend sync
    fetch(`/api/drivers/${id}`, {
      method: "DELETE"
    }).catch(err => console.error("Failed to delete driver from database:", err));
  };

  // Trips & Life-Cycle Transitions
  const handleAddTrip = (t: Omit<Trip, 'id' | 'createdAt'>) => {
    const newTrip: Trip = {
      ...t,
      id: `TRP-${100 + trips.length + 1}`,
      createdAt: new Date().toISOString()
    };
    
    // Optimistic local state update
    setTrips(prev => [...prev, newTrip]);
    showNotification(`Trip Draft ${newTrip.id} booked. Ready for Dispatch.`);

    // Persistent backend sync
    fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTrip)
    }).catch(err => console.error("Failed to persist trip to database:", err));
  };

  const handleUpdateTripStatus = (
    tripId: string, 
    status: TripStatus, 
    completionData?: { actualDistance: number; fuelConsumed: number; finalOdometer: number; revenue: number }
  ) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    // Optimistic local state updates
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;

      if (status === 'Completed' && completionData) {
        return {
          ...t,
          status,
          actualDistance: completionData.actualDistance,
          fuelConsumed: completionData.fuelConsumed,
          revenue: completionData.revenue
        };
      }
      return { ...t, status };
    }));

    if (status === 'Dispatched') {
      setVehicles(vPrev => vPrev.map(v => v.id === trip.vehicleId ? { ...v, status: 'On Trip' } : v));
      setDrivers(dPrev => dPrev.map(d => d.id === trip.driverId ? { ...d, status: 'On Trip' } : d));
      showNotification(`Trip ${tripId} is dispatched! Vehicle and Driver are marked On Trip.`);

      // Persistent backend sync
      fetch(`/api/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'Dispatched' })
      }).catch(err => console.error(err));

      fetch(`/api/vehicles/${trip.vehicleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'On Trip' })
      }).catch(err => console.error(err));

      fetch(`/api/drivers/${trip.driverId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'On Trip' })
      }).catch(err => console.error(err));
    }

    if (status === 'Completed' && completionData) {
      setVehicles(vPrev => vPrev.map(v => v.id === trip.vehicleId ? { ...v, status: 'Available', odometer: completionData.finalOdometer } : v));
      setDrivers(dPrev => dPrev.map(d => d.id === trip.driverId ? { ...d, status: 'Available' } : d));
      
      const fuelLogId = `fuel-${Date.now()}`;
      const newFuelLog = {
        id: fuelLogId,
        vehicleId: trip.vehicleId,
        liters: completionData.fuelConsumed,
        cost: Math.round(completionData.fuelConsumed * 1.5),
        date: new Date().toISOString().split('T')[0]
      };
      setFuelLogs(fPrev => [...fPrev, newFuelLog]);
      showNotification(`Trip ${tripId} completed successfully! Assets restored to Available.`);

      // Persistent backend sync
      fetch(`/api/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 'Completed',
          actualDistance: completionData.actualDistance,
          fuelConsumed: completionData.fuelConsumed,
          revenue: completionData.revenue
        })
      }).catch(err => console.error(err));

      fetch(`/api/vehicles/${trip.vehicleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'Available', odometer: completionData.finalOdometer })
      }).catch(err => console.error(err));

      fetch(`/api/drivers/${trip.driverId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'Available' })
      }).catch(err => console.error(err));

      fetch('/api/fuel', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFuelLog)
      }).catch(err => console.error(err));
    }

    if (status === 'Cancelled') {
      setVehicles(vPrev => vPrev.map(v => v.id === trip.vehicleId ? { ...v, status: 'Available' } : v));
      setDrivers(dPrev => dPrev.map(d => d.id === trip.driverId ? { ...d, status: 'Available' } : d));
      showNotification(`Trip ${tripId} cancelled. Assets restored to Available.`);

      // Persistent backend sync
      fetch(`/api/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'Cancelled' })
      }).catch(err => console.error(err));

      fetch(`/api/vehicles/${trip.vehicleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'Available' })
      }).catch(err => console.error(err));

      fetch(`/api/drivers/${trip.driverId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'Available' })
      }).catch(err => console.error(err));
    }
  };

  // Maintenance Workflow
  const handleAddMaintenance = (m: Omit<MaintenanceLog, 'id' | 'startDate' | 'status'>) => {
    const newLog: MaintenanceLog = {
      ...m,
      id: `MNT-${100 + maintenanceLogs.length + 1}`,
      startDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };

    // Optimistic local state updates
    setMaintenanceLogs(prev => [...prev, newLog]);
    setVehicles(vPrev => vPrev.map(v => v.id === m.vehicleId ? { ...v, status: 'In Shop' } : v));
    showNotification(`Vehicle scheduled for repairs. Status is locked to In Shop.`);

    // Persistent backend sync
    fetch("/api/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLog)
    }).catch(err => console.error(err));

    fetch(`/api/vehicles/${m.vehicleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: 'In Shop' })
    }).catch(err => console.error(err));
  };

  const handleCompleteMaintenance = (maintId: string) => {
    const log = maintenanceLogs.find(l => l.id === maintId);
    if (!log) return;

    const endDate = new Date().toISOString().split('T')[0];

    // Optimistic local state updates
    setMaintenanceLogs(prev => prev.map(l => l.id === maintId ? { ...l, status: 'Completed', endDate } : l));
    setVehicles(vPrev => vPrev.map(v => v.id === log.vehicleId ? { ...v, status: 'Available' } : v));
    showNotification(`Maintenance resolved. Vehicle returned to Available fleet.`);

    // Persistent backend sync
    fetch(`/api/maintenance/${maintId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: 'Completed', endDate })
    }).catch(err => console.error(err));

    fetch(`/api/vehicles/${log.vehicleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: 'Available' })
    }).catch(err => console.error(err));
  };

  // Expenses & Fuel
  const handleAddFuelLog = (f: Omit<FuelLog, 'id'>) => {
    const newLog = { ...f, id: `fuel-${Date.now()}` };
    
    // Optimistic local state updates
    setFuelLogs(prev => [...prev, newLog]);
    showNotification('Fuel receipt logged.');

    // Persistent backend sync
    fetch("/api/fuel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLog)
    }).catch(err => console.error(err));
  };

  const handleAddExpenseLog = (e: Omit<ExpenseLog, 'id'>) => {
    const newLog = { ...e, id: `exp-${Date.now()}` };
    
    // Optimistic local state updates
    setExpenseLogs(prev => [...prev, newLog]);
    showNotification('Expense item logged.');

    // Persistent backend sync
    fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLog)
    }).catch(err => console.error(err));
  };

  // --- CSV REPORTS EXPORTER ---
  const handleExportCSV = (type: 'vehicles' | 'drivers' | 'trips') => {
    let dataset: any[] = [];
    let filename = '';

    if (type === 'vehicles') {
      dataset = vehicles;
      filename = 'TransitOps_Vehicles_Report.csv';
    } else if (type === 'drivers') {
      dataset = drivers;
      filename = 'TransitOps_Drivers_Report.csv';
    } else if (type === 'trips') {
      dataset = trips;
      filename = 'TransitOps_Trips_Report.csv';
    }

    if (dataset.length === 0) return;

    const headers = Object.keys(dataset[0]);
    const csvContent = [
      headers.join(','),
      ...dataset.map(row => 
        headers.map(fieldName => {
          const val = row[fieldName] !== undefined ? row[fieldName] : '';
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Successfully exported ${filename}`);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex flex-col font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Dynamic Toast System */}
      <AnimatePresence>
        {systemNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-slate-950/90 backdrop-blur border border-cyan-500/30 text-cyan-200 px-4 py-3 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.2)] flex items-center gap-2.5 max-w-md font-mono"
          >
            <CheckCircle className="h-4.5 w-4.5 text-cyan-400 shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
            <span className="text-xs font-semibold">{systemNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Top-Bar */}
      <header className="h-20 bg-slate-950/40 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Navigation className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white font-display tracking-tight">TransitOps</h1>
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono">
                V2.1 PREVIEW
              </span>
            </div>
            <p className="text-[10px] text-slate-500 tracking-widest uppercase font-mono">Smart Transport Operations Platform // Alpha Protocol</p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-4">
          
          {/* Export Center dropdown */}
          <div className="flex items-center bg-slate-900/60 border border-slate-800/80 rounded-xl px-2 py-1 gap-1">
            <span className="text-[9px] text-slate-500 uppercase font-mono font-bold px-1">CSV EXPORT:</span>
            <button
              onClick={() => handleExportCSV('vehicles')}
              className="text-[10px] hover:text-cyan-400 text-slate-400 font-mono font-semibold px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Vehicles
            </button>
            <button
              onClick={() => handleExportCSV('drivers')}
              className="text-[10px] hover:text-cyan-400 text-slate-400 font-mono font-semibold px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Drivers
            </button>
            <button
              onClick={() => handleExportCSV('trips')}
              className="text-[10px] hover:text-cyan-400 text-slate-400 font-mono font-semibold px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Trips
            </button>
          </div>

          {/* Role Changer Selector */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="h-10 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg flex items-center gap-3 text-xs font-semibold cursor-pointer transition-all hover:border-slate-700"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <span className="font-mono text-[11px] text-slate-400">ROLE: <strong className="text-slate-100 font-sans">{selectedRole}</strong></span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60 ml-1" />
            </button>

            <AnimatePresence>
              {roleMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setRoleMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-58 bg-slate-950 border border-slate-800 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] p-2 z-50 space-y-1"
                  >
                    {[
                      { role: 'Fleet Manager', desc: 'Full write access over all operations' },
                      { role: 'Driver', desc: 'Can manage trips and log expenses' },
                      { role: 'Safety Officer', desc: 'Review safety and licensing status' },
                      { role: 'Financial Analyst', desc: 'Read analytics and record expenses' }
                    ].map((item) => (
                      <button
                        key={item.role}
                        onClick={() => {
                          setSelectedRole(item.role as UserRole);
                          setRoleMenuOpen(false);
                          showNotification(`Switched role permission context to: ${item.role}`);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer ${
                          selectedRole === item.role 
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]' 
                            : 'hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{item.role}</div>
                        <div className="text-[10px] opacity-75 mt-0.5 leading-tight">{item.desc}</div>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        
        {/* Navigation Sidebar Drawer */}
        <aside className="w-full lg:w-64 bg-slate-950/50 border-b lg:border-b-0 lg:border-r border-slate-800/60 p-4 flex flex-col gap-1 shrink-0">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-3 font-mono">Main Navigation</div>

          {[
            { id: 'dashboard', label: 'Dashboard Desk', icon: LayoutDashboard },
            { id: 'vehicles', label: 'Vehicle Registry', icon: Truck },
            { id: 'drivers', label: 'Driver Profiles', icon: Users },
            { id: 'trips', label: 'Trip Dispatches', icon: Navigation },
            { id: 'maintenance', label: 'Repair Logbook', icon: Wrench },
            { id: 'expenses', label: 'Fuel & Expenses', icon: Fuel }
          ].map((tab) => {
            const IconComp = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer border-l-2 ${
                  isTabActive 
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-400 font-bold shadow-[inset_4px_0_12px_rgba(6,182,212,0.1)]' 
                    : 'text-slate-400 border-transparent hover:text-slate-100 hover:bg-slate-900/30'
                }`}
              >
                <IconComp className={`h-4.5 w-4.5 shrink-0 ${isTabActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className={isTabActive ? 'font-display tracking-tight' : ''}>{tab.label}</span>
              </button>
            );
          })}

          {/* Quick permissions warning helper */}
          <div className="mt-auto pt-6 hidden lg:block">
            <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">Access Badge</span>
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold mt-1">
                <Award className="h-3.5 w-3.5 text-cyan-400" />
                <span className="font-display">{selectedRole}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal mt-1.5">
                Your write permission limits alter dynamically as you switch roles in the top-right corner.
              </p>
            </div>
          </div>
        </aside>

        {/* Dynamic content view viewport */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Global System Navigation Filters */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]" />
                <span className="text-sm font-semibold text-slate-300 font-display tracking-tight">System Navigation Filters:</span>
              </div>
              
              {/* Vehicle Type */}
              <div className="flex flex-col">
                <label className="text-[9px] uppercase tracking-wider text-slate-500 mb-1 font-mono">Vehicle Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 hover:border-slate-700 transition-all font-mono cursor-pointer"
                >
                  {['All', 'Truck', 'Van', 'Sedan', 'Reefer'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <label className="text-[9px] uppercase tracking-wider text-slate-500 mb-1 font-mono">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 hover:border-slate-700 transition-all font-mono cursor-pointer"
                >
                  {['All', 'Available', 'On Trip', 'In Shop', 'Retired'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div className="flex flex-col">
                <label className="text-[9px] uppercase tracking-wider text-slate-500 mb-1 font-mono">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 hover:border-slate-700 transition-all font-mono cursor-pointer"
                >
                  {regionsList.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {(selectedType !== 'All' || selectedStatus !== 'All' || selectedRegion !== 'All') && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => {
                  setSelectedType('All');
                  setSelectedStatus('All');
                  setSelectedRegion('All');
                }}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-mono"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                RESET FILTER CORES
              </motion.button>
            )}
          </motion.div>

          {/* Core App Module Views Render */}
          <div className="min-h-[450px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'dashboard' && (
                  <Dashboard
                    vehicles={filteredVehicles}
                    drivers={drivers}
                    trips={filteredTrips}
                    maintenanceLogs={filteredMaintenanceLogs}
                    fuelLogs={filteredFuelLogs}
                    expenseLogs={filteredExpenseLogs}
                  />
                )}

                {activeTab === 'vehicles' && (
                  <Vehicles
                    vehicles={filteredVehicles}
                    onAddVehicle={handleAddVehicle}
                    onUpdateVehicle={handleUpdateVehicle}
                    onDeleteVehicle={handleDeleteVehicle}
                    role={selectedRole}
                  />
                )}

                {activeTab === 'drivers' && (
                  <Drivers
                    drivers={drivers}
                    onAddDriver={handleAddDriver}
                    onUpdateDriver={handleUpdateDriver}
                    onDeleteDriver={handleDeleteDriver}
                    role={selectedRole}
                  />
                )}

                {activeTab === 'trips' && (
                  <Trips
                    trips={filteredTrips}
                    vehicles={vehicles}
                    drivers={drivers}
                    onAddTrip={handleAddTrip}
                    onUpdateTripStatus={handleUpdateTripStatus}
                    role={selectedRole}
                  />
                )}

                {activeTab === 'maintenance' && (
                  <Maintenance
                    maintenanceLogs={filteredMaintenanceLogs}
                    vehicles={vehicles}
                    onAddMaintenance={handleAddMaintenance}
                    onCompleteMaintenance={handleCompleteMaintenance}
                    role={selectedRole}
                  />
                )}

                {activeTab === 'expenses' && (
                  <Expenses
                    vehicles={vehicles}
                    fuelLogs={filteredFuelLogs}
                    expenseLogs={filteredExpenseLogs}
                    maintenanceLogs={filteredMaintenanceLogs}
                    onAddFuelLog={handleAddFuelLog}
                    onAddExpenseLog={handleAddExpenseLog}
                    role={selectedRole}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Immersive Footer Control Strip */}
      <footer className="h-12 px-8 flex items-center justify-between bg-slate-950 border-t border-slate-800 text-[10px] font-mono text-slate-500 shrink-0">
        <div className="flex gap-6">
          <span className="text-cyan-500">COORD: 40.7128° N, 74.0060° W</span>
          <span className="hidden sm:inline">NODE: NYC-PRIMARY-01</span>
          <span className="hidden md:inline">LOAD: 0.12ms</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-cyan-500"></div>
            <div className="w-1 h-3 bg-cyan-500"></div>
            <div className="w-1 h-3 bg-cyan-500"></div>
            <div className="w-1 h-3 bg-slate-800"></div>
            <div className="w-1 h-3 bg-slate-800"></div>
          </div>
          <span>SECURE HANDSHAKE: VERIFIED</span>
        </div>
      </footer>
    </div>
  );
}
