import React, { useState, useMemo } from 'react';
import { Vehicle, Driver, Trip, MaintenanceLog, FuelLog, ExpenseLog } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { 
  Truck, Users, Navigation, AlertTriangle, Cpu, DollarSign, 
  TrendingUp, Compass, Activity, ShieldAlert, CheckCircle2, RotateCcw
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenanceLogs: MaintenanceLog[];
  fuelLogs: FuelLog[];
  expenseLogs: ExpenseLog[];
}

export default function Dashboard({
  vehicles,
  drivers,
  trips,
  maintenanceLogs,
  fuelLogs,
  expenseLogs
}: DashboardProps) {
  // Since Dashboard now receives already filtered vehicles from the global System Navigation Filters:
  const filteredVehicles = vehicles;

  // Calculations for KPIs
  const kpis = useMemo(() => {
    const activeVehicles = filteredVehicles.filter(v => v.status === 'On Trip').length;
    const availableVehicles = filteredVehicles.filter(v => v.status === 'Available').length;
    const inShopVehicles = filteredVehicles.filter(v => v.status === 'In Shop').length;
    
    // Filter trips to correspond only to filtered vehicles
    const filteredVehicleIds = new Set(filteredVehicles.map(v => v.id));
    const matchingTrips = trips.filter(t => filteredVehicleIds.has(t.vehicleId));
    
    const activeTrips = matchingTrips.filter(t => t.status === 'Dispatched').length;
    const pendingTrips = matchingTrips.filter(t => t.status === 'Draft').length;
    const completedTrips = matchingTrips.filter(t => t.status === 'Completed').length;
    
    // Drivers currently driving one of the filtered vehicles
    const activeDrivers = drivers.filter(d => d.status === 'On Trip' && matchingTrips.some(t => t.driverId === d.id && t.status === 'Dispatched')).length;
    const totalDrivers = drivers.length;
    
    // Fleet utilization %: Active / (Non-retired Fleet)
    const nonRetiredCount = filteredVehicles.filter(v => v.status !== 'Retired').length;
    const fleetUtilization = nonRetiredCount > 0 ? Math.round((activeVehicles / nonRetiredCount) * 100) : 0;

    return {
      activeVehicles,
      availableVehicles,
      inShopVehicles,
      activeTrips,
      pendingTrips,
      completedTrips,
      activeDrivers,
      totalDrivers,
      fleetUtilization
    };
  }, [filteredVehicles, drivers, trips]);

  // Vehicle ROI & Fuel Efficiency Data for Charts
  const vehicleMetrics = useMemo(() => {
    return filteredVehicles.map(vehicle => {
      // 1. Get Completed Trips
      const vehicleTrips = trips.filter(t => t.vehicleId === vehicle.id && t.status === 'Completed');
      const totalDistance = vehicleTrips.reduce((sum, t) => sum + (t.actualDistance || 0), 0);
      const totalFuelConsumed = vehicleTrips.reduce((sum, t) => sum + (t.fuelConsumed || 0), 0);
      const revenue = vehicleTrips.reduce((sum, t) => sum + (t.revenue || 0), 0);

      // 2. Get Maintenance Costs
      const maintenanceCost = maintenanceLogs
        .filter(m => m.vehicleId === vehicle.id)
        .reduce((sum, m) => sum + m.cost, 0);

      // 3. Get Fuel Costs
      const fuelCost = fuelLogs
        .filter(f => f.vehicleId === vehicle.id)
        .reduce((sum, f) => sum + f.cost, 0);

      // 4. Get other expenses
      const otherExpenseCost = expenseLogs
        .filter(e => e.vehicleId === vehicle.id)
        .reduce((sum, e) => sum + e.cost, 0);

      const totalOperationalCost = fuelCost + maintenanceCost + otherExpenseCost;

      // Fuel Efficiency (Distance / Fuel)
      const fuelEfficiency = totalFuelConsumed > 0 
        ? parseFloat((totalDistance / totalFuelConsumed).toFixed(2)) 
        : 0;

      // ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
      const roiValue = vehicle.acquisitionCost > 0
        ? ((revenue - (maintenanceCost + fuelCost)) / vehicle.acquisitionCost) * 100
        : 0;

      return {
        id: vehicle.id,
        name: vehicle.name,
        regNum: vehicle.registrationNumber,
        type: vehicle.type,
        revenue,
        maintenanceCost,
        fuelCost,
        otherCost: otherExpenseCost,
        totalOperationalCost,
        fuelEfficiency,
        roi: parseFloat(roiValue.toFixed(1)),
        distance: totalDistance
      };
    });
  }, [filteredVehicles, trips, maintenanceLogs, fuelLogs, expenseLogs]);

  // Status Distribution Data
  const statusChartData = useMemo(() => {
    const counts = { Available: 0, 'On Trip': 0, 'In Shop': 0, Retired: 0 };
    filteredVehicles.forEach(v => {
      if (counts[v.status] !== undefined) {
        counts[v.status]++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredVehicles]);

  const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-8">
      {/* Dashboard Headline */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display tracking-tight">
          <Activity className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]" />
          Fleet Operations Dashboard
        </h2>
        <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-wider">
          Real-time analytics, ROI assessments, and fuel metrics calculated dynamically across filtered assets.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: 'Active Vehicles', value: kpis.activeVehicles, icon: Truck, color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5 shadow-[inset_0_0_12px_rgba(6,182,212,0.05)]' },
          { label: 'Available Vehicles', value: kpis.availableVehicles, icon: CheckCircle2, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5 shadow-[inset_0_0_12px_rgba(16,185,129,0.05)]' },
          { label: 'In Maintenance', value: kpis.inShopVehicles, icon: AlertTriangle, color: 'text-amber-400 border-amber-500/20 bg-amber-500/5 shadow-[inset_0_0_12px_rgba(245,158,11,0.05)]' },
          { label: 'Active Trips', value: kpis.activeTrips, icon: Navigation, color: 'text-sky-400 border-sky-500/20 bg-sky-500/5 shadow-[inset_0_0_12px_rgba(56,189,248,0.05)]' },
          { label: 'Pending Trips', value: kpis.pendingTrips, icon: Activity, color: 'text-purple-400 border-purple-500/20 bg-purple-500/5 shadow-[inset_0_0_12px_rgba(168,85,247,0.05)]' },
          { label: 'Drivers On Duty', value: kpis.activeDrivers, totalCount: kpis.totalDrivers, icon: Users, color: 'text-teal-400 border-teal-500/20 bg-teal-500/5 shadow-[inset_0_0_12px_rgba(20,184,166,0.05)]' },
          { label: 'Fleet Utilization', value: `${kpis.fleetUtilization}%`, icon: TrendingUp, color: 'text-rose-400 border-rose-500/20 bg-rose-500/5 shadow-[inset_0_0_12px_rgba(244,63,94,0.05)]' }
        ].map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.04 }}
            className={`flex flex-col p-4 border rounded-xl relative overflow-hidden ${kpi.color} bg-slate-900/30`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 leading-tight font-mono">
                {kpi.label}
              </span>
              <kpi.icon className="h-4 w-4 opacity-70" />
            </div>
            <div className="text-xl font-bold font-display tracking-tight text-white mt-auto flex items-baseline">
              {kpi.value}
              {kpi.totalCount !== undefined && (
                <span className="text-xs text-slate-500 font-normal font-mono ml-1">/{kpi.totalCount}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Vehicle ROI */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group lg:col-span-2"
        >
          {/* Radial Top-right flare */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h3 className="font-semibold text-white text-sm font-display tracking-tight">Vehicle Return on Investment (ROI)</h3>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mt-0.5">ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost</p>
            </div>
            <span className="bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded text-[10px] font-mono">
              METRIC: ROI %
            </span>
          </div>

          <div className="h-64 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="regNum" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickFormatter={(val) => `${val}%`} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px', boxShadow: '0 0 15px rgba(6,182,212,0.1)' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold', fontFamily: 'monospace' }}
                  itemStyle={{ fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'monospace' }} />
                <Bar name="ROI %" dataKey="roi" radius={[4, 4, 0, 0]}>
                  {vehicleMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.roi >= 0 ? '#06b6d4' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 2: Fleet Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group"
        >
          {/* Radial flare */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <h3 className="font-semibold text-white text-sm font-display tracking-tight mb-1 relative z-10">Fleet Status Distribution</h3>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-6 relative z-10">Real-time status of all active vehicles</p>

          <div className="h-48 relative flex items-center justify-center z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }}
                  itemStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <span className="text-3xl font-bold text-white font-display">{filteredVehicles.length}</span>
              <p className="text-[9px] uppercase text-slate-500 tracking-widest font-mono">Filtered Fleet</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 relative z-10">
            {statusChartData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/50 border border-slate-900">
                <div className="h-2 w-2 rounded-full shadow-[0_0_6px_rgba(255,255,255,0.4)]" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-[11px] text-slate-400 font-mono uppercase">{item.name}</span>
                <span className="text-xs font-bold text-slate-100 font-mono ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Chart 3: Fuel Efficiency */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group"
        >
          {/* Radial flare */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h3 className="font-semibold text-white text-sm font-display tracking-tight">Fuel Efficiency</h3>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mt-0.5">Formula: Distance (km) / Fuel (L)</p>
            </div>
            <span className="bg-cyan-950/20 text-cyan-400 border border-cyan-500/25 px-2 py-0.5 rounded text-[10px] font-mono">
              km/L
            </span>
          </div>

          <div className="h-60 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleMetrics} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <XAxis type="number" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="regNum" stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }}
                />
                <Bar name="Efficiency (km/L)" dataKey="fuelEfficiency" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 4: Operational Costs Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group lg:col-span-2"
        >
          {/* Radial flare */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h3 className="font-semibold text-white text-sm font-display tracking-tight">Operational Cost breakdown per Vehicle</h3>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mt-0.5 font-mono">Sum of Fuel cost + Maintenance expense + Other logistics fees</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
              <DollarSign className="h-3.5 w-3.5 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]" />
              <span>USD</span>
            </div>
          </div>

          <div className="h-60 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="regNum" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'monospace' }} />
                <Bar name="Fuel Cost" dataKey="fuelCost" stackId="cost" fill="#06b6d4" />
                <Bar name="Maintenance Cost" dataKey="maintenanceCost" stackId="cost" fill="#f59e0b" />
                <Bar name="Other Expenses" dataKey="otherCost" stackId="cost" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* Filtered Vehicles Alert & List preview */}
      <motion.div 
        layout
        className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="font-semibold text-white text-xs font-display tracking-wide uppercase">Filtered Fleet Preview ({filteredVehicles.length})</h4>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-0.5">Filtered view based on criteria above</p>
          </div>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs font-mono">
            NO ASSETS MATCHING SELECTED CORES
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredVehicles.map(vehicle => {
              const statusColors = {
                Available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
                'On Trip': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]',
                'In Shop': 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
                Retired: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.15)]',
              };
              
              return (
                <div key={vehicle.id} className="p-3 bg-slate-900/20 hover:bg-slate-900/40 border border-slate-800/60 rounded-xl flex items-center justify-between transition-all group">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">{vehicle.name}</span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-900">
                        {vehicle.registrationNumber}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">
                      Type: {vehicle.type} | Region: {vehicle.region} | Max Cap: {vehicle.maxLoadCapacity} kg
                    </div>
                  </div>
                  <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 border rounded-full ${statusColors[vehicle.status]}`}>
                    {vehicle.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
