// src/services/order.service.js

import http from "../../shared/services/http-common.js";

export class OrderService {
    // Punto de entrada a tu recurso “orders” en el backend
    resourceEndpoint = "/api/orders";

    /**
     * Obtiene todas las órdenes (sin paginación).
     */
    getAll() {
        return http.get(this.resourceEndpoint);
    }

    /**
     * Obtiene una orden por su ID
     * @param {string|number} id
     */
    getById(id) {
        return http.get(`${this.resourceEndpoint}/${id}`);
    }

    /**
     * Crea una nueva orden en el backend.
     * @param {Object} ordenObject  Objeto con los campos de la orden
     */
    create(ordenObject) {
        return http.post(this.resourceEndpoint, ordenObject);
    }

    /**
     * Actualiza una orden existente.
     * @param {string|number} id
     * @param {Object} ordenObject  Objeto con los campos actualizados de la orden
     */
    update(id, ordenObject) {
        return http.put(`${this.resourceEndpoint}/${id}`, ordenObject);
    }

    /**
     * Elimina una orden por su ID
     * @param {string|number} id
     */
    delete(id) {
        return http.delete(`${this.resourceEndpoint}/${id}`);
    }

    /**
     * Buscar órdenes por ID de distribuidor
     * @param {string|number} idDistribuidor
     */
    findByDistribuidor(idDistribuidor) {
        return http.get(`${this.resourceEndpoint}?idDistribuidor=${encodeURIComponent(idDistribuidor)}`);
    }

    /**
     * Buscar órdenes por estado
     * @param {string} estado
     */
    findByEstado(estado) {
        return http.get(`${this.resourceEndpoint}?estado=${encodeURIComponent(estado)}`);
    }
}

export default new OrderService();
