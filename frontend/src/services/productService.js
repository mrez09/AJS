import { apiRequest } from "./apiService";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function getProducts({ signal } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/api/products`, {
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new Error(
      `Unable to reach the product API at ${API_BASE_URL}: ${error.message}`,
      { cause: error },
    );
  }

  if (!response.ok) {
    throw new Error(
      `The product API returned ${response.status} ${response.statusText}.`,
    );
  }

  let products;
  try {
    products = await response.json();
  } catch (error) {
    throw new Error("The product API returned invalid JSON.", { cause: error });
  }

  if (products === null) {
    return [];
  }

  if (!Array.isArray(products)) {
    throw new Error("The product API response must be an array of products.");
  }

  return products;
}

export async function getProduct(id, { signal } = {}) {
  let response;

  try {
    response = await fetch(
      `${API_BASE_URL.replace(/\/$/, "")}/api/products/${encodeURIComponent(id)}`,
      { signal },
    );
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new Error(
      `Unable to reach the product API at ${API_BASE_URL}: ${error.message}`,
      { cause: error },
    );
  }

  if (!response.ok) {
    const error = new Error(
      `The product API returned ${response.status} ${response.statusText}.`,
    );
    error.status = response.status;
    throw error;
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error("The product API returned invalid JSON.", { cause: error });
  }
}

export async function updateProductAvailability(
  productId,
  availableQuantity,
  status,
) {
  return apiRequest(`/api/admin/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify({
      available_quantity: availableQuantity,
      status,
    }),
  });
}

export async function createProduct(product) {
	const formData = new FormData();
	formData.append("name", product.name);
	formData.append("origin", product.origin);
	formData.append("grade", product.grade);
	formData.append("condition", product.condition);
	formData.append("available_quantity", String(product.availableQuantity));
	formData.append("moq", String(product.moq));
	formData.append("description", product.description || "");
	formData.append("image", product.image || "");
	formData.append("status", product.status);
	if (product.imageFile) {
		formData.append("image_file", product.imageFile);
	}

  return apiRequest("/api/admin/products", {
    method: "POST",
    body: formData,
  });
}

export async function updateProduct(productId, product) {
  const formData = new FormData();
  formData.append("name", product.name);
  formData.append("origin", product.origin);
  formData.append("grade", product.grade);
  formData.append("condition", product.condition);
  formData.append("available_quantity", String(product.availableQuantity));
  formData.append("moq", String(product.moq));
  formData.append("description", product.description || "");
  formData.append("status", product.status);
  if (product.imageFile) formData.append("image_file", product.imageFile);

  return apiRequest(`/api/admin/products/${encodeURIComponent(productId)}`, {
    method: "PUT",
    body: formData,
  });
}
