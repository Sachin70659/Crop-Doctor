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
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;