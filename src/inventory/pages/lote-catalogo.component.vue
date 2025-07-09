<template>
  <div class="fondo-morado">
    <div class="card-contenedor">
      <pv-button icon="pi pi-arrow-left" class="p-button-text flecha-volver" @click="volverAtras" />
      <h1 class="titulo">Catálogo de Lotes</h1>

      <!-- Filtros -->
      <div class="filtros mb-4 flex flex-wrap gap-4 items-end">
        <pv-input-number v-model="filtro.pesoMin" placeholder="Peso mínimo (kg)" :min="0" inputId="pesoMin" showButtons class="filtro-input" />
        <pv-input-number v-model="filtro.pesoMax" placeholder="Peso máximo (kg)" :min="0" inputId="pesoMax" showButtons class="filtro-input" />
        <pv-input-text v-model="filtro.calidad" placeholder="Buscar por calidad" inputId="calidad" class="filtro-input" />
        <pv-input-text v-model="filtro.tipo" placeholder="Buscar por tipo" inputId="tipo" class="filtro-input" />
        <div class="filtro-checkbox">
          <pv-checkbox v-model="filtroPorPromedio" binary inputId="filtroPromedio" class="mr-2" />
          <label for="filtroPromedio" style="color: black; font-weight: 500; cursor: pointer;">
            Mostrar lotes con calificación mayor o igual a 4
          </label>
        </div>
      </div>

      <div class="grid gap-4">
        <div v-for="lote in lotesFiltrados" :key="lote.id" class="card-lote p-4 border rounded-lg shadow-lg flex flex-col">
          <div class="icono-favorito" @click="toggleFavorito(lote)" @mouseover="hoverFavorito = lote.id" @mouseleave="hoverFavorito = null">
            <i class="pi" :class="[ lote.favorito ? 'pi-star-fill favorito' : 'pi-star', hoverFavorito === lote.id ? 'icono-hover' : '' ]"></i>
          </div>

          <div class="contenido-flex">
            <img :src="lote.imagenUrl || imagenDefault" alt="Imagen del lote" class="w-48 h-48 object-cover mr-4 rounded cursor-pointer" @click="mostrarImagen(lote.imagenUrl)" />

            <div class="info-lote">
              <h2 class="text-xl font-bold mb-2">{{ lote.tipo }}</h2>
              <p><strong>Precio Unitario:</strong> ${{ lote.precioUnitario }}</p>
              <p><strong>Peso (kg):</strong> {{ lote.pesoKg }}</p>
              <p><strong>Calidad:</strong> {{ lote.calidad }}</p>
              <p><strong>Estado:</strong> {{ lote.estado }}</p>
              <p><strong>Stock:</strong> {{ lote.stock }}</p>
              <p><strong>Promedio Reseñas:</strong> {{ (promediosPorLote[lote.id] || 0).toFixed(1) }} / 5</p>
              <p><strong>Fecha Registro:</strong> {{ formatearFecha(lote.fechaRegistro) }}</p>
            </div>
          </div>

          <div class="botones-lote">
            <button @click="reservarLote(lote)" class="btn-reservar" :disabled="lote.stock <= 0">Reservar</button>
            <button @click="verDetalles(lote)" class="btn-pedir">Ver detalles</button>
            <button @click="verResenas(lote)" class="btn-resena">Ver reseñas</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Diálogo de imagen -->
    <pv-dialog v-model:visible="imagenDialogVisible" modal :closable="true" class="dialogo-imagen">
      <img :src="imagenSeleccionada" alt="Imagen ampliada" class="imagen-ampliada" />
    </pv-dialog>

    <!-- Diálogo para reservar -->
    <pv-dialog v-model:visible="dialogoReservaVisible" header="Reservar Stock" modal>
      <div>
        <p><strong>Stock disponible:</strong> {{ loteSeleccionado?.stock }}</p>
        <pv-input-number v-model="stockAReservar" inputId="stock" :min="1" :max="loteSeleccionado?.stock" showButtons />
        <p v-if="mensajeError" class="mensaje-error">{{ mensajeError }}</p>
      </div>
      <template #footer>
        <pv-button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="dialogoReservaVisible = false" />
        <pv-button label="Reservar" icon="pi pi-check" class="p-button-text" @click="confirmarReserva" />
      </template>
    </pv-dialog>

    <!-- Diálogo de detalles -->
    <pv-dialog v-model:visible="dialogoDetallesVisible" header="Detalles del Lote" modal>
      <div v-if="loteSeleccionado">
        <img :src="loteSeleccionado.imagenUrl || imagenDefault" alt="Imagen del lote" class="w-full max-w-xs mx-auto rounded mb-4" />
        <p><strong>Autor:</strong> {{ loteSeleccionado.autor }}</p>
        <p><strong>Fecha de Registro:</strong> {{ loteSeleccionado.fechaRegistro }}</p>
        <p><strong>Hora:</strong> {{ loteSeleccionado.hora }}</p>
        <p><strong>Tipo:</strong> {{ loteSeleccionado.tipo }}</p>
        <p><strong>Precio Unitario:</strong> {{ loteSeleccionado.precioUnitario }}</p>
        <p><strong>Peso (kg):</strong> {{ loteSeleccionado.pesoKg }}</p>
        <p><strong>Calidad:</strong> {{ loteSeleccionado.calidad }}</p>
        <p><strong>Estado:</strong> {{ loteSeleccionado.estado }}</p>
        <p><strong>Stock:</strong> {{ loteSeleccionado.stock }}</p>
        <p><strong>Materia Orgánica:</strong> {{ loteSeleccionado.materiaOrganica }}</p>
        <p><strong>Cloruro de Potasio:</strong> {{ loteSeleccionado.cloruroPotasio }}</p>
        <p><strong>Fosfato:</strong> {{ loteSeleccionado.fosfato }}</p>
        <p><strong>Sulfato de Calcio:</strong> {{ loteSeleccionado.sulfatoCalcio }}</p>
        <p><strong>Urea:</strong> {{ loteSeleccionado.urea }}</p>
        <p><strong>Sulfato de Magnesio:</strong> {{ loteSeleccionado.sulfatoMagnesio }}</p>
        <p><strong>Correctores pH:</strong> {{ loteSeleccionado.correctoresPH }}</p>
      </div>
    </pv-dialog>
  </div>
</template>

<script>
import LoteService from "../services/lote.service.js";
import ReservaService from "../services/reserva.service.js";
import FavoritoService from "../services/favorito.service.js";
import { ReviewService } from "../services/review.service.js";
import {ReservaEntity} from "../model/reserva.entity.js";

export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      lotes: [],
      filtro: { pesoMin: null, pesoMax: null, calidad: "", tipo: "" },
      filtroPorPromedio: false,
      promediosPorLote: {},
      imagenDefault: "https://via.placeholder.com/192?text=Sin+imagen",
      imagenDialogVisible: false,
      imagenSeleccionada: "",
      hoverFavorito: null,
      dialogoReservaVisible: false,
      dialogoDetallesVisible: false,
      loteSeleccionado: null,
      stockAReservar: 1,
      mensajeError: "",
      reviewService: new ReviewService(),
    };
  },
  computed: {
    lotesFiltrados() {
      return this.lotes.filter((lote) => {
        const pesoOk = (!this.filtro.pesoMin || lote.pesoKg >= this.filtro.pesoMin)
            && (!this.filtro.pesoMax || lote.pesoKg <= this.filtro.pesoMax);
        const calidadOk = lote.calidad.toLowerCase().includes(this.filtro.calidad.toLowerCase().trim());
        const tipoOk = lote.tipo.toLowerCase().includes(this.filtro.tipo.toLowerCase().trim());
        const promedio = this.promediosPorLote[lote.id] || 0;
        const promedioOk = !this.filtroPorPromedio || (promedio >= 4 && promedio <= 5);
        return pesoOk && calidadOk && tipoOk && promedioOk;
      });
    },
  },
  methods: {
    formatearFecha(fechaISO) {
      if (!fechaISO) return "";
      const [anio, mes, dia] = fechaISO.split("T")[0].split("-");
      return `${dia}/${mes}/${anio}`;
    },
    async fetchLotes() {
      try {
        const response = await LoteService.getAll();
        this.lotes = response.data.filter((lote) => lote.stock > 0);
        for (const lote of this.lotes) {
          const res = await this.reviewService.getReviewsForLoteId(lote.id);
          const data = res.data;
          const prom = data.length ? data.reduce((acc,r) => acc + r.puntuacion, 0) / data.length : 0;
          this.promediosPorLote[lote.id] = prom;
        }
      } catch (error) {
        console.error("Error al cargar lotes:", error);
      }
    },
    volverAtras() {
      this.$router.go(-1);
    },
    reservarLote(lote) {
      if (lote.stock <= 0) return;
      this.loteSeleccionado = lote;
      this.stockAReservar = 1;
      this.mensajeError = "";
      this.dialogoReservaVisible = true;
    },
    async confirmarReserva() {
      const lote = this.loteSeleccionado;
      const cantidad = this.stockAReservar;
      if (!lote || cantidad < 1 || cantidad > lote.stock) {
        this.mensajeError = "Cantidad inválida.";
        return;
      }
      try {
        const hoy = new Date().toISOString().split("T")[0];
        const reserva = new ReservaEntity({
          idLote: lote.id,
          idDistribuidor: this.id,
          fechaRegistro: hoy,
          stock: cantidad,
          estado: "pendiente"
        });

// Verifica en consola el objeto final (opcional)
        console.log("Reserva a enviar:", reserva);

        await ReservaService.create(reserva);
        await ReservaService.create(reserva);
        await LoteService.update(lote.id, { ...lote, stock: lote.stock - cantidad });
        this.dialogoReservaVisible = false;
        await this.fetchLotes();
        alert("Reserva creada exitosamente.");
      } catch (error) {
        console.error("Error al crear la reserva:", error);
        this.mensajeError = "Error al crear la reserva.";
      }
    },
    verResenas(lote) {
      this.$router.push({ name: "review", params: { id: lote.id } });
    },
    async toggleFavorito(lote) {
      try {
        const res = await FavoritoService.getAll();
        const favoritos = res.data || [];
        const yaExiste = favoritos.some(f => f.idLote === lote.id && f.idDistribuidor === this.id);
        if (yaExiste) {
          alert("Este lote ya está en tus favoritos.");
          return;
        }
        await FavoritoService.create({
          idLote: lote.id,
          idDistribuidor: this.id, // <=== aquí también string
        });
        lote.favorito = true;
        alert("Lote agregado a favoritos.");
      } catch (error) {
        console.error("Error al agregar a favoritos:", error);
        alert("Error al agregar a favoritos.");
      }
    },
    mostrarImagen(url) {
      this.imagenSeleccionada = url || this.imagenDefault;
      this.imagenDialogVisible = true;
    },
    verDetalles(lote) {
      this.loteSeleccionado = lote;
      this.dialogoDetallesVisible = true;
    },
  },
  mounted() {
    this.fetchLotes();
  },
};

</script>



<style scoped>
.fondo-morado {
  background-color: #572364;
  min-height: 100vh;
  padding: 2rem;
  color: black;
}

.card-contenedor {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  width: 100%;
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
  margin-bottom: 2rem;
  color: #6a0dad;
}

.filtros {
  margin-bottom: 1rem;
}

.filtro-input {
  min-width: 150px;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.card-lote {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 1rem;
  transition: transform 0.2s ease;
  position: relative;
  height: auto;
  flex: 1 1 calc(100% - 2rem);
  max-width: 100%;
}

.card-lote:hover {
  transform: scale(1.01);
}

.contenido-flex {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.card-lote img {
  border-radius: 8px;
  object-fit: cover;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}

.info-lote {
  flex: 1 1 auto;
  max-width: calc(100% - 160px);
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  letter-spacing: 0.02em;
  word-spacing: 0.1em;
}

.info-lote h2 {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
  color: #6a0dad;
}

.botones-lote {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.5rem;
  gap: 0.5rem;
}

.btn-reservar,
.btn-pedir {
  background-color: #6a0dad;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.8rem;
  cursor: pointer;
  flex: 1;
  text-align: center;
}

.btn-reservar[disabled] {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-reservar:hover:not([disabled]),
.btn-pedir:hover {
  background-color: #520a8a;
}

.icono-favorito {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.4rem;
  cursor: pointer;
}

.icono-favorito .pi {
  color: #ccc;
}

.icono-favorito .favorito {
  color: gold;
}

.icono-hover {
  transform: scale(1.2);
  color: gold !important;
}

.dialogo-imagen {
  max-width: 90vw;
}

.imagen-ampliada {
  max-width: 100%;
  display: block;
  margin: auto;
}

.mensaje-error {
  color: red;
  margin-top: 0.5rem;
}

/* 📱 RESPONSIVE BREAKPOINTS */

@media (min-width: 600px) {
  .card-lote {
    flex: 1 1 calc(50% - 1rem);
    max-width: calc(50% - 1rem);
  }
}

@media (min-width: 900px) {
  .card-lote {
    flex: 1 1 calc(33.33% - 1rem);
    max-width: calc(33.33% - 1rem);
  }
}


</style>
