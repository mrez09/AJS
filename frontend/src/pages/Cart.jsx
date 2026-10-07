import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ArrowIcon from "../components/ArrowIcon.jsx";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import { deleteCartItem, getCart } from "../services/cartService";
import { createOrder } from "../services/orderService";

const quantityFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function formatQuantity(quantity) {
  return `${quantityFormatter.format(quantity)} KG`;
}

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const items = cart?.Items ?? [];

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadCart() {
      try {
        const data = await getCart();
        setCart(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, [setError, setLoading]);
  const totalQuantity = items.reduce((total, item) => total + item.Quantity, 0);

  console.log("CART FROM API:", cart);

  if (loading) {
    return (
      <div className="min-h-screen bg-white px-5 py-16 text-center text-[#102b45]">
        Loading cart...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white px-5 py-16 text-center text-red-600">
        {error}
      </div>
    );
  }

  async function handleRemoveItem(cartItemId) {
    try {
      await deleteCartItem(cartItemId);

      const data = await getCart();
      setCart(data);
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleRequestOrder() {
    if (items.length === 0 || submitting) {
      return;
    }

    const orderItems = items.map((item) => ({
      product_id: item.Product.ID,
      quantity: item.Quantity,
    }));

    try {
      setError("");
      setSuccessMessage("");
      setSubmitting(true);

      await createOrder(orderItems);

      const data = await getCart();
      setCart(data);

      setSuccessMessage("Your order request has been submitted successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#102b45]">
      <Navbar />

      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d7181]">
              Buyer Portal
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Request Cart
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Review the commodities and quantities you want to request before
              sending your order request to AJS.
            </p>
          </div>

          {items.length === 0 ? (
            <section className="mt-8 rounded-2xl border border-slate-200 bg-[#f8fafb] px-6 py-12 text-center">
              <h2 className="text-xl font-semibold">Your cart is empty</h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Browse our available commodities and add the products you need
                to your request cart.
              </p>

              <Link
                to="/commodities"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#102b45] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#174b68]"
              >
                Browse Commodities
                <ArrowIcon diagonal />
              </Link>

              {successMessage && (
                <div
                  role="status"
                  className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
                >
                  {successMessage}

                  <Link to="/buyer/orders" className="ml-2 font-bold underline">
                    View My Requests
                  </Link>
                </div>
              )}
            </section>
          ) : (
            <div className="mt-8 space-y-4">
              {items.map((item) => (
                <article
                  key={item.Product.ID}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0d7181]">
                        {item.Product.Grade}
                      </p>

                      <h2 className="mt-2 text-lg font-semibold">
                        {item.Product.Name}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.Product.Origin} · {item.Product.Condition}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs text-slate-500">
                        Requested quantity
                      </p>

                      <p className="mt-1 text-xl font-semibold">
                        {formatQuantity(item.Quantity)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Available:{" "}
                        {formatQuantity(item.Product.AvailableQuantity)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.ID)}
                      className="text-sm font-semibold text-red-600 transition-colors hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}

              <section className="rounded-2xl bg-[#f8fafb] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-600">
                    Total requested quantity
                  </span>

                  <span className="text-lg font-semibold">
                    {formatQuantity(totalQuantity)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleRequestOrder}
                  disabled={items.length === 0 || submitting}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#102b45] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#173d5f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Request Order"}
                  {!submitting && <ArrowIcon diagonal />}
                </button>

                <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                  Your request will be reviewed by the AJS team before it is
                  confirmed.
                </p>
              </section>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Cart;
