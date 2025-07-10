<template>
  <div class="fondo-morado">
    <div class="card-contenedor">
      <pv-button icon="pi pi-arrow-left" class="p-button-text flecha-volver" @click="volverAtras" />
      <h1 class="titulo">Órdenes del Distribuidor</h1>

      <pv-data-table :value="ordenes" :paginator="true" :rows="10">
        <pv-column field="id" header="ID" />
        <pv-column field="idLote" header="ID Lote" />
        <pv-column field="fechaPedido" header="Fecha de Pedido">
          <template #body="slotProps">
            {{ formatFecha(slotProps.data.fechaPedido) }}
          </template>
        </pv-column>

        <!-- ✅ Mostramos la cantidad directamente como Precio Final -->
        <pv-column field="cantidad" header="Precio Final">
          <template #body="slotProps">
            S/ {{ slotProps.data.cantidad?.toFixed(2) }}
          </template>
        </pv-column>

        <pv-column field="estado" header="Estado" />
        <pv-column header="Acción" :exportable="false">
          <template #body="slotProps">
            <div class="acciones">
              <pv-button label="Cod. prom" class="p-button-sm p-button-warning mr-2"
                         :disabled="slotProps.data.codigoPromoAplicado"
                         @click="abrirCodigoPromo(slotProps.data)" />

              <pv-button label="Pagar" class="p-button-sm p-button-success"
                         :disabled="slotProps.data.estado === 'Pagado'"
                         @click="pagarOrden(slotProps.data)" />
            </div>

            <div v-if="ordenConPromo && ordenConPromo.id === slotProps.data.id" class="promo-box mt-2">
              <pv-input-text v-model="codigoPromo" placeholder="Ingrese código" class="mr-2" />
              <pv-button label="Aplicar" class="p-button-sm" @click="aplicarPromo(slotProps.data)" />
              <button class="cerrar-btn" @click="cerrarPromo">✖</button>
            </div>

            <div v-if="ordenSeleccionada && ordenSeleccionada.id === slotProps.data.id" class="paypal-box">
              <button class="cerrar-btn" @click="cerrarPaypal">✖</button>
              <div :id="`paypal-button-container-${slotProps.data.id}`" class="mt-2"></div>
            </div>
          </template>
        </pv-column>
      </pv-data-table>
    </div>
  </div>
</template>

<script>
import OrderService from "../services/order.service.js";
import PromotionService from "../services/promotion.service.js";

export default {
  props: ['id'],
  data() {
    return {
      ordenes: [],
      ordenSeleccionada: null,
      ordenConPromo: null,
      codigoPromo: '',
    };
  },
  methods: {
    async fetchOrdenesDistribuidor(idDistribuidor) {
      try {
        const response = await OrderService.findByDistribuidor(idDistribuidor);

        // ✅ Aplicamos la multiplicación directa por 150
        const ordenesCalculadas = response.data.map(orden => ({
          ...orden,
          cantidad: +(orden.cantidad * 150).toFixed(2)
        }));

        this.ordenes = ordenesCalculadas;
      } catch (error) {
        console.error("Error al obtener órdenes del distribuidor:", error);
      }
    },
    volverAtras() {
      this.$router.go(-1);
    },
    formatFecha(fechaStr) {
      if (!fechaStr) return "";
      const fecha = new Date(fechaStr);
      return `${fecha.getDate().toString().padStart(2, "0")}/${(fecha.getMonth() + 1).toString().padStart(2, "0")}/${fecha.getFullYear()}`;
    },
    cerrarPaypal() {
      const containerId = `paypal-button-container-${this.ordenSeleccionada?.id}`;
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = "";
      this.ordenSeleccionada = null;
    },
    pagarOrden(orden) {
      this.ordenSeleccionada = orden;
      this.$nextTick(() => {
        const containerId = `paypal-button-container-${orden.id}`;
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = "";

        paypal.Buttons({
          createOrder: function (data, actions) {
            return actions.order.create({
              purchase_units: [{ amount: { value: orden.cantidad?.toFixed(2) || '0.00' } }]
            });
          },
          onApprove: async (data, actions) => {
            return actions.order.capture().then(async (details) => {
              alert(`✅ Pago completado por ${details.payer.name.given_name}`);
              try {
                const ordenActualizada = { ...orden, estado: "Pagado" };
                await OrderService.update(orden.id, ordenActualizada);
                orden.estado = "Pagado";
                this.ordenSeleccionada = null;
              } catch (error) {
                console.error("❌ Error actualizando estado:", error);
                alert("El pago se procesó, pero no se pudo actualizar el estado.");
              }
            });
          }
        }).render(`#${containerId}`);
      });
    },
    abrirCodigoPromo(orden) {
      this.ordenConPromo = orden;
      this.codigoPromo = '';
    },
    cerrarPromo() {
      this.ordenConPromo = null;
      this.codigoPromo = '';
    },
    async aplicarPromo(orden) {
      if (!this.codigoPromo.trim()) return alert("Ingrese un código");

      try {
        const promoResponse = await PromotionService.findByCodigo(this.codigoPromo.trim());
        const promociones = promoResponse.data;

        if (!promociones.length) return alert("❌ Código no válido");

        const promo = promociones[0];
        const descuentoDecimal = promo.descuento / 100;
        const precioOriginal = orden.cantidad;
        const nuevoPrecio = +(precioOriginal * (1 - descuentoDecimal)).toFixed(2);

        const ordenActualizada = {
          ...orden,
          cantidad: nuevoPrecio,
          codigoPromoAplicado: true,
        };

        await OrderService.update(orden.id, ordenActualizada);

        orden.cantidad = nuevoPrecio;
        orden.codigoPromoAplicado = true;

        alert(`✅ Código aplicado. Nuevo precio: S/ ${nuevoPrecio}`);
        this.cerrarPromo();

      } catch (error) {
        console.error("❌ Error al aplicar promoción:", error);
        alert("Error al aplicar código promocional");
      }
    }
  },
  mounted() {
    if (!this.id) {
      alert("ID de distribuidor no proporcionado.");
      return;
    }
    this.fetchOrdenesDistribuidor(this.id);
  },
};
</script>

<style scoped>
.fondo-morado {
  background-color: #572364;
  min-height: 100vh;
  padding: 40px;
  box-sizing: border-box;
}
.card-contenedor {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}
.flecha-volver {
  position: absolute;
  top: 20px;
  left: 20px;
  color: #572364;
}
.titulo {
  text-align: center;
  margin-bottom: 30px;
  color: #6a0dad;
}
.promo-box,
.paypal-box {
  position: relative;
  margin-top: 10px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
}
.cerrar-btn {
  position: absolute;
  top: 2px;
  right: 6px;
  background: transparent;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #a00;
}
.acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}
</style>
