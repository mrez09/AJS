import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { getOrders } from "../services/orderService";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
            Buyer Portal
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#102b45]">
            My Requests
          </h1>

          <p className="mt-3 text-slate-500">
            Track your submitted order requests.
          </p>

          {loading && (
            <p className="mt-10 text-slate-500">Loading requests...</p>
          )}

          {error && <p className="mt-10 text-red-600">{error}</p>}

          {!loading && !error && orders.length === 0 && (
            <p className="mt-10 text-slate-500">
              You have no order requests yet.
            </p>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="mt-10 space-y-5">
              {orders.map((order) => (
                <div
                  key={order.ID}
                  className="rounded-xl border border-slate-200 p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">
                        Request #{order.ID}
                      </p>

                      <h2 className="mt-1 font-semibold text-[#102b45]">
                        Order Request
                      </h2>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-[#102b45]">
                      {order.Status}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {order.Items?.map((item) => (
                      <div
                        key={item.ID}
                        className="flex items-center justify-between border-t border-slate-100 pt-3"
                      >
                        <div>
                          <p className="font-medium text-[#102b45]">
                            {item.Product.Name}
                          </p>

                          <p className="text-sm text-slate-500">
                            {item.Product.Grade} · {item.Product.Condition}
                          </p>
                        </div>

                        <p className="font-semibold text-[#102b45]">
                          {item.Quantity} KG
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Orders;
