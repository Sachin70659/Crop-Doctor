import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Scanner from "./pages/Scanner";
import Crops from "./pages/Crops";
import Diseases from "./pages/Diseases";
import Weather from "./pages/Weather";
import Expert from "./pages/Expert";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Shop from "./pages/Shop";
import Admin from "./pages/Admin";

function App() {
  return (
    <>
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/crops" element={<Crops />} />
          <Route path="/diseases" element={<Diseases />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/expert" element={<Expert />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/admin" element={<Admin />} />

          {/* 404 Page */}
          <Route
            path="*"
            element={
              <div className="p-10 text-center">
                <h1 className="text-3xl font-bold text-green-700">
                  404 - Page Not Found
                </h1>
                <p className="mt-2">
                  The page you are looking for does not exist.
                </p>
                <a
                  href="/"
                  className="mt-4 inline-block text-green-700 underline"
                >
                  Back to Home
                </a>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;
