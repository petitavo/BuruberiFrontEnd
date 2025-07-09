export class ReservaEntity {
    constructor({
                    id = null,
                    idDistribuidor = null,
                    idLote = null,
                    idProductor = "999", // Valor genérico por defecto
                    fechaRegistro = null,
                    stock = 0,
                    estado = "Pendiente",
                } = {}) {
        this.id = id;
        this.idDistribuidor = idDistribuidor;
        this.idLote = idLote?.toString(); // Convertir a string si es necesario
        this.idProductor = idProductor;
        this.fechaRegistro = fechaRegistro ? new Date(fechaRegistro) : new Date();
        this.stock = stock;
        this.estado = estado;
    }
}
