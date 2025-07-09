// src/services/reserva.service.js

import http from "../../shared/services/http-common.js";

export class ReservaService {
    // Punto de entrada a tu recurso “reservas” en el backend
    resourceEndpoint = "/api/reservas";

    /**
     * Obtiene todas las reservas (sin paginación).
     */
    getAll() {
        return http.get(this.resourceEndpoint);
    }

    /**
     * Obtiene una reserva por su ID
     * @param {string|number} id
     */
    getById(id) {
        return http.get(`${this.resourceEndpoint}/${id}`);
    }

    /**
     * Crea una nueva reserva en el backend.
     * @param {Object} reservaObject  Objeto con los campos de la reserva
     */
    create(reservaObject) {
        return http.post(this.resourceEndpoint, reservaObject);
    }

    /**
     * Actualiza una reserva existente.
     * @param {string|number} id
     * @param {Object} reservaObject  Objeto con los campos actualizados de la reserva
     */
    update(id, reservaObject) {
        return http.put(`${this.resourceEndpoint}/${id}`, reservaObject);
    }

    /**
     * Elimina una reserva por su ID
     * @param {string|number} id
     */
    delete(id) {
        return http.delete(`${this.resourceEndpoint}/${id}`);
    }

    /**
     * Puedes agregar métodos personalizados según tu API,
     * por ejemplo, buscar reservas por distribuidor o estado.
     */

    findByDistribuidor(idDistribuidor) {
        return http.get(`${this.resourceEndpoint}?idDistribuidor=${encodeURIComponent(idDistribuidor)}`);
    }

    findByEstado(estado) {
        return http.get(`${this.resourceEndpoint}?estado=${encodeURIComponent(estado)}`);
    }
}

export default new ReservaService();
