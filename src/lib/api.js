import axios from 'axios';

const api = axios.create({
    baseURL: "/api"
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export async function login(username, password) {
    const { data } = await api.post("/auth/login", { username, password });
    return data; // { access, refresh }
}

export async function refresh(refreshToken) {
    const { data } = await api.post("/auth/refresh", { refresh: refreshToken });
    return data; // { access }
}

export async function register(payload) {
    const { data } = await api.post("/auth/register", payload);
    return data;
}

export async function getMe() {
    const { data } = await api.get("/me");
    return data;
}

// ---- PROVIDERS CRUD ----
// List providers with optional search/order/pagination
export async function listProviders({ search = "", ordering = "name", page = 1 }) {
    const params = {};
    if (search) params.search = search
    if (ordering) params.ordering = ordering
    if (page) params.page = page

    const { data } = await api.get("/providers/", { params });
    return data;
}

export async function createProvider(payload) {
    const { data } = await api.post("/providers/", payload);
    return data;
}

export async function updateProvider(id, payload) {
    const { data } = await api.patch(`/providers/${id}`, payload);
    return data;
}

export async function deleteProvider(id) {
    await api.delete(`/providers/${id}`);
    return true;

}

// ----------------------- SUBSCRIPTIONS CRUD -----------------------
export async function listSubscriptions({ provider = "", due_in_days = "", ordering = "next_renewal_date", page = 1 } = {}) {
    const params = {};
    if (provider) params.provider = provider;
    if (due_in_days) params.due_in_days = due_in_days;
    if (ordering) params.ordering = ordering
    if (page) params.page = page;

    const { data } = await api.get("/subscriptions/", { params });
    return data;
}

export async function createSubscription(payload) {
    const { data } = await api.post("/subscriptions/", payload);
    return data;
}

export async function updateSubscription(id, payload) {
    const { data } = await api.patch(`/subscriptions/${id}`, payload);
    return data;
}

export async function deleteSubscription(id) {
    await api.delete(`/subscriptions/${id}`)
    return true;
}

export default api;