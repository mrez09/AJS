import { BrowserRouter, Route, Routes } from "react-router-dom";
import CommodityCatalog from "./pages/CommodityCatalog.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthProvider";
import BuyerDashboard from "./pages/BuyerDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/commodities" element={<CommodityCatalog />} />
          <Route path="/commodities/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/buyer" element={<BuyerDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
