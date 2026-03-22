import "../styles/App.css";
import "../styles/index.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ParkingProvider } from "../context/ParkingContext";
import MainLayout from "../layouts/MainLayout";
import ErrorBoundary from "../components/ErrorBoundary";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";

function App() {
  return (
    <ErrorBoundary>
      <ParkingProvider>   {/* ✅ THIS FIXES ERROR */}

        <BrowserRouter>
          <MainLayout>

            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

          </MainLayout>
        </BrowserRouter>

      </ParkingProvider>
    </ErrorBoundary>
  );
}

export default App;