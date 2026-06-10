// Centralized HTTP client.
// - Injects JWT automatically on every request
// - Translates backend errors into structured objects  { message, fields }
// - Triggers logout on 401 (token expired / invalid)

const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api';

function getToken() {
  try {
    const raw = localStorage.getItem('afrishop_auth');
    return raw ? JSON.parse(raw)?.state?.token : null;
  } catch {
    return null;
  }
}

function buildHeaders(extra = {}) {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function parseError(res) {
  let body = {};
  try { body = await res.json(); } catch { /* empty body */ }

  // Field-level errors from Symfony validator  { errors: { email: '…' } }
  if (body.errors && typeof body.errors === 'object') {
    return { message: 'Validation failed', fields: body.errors };
  }

  // Single error string
  const message =
    body.error ||
    body.message ||
    body.detail ||           // API Platform uses "detail"
    `HTTP ${res.status}`;

  return { message, fields: {} };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: buildHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  // 401 → token expired/invalid → force logout without circular import
  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('afrishop:unauthorized'));
  }

  if (!res.ok) {
    const err = await parseError(res);
    const error = new Error(err.message);
    error.fields = err.fields;
    error.status = res.status;
    throw error;
  }

  // 204 No Content
  if (res.status === 204) return null;

  return res.json();
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  patch:  (path, body)  => request('PATCH',  path, body),
  delete: (path)        => request('DELETE', path),
};

// ── Auth endpoints ───────────────────────────────────────────
export const authApi = {
  login(email, password) {
    return api.post('/auth/login', { email, password });
  },
  register(email, password, fullName) {
    return api.post('/auth/register', { email, password, fullName });
  },
  me() {
    return api.get('/auth/me');
  },
  updateProfile(data) {
    return api.put('/auth/profile', data);
  },
};

// ── Product endpoints ────────────────────────────────────────
export const productsApi = {
  list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/products${qs ? `?${qs}` : ''}`);
  },
  get(id) {
    return api.get(`/products/${id}`);
  },
  byCategory(category) {
    return api.get(`/products/category/${category}`);
  },
};

// ── Order endpoints ──────────────────────────────────────────
export const ordersApi = {
  list()       { return api.get('/orders'); },
  get(id)      { return api.get(`/orders/${id}`); },
  create(body) { return api.post('/orders', body); },
};

// ── Admin endpoints ──────────────────────────────────────────
export const adminApi = {
  stats() { return api.get('/admin/stats'); },
  orders(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/admin/orders${qs ? `?${qs}` : ''}`);
  },
  updateOrderStatus(id, status) { return api.patch(`/admin/orders/${id}/status`, { status }); },
  createProduct(data)     { return api.post('/products', data); },
  updateProduct(id, data) { return api.put(`/products/${id}`, data); },
  deleteProduct(id)       { return api.delete(`/products/${id}`); },
  users(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/admin/users${qs ? `?${qs}` : ''}`);
  },
  updateUserRole(id, action) { return api.patch(`/admin/users/${id}/role`, { action }); },
};
