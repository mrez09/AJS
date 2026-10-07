import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  getAllOrders,
  updateOrderStatus,
} from "../services/orderService";

function AdminRequests() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  async function handleUpdateOrderStatus(orderId, status) {
    try {
      await updateOrderStatus(orderId, status);
      const data = await getAllOrders();
      setOrders(data);
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-white sm:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            AJS Admin Portal
          </p>
          <h1 className="text-3xl font-bold">Order Requests</h1>
          <p className="mt-2 text-slate-400">
            Manage order requests and commodity availability.
          </p>

          {loading && (
            <p className="mt-8 text-slate-400">Loading order requests...</p>
          )}
          {error && <p className="mt-8 text-red-400">{error}</p>}
          {!loading && !error && orders.length === 0 && (
            <p className="mt-8 text-slate-400">No order requests found.</p>
          )}
          {!loading && !error && orders.length > 0 && (
            <div className="mt-8 space-y-4">
              {orders.map((order) => (
                <article
                  key={order.ID}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">
                        Request #{order.ID}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-white">
                        {order.User.Name}
                      </h2>
                      <p className="text-sm text-slate-400">
                        {order.User.Email}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-cyan-400">
                      {order.Status}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {order.Items?.map((item) => (
                      <div
                        key={item.ID}
                        className="border-t border-slate-800 pt-3"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-medium text-white">
                              {item.Product.Name}
                            </p>
                            <p className="text-sm text-slate-400">
                              {item.Product.Grade} · {item.Product.Condition}
                            </p>
                          </div>
                          <p className="font-semibold text-white">
                            {item.Quantity} KG
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.Status === "Requested" && (
                      <div className="mt-5 flex gap-3 border-t border-slate-800 pt-5">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateOrderStatus(order.ID, "Confirmed")
                          }
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateOrderStatus(order.ID, "Rejected")
                          }
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default AdminRequests;
