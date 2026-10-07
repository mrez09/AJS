import { apiRequest } from "./apiService";

export async function getOrders() {
  return apiRequest("/api/orders");
}

export async function createOrder(items) {
  return apiRequest("/api/orders", {
    method: "POST",
    body: JSON.stringify({
      items,
    }),
  });
}

export async function getAllOrders() {
  return apiRequest("/api/admin/orders");
}

export async function updateOrderStatus(orderId, status) {
  return apiRequest(`/api/admin/orders/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify({
      status,
    }),
  });
}
