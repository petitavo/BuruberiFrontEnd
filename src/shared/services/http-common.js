// src/shared/services/http-common.js
import axios from "axios";

const JSON_SERVER_BASE = "https://db-buruberi-git-main-angelos-projects-ee7d4e1e.vercel.app";
const BACKEND_ROOT = "https://buruberi.canadacentral.cloudapp.azure.com";

// Mapa de rutas que deben ir al backend real y su prefijo correspondiente
const backendRoutes = {
    "/api/orders": "/order",
    "/auth": "/auth",
    "/iam": "/iam",
    "/api/lotes": "/inventory",
    "/api/mensajes": "/communication",
    "/api/reservas": "/inventory",
    "/api/v1/review": "/review",
};


const http = axios.create();

http.interceptors.request.use((config) => {
    const resource = config.url || "";

    // Ordena de mayor a menor longitud para que coincida con rutas más específicas primero
    const matchedRoute = Object.keys(backendRoutes)
        .sort((a, b) => b.length - a.length)
        .find((prefix) => resource.startsWith(prefix));

    // DEBUG
    console.log("🛠 URL solicitada:", resource);
    console.log("➡️ Usará backend?", matchedRoute ? "SÍ ✅" : "NO ❌");
    console.log("➡️ URL final:", (matchedRoute ? `${BACKEND_ROOT}${backendRoutes[matchedRoute]}` : JSON_SERVER_BASE) + resource);

    // Asignar baseURL final
    if (matchedRoute) {
        config.baseURL = `${BACKEND_ROOT}${backendRoutes[matchedRoute]}`;
    } else {
        config.baseURL = JSON_SERVER_BASE;
    }

    config.headers["Content-Type"] = "application/json";
    return config;
});

export default http;
