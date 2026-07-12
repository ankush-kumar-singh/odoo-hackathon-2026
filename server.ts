import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import mongoose, { Schema } from "mongoose";
import dotenv from "dotenv";

// Import initial seed data from the shared frontend mockup data
import { 
  initialVehicles, 
  initialDrivers, 
  initialTrips, 
  initialMaintenanceLogs, 
  initialFuelLogs, 
  initialExpenseLogs 
} from "./src/data/mockData.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// State variable for database status
let isMongoConnected = false;

// Local memory-based fallback collections
let memoryVehicles = JSON.parse(JSON.stringify(initialVehicles));
let memoryDrivers = JSON.parse(JSON.stringify(initialDrivers));
let memoryTrips = JSON.parse(JSON.stringify(initialTrips));
let memoryMaintenanceLogs = JSON.parse(JSON.stringify(initialMaintenanceLogs));
let memoryFuelLogs = JSON.parse(JSON.stringify(initialFuelLogs));
let memoryExpenseLogs = JSON.parse(JSON.stringify(initialExpenseLogs));

// MongoDB connection URI
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://ankush1234:ankush1234@cluster0.ttlmuoo.mongodb.net/fleet_db?appName=Cluster0";

console.log("Connecting to MongoDB...");
mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 5000 // Fast fail-over to memory after 5s
})
  .then(() => {
    console.log("MongoDB connected successfully. Setting mode to Live Database.");
    isMongoConnected = true;
    seedDatabaseIfEmpty();
  })
  .catch((err) => {
    console.error("MongoDB Connection Failed (IP whitelist / credentials check / timeout).");
    console.error("Reason:", err.message);
    console.warn(">>> CRITICAL WARNING: Falling back gracefully to Server In-Memory Storage. All functionality remains fully responsive. <<<");
    isMongoConnected = false;
  });

// Schema options to return clean frontend JSON
const schemaOptions = {
  toJSON: {
    transform: (doc: any, ret: any) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    transform: (doc: any, ret: any) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
};

// Mongoose Schemas & Models
const VehicleSchema = new Schema({
  id: { type: String, required: true, unique: true },
  registrationNumber: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  maxLoadCapacity: { type: Number, required: true },
  odometer: { type: Number, required: true },
  acquisitionCost: { type: Number, required: true },
  status: { type: String, required: true },
  region: { type: String, required: true }
}, schemaOptions);

const VehicleModel = mongoose.model("Vehicle", VehicleSchema);

const DriverSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  licenseCategory: { type: String, required: true },
  licenseExpiryDate: { type: String, required: true },
  contactNumber: { type: String, required: true },
  safetyScore: { type: Number, required: true },
  status: { type: String, required: true }
}, schemaOptions);

const DriverModel = mongoose.model("Driver", DriverSchema);

const TripSchema = new Schema({
  id: { type: String, required: true, unique: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  vehicleId: { type: String, required: true },
  driverId: { type: String, required: true },
  cargoWeight: { type: Number, required: true },
  plannedDistance: { type: Number, required: true },
  actualDistance: { type: Number },
  status: { type: String, required: true },
  fuelConsumed: { type: Number },
  revenue: { type: Number },
  createdAt: { type: String, required: true }
}, schemaOptions);

const TripModel = mongoose.model("Trip", TripSchema);

const MaintenanceLogSchema = new Schema({
  id: { type: String, required: true, unique: true },
  vehicleId: { type: String, required: true },
  description: { type: String, required: true },
  cost: { type: Number, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String },
  status: { type: String, required: true }
}, schemaOptions);

const MaintenanceLogModel = mongoose.model("MaintenanceLog", MaintenanceLogSchema);

const FuelLogSchema = new Schema({
  id: { type: String, required: true, unique: true },
  vehicleId: { type: String, required: true },
  liters: { type: Number, required: true },
  cost: { type: Number, required: true },
  date: { type: String, required: true }
}, schemaOptions);

const FuelLogModel = mongoose.model("FuelLog", FuelLogSchema);

const ExpenseLogSchema = new Schema({
  id: { type: String, required: true, unique: true },
  vehicleId: { type: String, required: true },
  type: { type: String, required: true },
  cost: { type: Number, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true }
}, schemaOptions);

const ExpenseLogModel = mongoose.model("ExpenseLog", ExpenseLogSchema);

// Seeding engine to guarantee standard operational state on blank clusters
async function seedDatabaseIfEmpty() {
  try {
    const vehicleCount = await VehicleModel.countDocuments();
    if (vehicleCount === 0) {
      console.log("Database is empty. Seeding initial data logs...");
      await VehicleModel.insertMany(initialVehicles);
      await DriverModel.insertMany(initialDrivers);
      await TripModel.insertMany(initialTrips);
      await MaintenanceLogModel.insertMany(initialMaintenanceLogs);
      await FuelLogModel.insertMany(initialFuelLogs);
      await ExpenseLogModel.insertMany(initialExpenseLogs);
      console.log("Database seeded successfully.");
    } else {
      console.log(`Database has existing data (${vehicleCount} vehicles). Skipping seeding.`);
    }
  } catch (err) {
    console.error("Error during database seeding:", err);
  }
}

// Data Access Layer with seamless Live-Mongo / Memory-Fallback switcher
const db = {
  // --- VEHICLES ---
  getVehicles: async () => {
    return isMongoConnected ? await VehicleModel.find({}) : memoryVehicles;
  },
  addVehicle: async (data: any) => {
    if (isMongoConnected) {
      const doc = new VehicleModel(data);
      await doc.save();
      return doc;
    } else {
      memoryVehicles.push(data);
      return data;
    }
  },
  updateVehicle: async (id: string, data: any) => {
    if (isMongoConnected) {
      return await VehicleModel.findOneAndUpdate({ id }, data, { new: true });
    } else {
      const idx = memoryVehicles.findIndex((v: any) => v.id === id);
      if (idx !== -1) {
        memoryVehicles[idx] = { ...memoryVehicles[idx], ...data };
        return memoryVehicles[idx];
      }
      return null;
    }
  },
  deleteVehicle: async (id: string) => {
    if (isMongoConnected) {
      return await VehicleModel.findOneAndDelete({ id });
    } else {
      const idx = memoryVehicles.findIndex((v: any) => v.id === id);
      if (idx !== -1) {
        const deleted = memoryVehicles[idx];
        memoryVehicles.splice(idx, 1);
        return deleted;
      }
      return null;
    }
  },

  // --- DRIVERS ---
  getDrivers: async () => {
    return isMongoConnected ? await DriverModel.find({}) : memoryDrivers;
  },
  addDriver: async (data: any) => {
    if (isMongoConnected) {
      const doc = new DriverModel(data);
      await doc.save();
      return doc;
    } else {
      memoryDrivers.push(data);
      return data;
    }
  },
  updateDriver: async (id: string, data: any) => {
    if (isMongoConnected) {
      return await DriverModel.findOneAndUpdate({ id }, data, { new: true });
    } else {
      const idx = memoryDrivers.findIndex((d: any) => d.id === id);
      if (idx !== -1) {
        memoryDrivers[idx] = { ...memoryDrivers[idx], ...data };
        return memoryDrivers[idx];
      }
      return null;
    }
  },
  deleteDriver: async (id: string) => {
    if (isMongoConnected) {
      return await DriverModel.findOneAndDelete({ id });
    } else {
      const idx = memoryDrivers.findIndex((d: any) => d.id === id);
      if (idx !== -1) {
        const deleted = memoryDrivers[idx];
        memoryDrivers.splice(idx, 1);
        return deleted;
      }
      return null;
    }
  },

  // --- TRIPS ---
  getTrips: async () => {
    return isMongoConnected ? await TripModel.find({}) : memoryTrips;
  },
  addTrip: async (data: any) => {
    if (isMongoConnected) {
      const doc = new TripModel(data);
      await doc.save();
      return doc;
    } else {
      memoryTrips.push(data);
      return data;
    }
  },
  updateTrip: async (id: string, data: any) => {
    if (isMongoConnected) {
      return await TripModel.findOneAndUpdate({ id }, data, { new: true });
    } else {
      const idx = memoryTrips.findIndex((t: any) => t.id === id);
      if (idx !== -1) {
        memoryTrips[idx] = { ...memoryTrips[idx], ...data };
        return memoryTrips[idx];
      }
      return null;
    }
  },

  // --- MAINTENANCE LOGS ---
  getMaintenance: async () => {
    return isMongoConnected ? await MaintenanceLogModel.find({}) : memoryMaintenanceLogs;
  },
  addMaintenance: async (data: any) => {
    if (isMongoConnected) {
      const doc = new MaintenanceLogModel(data);
      await doc.save();
      return doc;
    } else {
      memoryMaintenanceLogs.push(data);
      return data;
    }
  },
  updateMaintenance: async (id: string, data: any) => {
    if (isMongoConnected) {
      return await MaintenanceLogModel.findOneAndUpdate({ id }, data, { new: true });
    } else {
      const idx = memoryMaintenanceLogs.findIndex((l: any) => l.id === id);
      if (idx !== -1) {
        memoryMaintenanceLogs[idx] = { ...memoryMaintenanceLogs[idx], ...data };
        return memoryMaintenanceLogs[idx];
      }
      return null;
    }
  },

  // --- FUEL LOGS ---
  getFuel: async () => {
    return isMongoConnected ? await FuelLogModel.find({}) : memoryFuelLogs;
  },
  addFuel: async (data: any) => {
    if (isMongoConnected) {
      const doc = new FuelLogModel(data);
      await doc.save();
      return doc;
    } else {
      memoryFuelLogs.push(data);
      return data;
    }
  },

  // --- EXPENSE LOGS ---
  getExpenses: async () => {
    return isMongoConnected ? await ExpenseLogModel.find({}) : memoryExpenseLogs;
  },
  addExpense: async (data: any) => {
    if (isMongoConnected) {
      const doc = new ExpenseLogModel(data);
      await doc.save();
      return doc;
    } else {
      memoryExpenseLogs.push(data);
      return data;
    }
  },

  // --- HARD RESET ---
  reset: async () => {
    memoryVehicles = JSON.parse(JSON.stringify(initialVehicles));
    memoryDrivers = JSON.parse(JSON.stringify(initialDrivers));
    memoryTrips = JSON.parse(JSON.stringify(initialTrips));
    memoryMaintenanceLogs = JSON.parse(JSON.stringify(initialMaintenanceLogs));
    memoryFuelLogs = JSON.parse(JSON.stringify(initialFuelLogs));
    memoryExpenseLogs = JSON.parse(JSON.stringify(initialExpenseLogs));

    if (isMongoConnected) {
      await VehicleModel.deleteMany({});
      await DriverModel.deleteMany({});
      await TripModel.deleteMany({});
      await MaintenanceLogModel.deleteMany({});
      await FuelLogModel.deleteMany({});
      await ExpenseLogModel.deleteMany({});

      await VehicleModel.insertMany(initialVehicles);
      await DriverModel.insertMany(initialDrivers);
      await TripModel.insertMany(initialTrips);
      await MaintenanceLogModel.insertMany(initialMaintenanceLogs);
      await FuelLogModel.insertMany(initialFuelLogs);
      await ExpenseLogModel.insertMany(initialExpenseLogs);
    }
  }
};

// --- API ENDPOINTS ---

// 1. VEHICLES
app.get("/api/vehicles", async (req, res) => {
  try {
    const data = await db.getVehicles();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/vehicles", async (req, res) => {
  try {
    const data = await db.addVehicle(req.body);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/vehicles/:id", async (req, res) => {
  try {
    const data = await db.updateVehicle(req.params.id, req.body);
    if (!data) return res.status(404).json({ error: "Vehicle not found" });
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/vehicles/:id", async (req, res) => {
  try {
    const data = await db.deleteVehicle(req.params.id);
    if (!data) return res.status(404).json({ error: "Vehicle not found" });
    res.json({ message: "Vehicle deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. DRIVERS
app.get("/api/drivers", async (req, res) => {
  try {
    const data = await db.getDrivers();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/drivers", async (req, res) => {
  try {
    const data = await db.addDriver(req.body);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/drivers/:id", async (req, res) => {
  try {
    const data = await db.updateDriver(req.params.id, req.body);
    if (!data) return res.status(404).json({ error: "Driver not found" });
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/drivers/:id", async (req, res) => {
  try {
    const data = await db.deleteDriver(req.params.id);
    if (!data) return res.status(404).json({ error: "Driver not found" });
    res.json({ message: "Driver deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. TRIPS
app.get("/api/trips", async (req, res) => {
  try {
    const data = await db.getTrips();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/trips", async (req, res) => {
  try {
    const data = await db.addTrip(req.body);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/trips/:id", async (req, res) => {
  try {
    const data = await db.updateTrip(req.params.id, req.body);
    if (!data) return res.status(404).json({ error: "Trip not found" });
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 4. MAINTENANCE LOGS
app.get("/api/maintenance", async (req, res) => {
  try {
    const data = await db.getMaintenance();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/maintenance", async (req, res) => {
  try {
    const data = await db.addMaintenance(req.body);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/maintenance/:id", async (req, res) => {
  try {
    const data = await db.updateMaintenance(req.params.id, req.body);
    if (!data) return res.status(404).json({ error: "Log not found" });
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 5. FUEL LOGS
app.get("/api/fuel", async (req, res) => {
  try {
    const data = await db.getFuel();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/fuel", async (req, res) => {
  try {
    const data = await db.addFuel(req.body);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 6. EXPENSE LOGS
app.get("/api/expenses", async (req, res) => {
  try {
    const data = await db.getExpenses();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/expenses", async (req, res) => {
  try {
    const data = await db.addExpense(req.body);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Reset API for Simulator or hard reset purposes
app.post("/api/reset", async (req, res) => {
  try {
    console.log("Resetting database as requested...");
    await db.reset();
    console.log("Reset complete.");
    res.json({ status: "ok", message: "Database reset to initial fleet seed values successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite Middleware for development asset serving & routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
