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

export default api;