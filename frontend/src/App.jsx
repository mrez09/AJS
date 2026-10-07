import { BrowserRouter, Route, Routes } from "react-router-dom";
import CommodityCatalog from "./pages/CommodityCatalog.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthProvider";
import BuyerDashboard from "./pages/BuyerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCommodities from "./pages/AdminCommodities";
import EditCommodity from "./pages/EditCommodity.jsx";
import AdminRequests from "./pages/AdminRequests";
import Cart from "./pages/Cart.jsx";
import Orders from "./pages/Orders.jsx";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/commodities" element={<CommodityCatalog />} />
          <Route path="/commodities/:id" element={<ProductDetail />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/buyer"
            element={
              <ProtectedRoute>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/commodities"
            element={
              <AdminRoute>
                <AdminCommodities />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/commodities/:id/edit"
            element={
              <AdminRoute>
                <EditCommodity />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/requests"
            element={
              <AdminRoute>
                <AdminRequests />
              </AdminRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/buyer/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
