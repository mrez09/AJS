import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/useAuth";
import { getAllOrders } from "../services/orderService";
import { getProducts } from "../services/productService";

function AdminDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (error) {
        setOrdersError(error.message);
      } finally {
        setOrdersLoading(false);
      }
    }

    loadOrders();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        setProductsError(error.message);
      } finally {
        setProductsLoading(false);
      }
    }

    loadProducts();
  }, []);

  const cards = [
    {
      label: "Total Commodities",
      value: productsLoading ? "..." : productsError ? "—" : products.length,
      detail: productsError || "Commodities in the catalog",
      to: "/admin/commodities",
    },
    {
      label: "Available Commodities",
      value: productsLoading
        ? "..."
        : productsError
          ? "—"
          : products.filter((product) => product.Status === "Available").length,
      detail: productsError || "Currently available for buyers",
      to: "/admin/commodities",
    },
    {
      label: "Requested Orders",
      value: ordersLoading
        ? "..."
        : ordersError
          ? "—"
          : orders.filter((order) => order.Status === "Requested").length,
      detail: ordersError || "Waiting for review",
      to: "/admin/requests",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-white sm:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            AJS Admin Portal
          </p>
          <h1 className="text-3xl font-bold">
            Welcome, {user?.name || "Admin"}
          </h1>
          <p className="mt-2 text-slate-400">
            Overview of commodity availability and order requests.
          </p>

          <section
            aria-label="Admin overview"
            className="mt-8 grid gap-5 md:grid-cols-3"
          >
            {cards.map(({ label, value, detail, to }) => (
              <Link
                key={label}
                to={to}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition-colors hover:border-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              >
                <p className="text-sm font-medium text-slate-400">{label}</p>
                <p className="mt-3 text-4xl font-bold text-cyan-400">{value}</p>
                <p className="mt-3 text-sm text-slate-400">{detail}</p>
              </Link>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}

export default AdminDashboard;
