// src/services/lote.service.js


import http from "../../shared/services/http-common.js";

export class LoteService {
    // Punto de entrada a tu recurso “lotes” en el backend
    resourceEndpoint = "/api/lotes";

    /**
     * Obtiene todos los lotes (sin paginación).
     * Si necesitas paginar, podrías recibir page/size por parámetro
     * y concatenarlos a la URL (?page=1&size=10).
     */
    getAll() {
        return http.get(this.resourceEndpoint);
    }

    /**
     * Si quieres paginar:
     * getAllPaged(page, size) {
     *   return http.get(`${this.resourceEndpoint}?page=${page}&size=${size}`);
     * }
     */

    /**
     * Obtiene un lote por su ID
     * @param {string|number} id
     */
    getById(id) {
        return http.get(`${this.resourceEndpoint}/${id}`);
    }

    /**
     * Crea un nuevo lote en el backend.
     * @param {Object} loteObject  Objeto con los campos del lote (autor, dia, fecha, etc.)
     */
    create(loteObject) {
        return http.post(this.resourceEndpoint, loteObject);
    }

    /**
     * Actualiza un lote existente.
     * @param {string|number} id
     * @param {Object} loteObject  Objeto con los campos actualizados del lote
     */
    update(id, loteObject) {
        return http.put(`${this.resourceEndpoint}/${id}`, loteObject);
    }


    /**
     * Elimina un lote por su ID
     * @param {string|number} id
     */
    delete(id) {
        return http.delete(`${this.resourceEndpoint}/${id}`);
    }

    /**
     * Ejemplo de búsqueda por autor (o cualquier otro campo que soporte tu backend).
     * Ajusta el query string según tu API.
     * @param {string} autor
     */
    findByAutor(autor) {
        return http.get(`${this.resourceEndpoint}?autor=${encodeURIComponent(autor)}`);
    }

    /**
     * Otro ejemplo: filtrar por fecha (suponiendo que tu API acepte ?fecha=YYYY-MM-DD)
     * @param {string} fecha
     */
    findByFecha(fecha) {
        return http.get(`${this.resourceEndpoint}?fecha=${encodeURIComponent(fecha)}`);
    }
}

export default new LoteService();
