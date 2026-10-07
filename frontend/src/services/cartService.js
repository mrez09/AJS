import { apiRequest } from "./apiService";

export async function getCart() {
  return apiRequest("/api/cart");
}

export async function addCartItem(productId, quantity) {
  return apiRequest("/api/cart/items", {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      quantity,
    }),
  });
}

export async function deleteCartItem(cartItemId) {
  return apiRequest(`/api/cart/items/${cartItemId}`, {
    method: "DELETE",
  });
}