const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export async function getProducts({ signal } = {}) {
  let response

  try {
    response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/api/products`, {
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    throw new Error(
      `Unable to reach the product API at ${API_BASE_URL}: ${error.message}`,
      { cause: error },
    )
  }

  if (!response.ok) {
    throw new Error(
      `The product API returned ${response.status} ${response.statusText}.`,
    )
  }

  let products
  try {
    products = await response.json()
  } catch (error) {
    throw new Error('The product API returned invalid JSON.', { cause: error })
  }

  if (products === null) {
    return []
  }

  if (!Array.isArray(products)) {
    throw new Error('The product API response must be an array of products.')
  }

  return products
}

export async function getProduct(id, { signal } = {}) {
  let response

  try {
    response = await fetch(
      `${API_BASE_URL.replace(/\/$/, '')}/api/products/${encodeURIComponent(id)}`,
      { signal },
    )
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    throw new Error(
      `Unable to reach the product API at ${API_BASE_URL}: ${error.message}`,
      { cause: error },
    )
  }

  if (!response.ok) {
    const error = new Error(
      `The product API returned ${response.status} ${response.statusText}.`,
    )
    error.status = response.status
    throw error
  }

  try {
    return await response.json()
  } catch (error) {
    throw new Error('The product API returned invalid JSON.', { cause: error })
  }
}
