# 🚛 TransitOps - Smart Fleet & Transport Operations Platform

> **A high-performance, real-time fleet operations system built for modern logistics managers, transport dispatchers, and finance teams.**
> Created for the **Hackathon 2026** challenge.

---

## 👥 Hackathon Team Roster

Our engineering and design team who built **TransitOps**:

*   **Ankush Kumar Singh** — *Team Lead (TL) & Lead Full-Stack Architect*
*   **Jasim Ansari** — *Frontend Engineer & UI/UX Specialist*
*   **Amardeep Kumar Yadav** — *Database & State Optimization Lead*
*   **Nasim Ansari** — *Compliance & Operational Logic Specialist*

---

## ⚡ Project Overview

**TransitOps** is an advanced, responsive, full-stack fleet operations platform designed to solve the critical friction points in regional logistics. It consolidates scattered spreadsheets, separate GPS tracking, fuel receipts, and repair orders into a single, cohesive, high-contrast, military-grade dashboard desk.

With real-time status synchronizations, operational safety CDL checklists, dynamic maintenance routing, and a smart **ROI performance algorithm**, TransitOps gives fleet managers total control over their assets, personnel, and expenses.

---

## 🚀 Key Features

### 1. 📊 Dashboard Desk
*   **Unified KPI Index:** View overall fleet size, active dispatches, pending repair tickets, and fuel averages in real-time.
*   **Interactive ROI Performance Curve:** Charts operational costs against completed trip revenues dynamically.
*   **Real-time Filters:** Refines your entire platform's view based on vehicle type or region in microseconds.

### 2. 🚚 Vehicle Registry
*   **Multi-Vehicle Inventory:** Tracks high-capacity Reefers, Light Duty Vans, flatbeds, and box trucks.
*   **Telemetry Logs:** Monitors live odometer, fuel efficiency (MPG), capacity volume, and purchase costs.
*   **Live Status Toggles:** Instantly flag vehicles as *Available*, *On Trip*, or *In Shop*.

### 3. 👥 Driver Profiles
*   **Credential Tracking:** Real-time checking of CDL-Class A licenses, safety ratings, and shift rosters.
*   **Compliance Alerts:** Dynamic color-coded warnings flag expired or pending medical and CDL certificates.
*   **Roster Management:** Easily onboard drivers and monitor active operator lists.

### 4. 🗺️ Trip Dispatches
*   **Interactive Router:** Create dispatch manifests linking a registered vehicle, a credentialed driver, cargo parameters, and routes.
*   **Live Transit Simulation:** Real-time visual progress of active cargo shipments (e.g., Dallas to Chicago runs).
*   **Telemetry Feedback:** Auto-closes completed trips to calculate driver safety indexes and net vehicle revenue.

### 5. 🔧 Repair Logbook
*   **Preventative Maintenance:** Detailed logs for oil swaps, brake checks, tire alignment, and major overhauls.
*   **Automated Lockouts:** Locking a vehicle *In Shop* pulls it from the active dispatch manifest to guarantee operator safety.
*   **Lifecycle Reports:** Calculates total upkeep costs to help managers retire underperforming hardware.

### 6. ⛽ Fuel & Expenses Ledger
*   **Operational Expense Center:** Logs fuel fill-ups (liters/gallons), exact pricing, and auxiliary costs (tolls, insurance).
*   **MPG Audit:** Real-time fuel economy analytics highlighting underperforming engines.
*   **Operational Cost-Per-Mile:** Displays visual cost distributions to optimize logistics margins.

---

## 💻 Tech Stack & Architecture

*   **Frontend:** React 18+, Vite, Tailwind CSS (Modern Utility styling), Lucide-React (Vector Icons), and `motion/react` for smooth transitions.
*   **Backend:** Express (Node.js engine) handling secure static serving, routing fallbacks, and modular API endpoints.
*   **Type Safety:** 100% TypeScript compliance for strict structural boundaries.
*   **Port Ingress:** Seamless proxy configuration routing all traffic to port `3000`.

---

## 🛠️ Installation & Local Development

To run the project locally on your system:

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Start the development environment:**
    ```bash
    npm run dev
    ```
3.  **Build and bundle the production server:**
    ```bash
    npm run build
    ```
4.  **Launch the high-performance production build:**
    ```bash
    npm run start
    ```

*Note: The platform is configured to listen exclusively on host `0.0.0.0` and Port `3000` behind secure reverse proxy environments.*
