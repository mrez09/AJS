# AJS Assessment Demo Script

**Target duration: 7–8 minutes.** Use the demo database and demo accounts in `README.md`. Confirm the API and frontend are running before recording. Do not show `.env` files, tokens, or personal data.

## Before recording

- Start the Go API from `backend` and the Vite app from `frontend`.
- Confirm the product and demo-user seed data exist. Seeders do not reset existing data.
- Check that the selected Available commodities meet the intended request quantity and MOQ.
- Note the current stock values for the products you plan to use; the database may no longer contain seed quantities.
- Prepare two buyer requests if the demo will show both outcomes: one request to confirm and another to reject. The cart is cleared after successful request submission, so submit them separately.

## Timeline

### 0:00–0:45 — Introduce AJS and Home

“PT Altisan Jaya Sinergi operates in fish commodity trading and supply. This application helps business buyers review commodity specifications and submit procurement requests for Admin review.”

Show the Home hero, company overview/journey, and the What We Do section. Avoid presenting cold-storage, sourcing-capacity, or transaction figures unless the project owner has verified them against official material.

### 0:45–1:40 — Browse commodities

Open **Explore Commodities**. Show that the Home preview and catalog use current product data, then open an Available commodity detail page. Point out grade, origin, condition, current stock, MOQ, availability, and product image. Explain that stock and availability can change.

### 1:40–3:30 — Buyer cart and Request Order

Log in as `buyer@ajs.test`. Open the commodity detail page and add a valid quantity that satisfies MOQ and current stock. Show the cart, then submit **Request Order**. Explain that submission creates a request for review, not a payment.

For a second outcome, return to the catalog, add a different eligible commodity, and submit a second request. This keeps the requests separate so Admin can confirm one and reject the other.

Open **My Requests** briefly to show the submitted requests in `Requested` status.

### 3:30–6:20 — Admin review and stock behavior

Log out and sign in as `admin@ajs.test`. Open **Order Requests** and identify each request by its product and quantity.

Confirm the first request. Show that its status becomes `Confirmed`. Reject the second request and show `Rejected`. Only a still-`Requested` order can be transitioned.

Open **Commodities** and compare stock with the value noted before the demo. Confirming deducts the confirmed quantity; rejecting does not deduct stock. If the displayed value does not match the expected change, stop and inspect the demo database rather than claiming a successful stock update.

### 6:20–7:30 — Architecture and close

“The backend is a Go REST API using GORM with PostgreSQL, configured here for Neon. JWT and role middleware protect Buyer/Admin endpoints. The frontend is React with Vite, React Router, and Tailwind CSS. Commodity data and order actions use API services; uploaded JPEG/PNG images are stored on the backend's configured local directory. An order is a procurement request that requires Admin review, not an online payment.”

Thank the reviewers and stop before exceeding eight minutes.

## Demo fallback

If the live database or network is unavailable, do not invent successful API results. Show the available pages and explain which live action could not be completed. Keep a separate, verified demo database ready when possible.
