import axiosInstance from './axiosConfig';

export const complejosService = {
  obtenerTodos: async () => {
    const response = await axiosInstance.get('/api/explorar/complejos');
    return response.data;
  },

  obtenerPorId: async (id) => {
    const response = await axiosInstance.get(`/api/complexes/${id}`);
    return response.data;
  }
};

export const horariosService = {
  obtener: async (complejoId) => {
    const response = await axiosInstance.get(`/api/complexes/${complejoId}/horarios`);
    return response.data;
  },

  configurarPersonalizado: async (complejoId, horarios, token) => {
    const response = await axiosInstance.post(
      `/api/complexes/${complejoId}/horarios`,
      { horarios },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  configurarEstandar: async (complejoId, horariosData, token) => {
    const response = await axiosInstance.post(
      `/api/complexes/${complejoId}/horarios/estandar`,
      horariosData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  actualizarEstadoDia: async (complejoId, dia, estaCerrado, token) => {
    const response = await axiosInstance.patch(
      `/api/complexes/${complejoId}/horarios/${dia}`,
      { esta_cerrado: estaCerrado },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  eliminar: async (complejoId, token) => {
    const response = await axiosInstance.delete(
      `/api/complexes/${complejoId}/horarios`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
};

export const canchasService = {
  obtenerPorComplejo: async (complejoId) => {
    const response = await axiosInstance.get(`/api/courts/complex/${complejoId}`);
    return response.data;
  },

  obtenerPorId: async (canchaId) => {
    const response = await axiosInstance.get(`/api/courts/${canchaId}`);
    return response.data;
  },

  crear: async (canchaData, token) => {
    const response = await axiosInstance.post(
      '/api/courts',
      canchaData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  actualizar: async (canchaId, canchaData, token) => {
    const response = await axiosInstance.put(
      `/api/courts/${canchaId}`,
      canchaData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  eliminar: async (canchaId, token) => {
    const response = await axiosInstance.delete(
      `/api/courts/${canchaId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
};

export const preciosCanchaService = {
  obtener: async (canchaId) => {
    const response = await axiosInstance.get(`/api/courts/${canchaId}/precios`);
    return response.data;
  },

  configurar: async (canchaId, precios, token) => {
    const response = await axiosInstance.post(
      `/api/courts/${canchaId}/precios`,
      { precios },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  actualizarFranja: async (canchaId, precioId, datos, token) => {
    const response = await axiosInstance.put(
      `/api/courts/${canchaId}/precios/${precioId}`,
      datos,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  eliminarFranja: async (canchaId, precioId, token) => {
    const response = await axiosInstance.delete(
      `/api/courts/${canchaId}/precios/${precioId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  eliminarTodos: async (canchaId, token) => {
    const response = await axiosInstance.delete(
      `/api/courts/${canchaId}/precios`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
};

export const excepcionesService = {
  obtener: async (complejoId, filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.desde) params.append('desde', filtros.desde);
    if (filtros.hasta) params.append('hasta', filtros.hasta);
    if (filtros.solo_festivos) params.append('solo_festivos', 'true');
    if (filtros.solo_cerrados) params.append('solo_cerrados', 'true');
    
    const url = `/api/complexes/${complejoId}/excepciones${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  obtenerPorFecha: async (complejoId, fecha) => {
    const response = await axiosInstance.get(`/api/complexes/${complejoId}/excepciones/${fecha}`);
    return response.data;
  },

  agregar: async (complejoId, excepcion, token) => {
    const response = await axiosInstance.post(
      `/api/complexes/${complejoId}/excepciones`,
      excepcion,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  agregarMasivas: async (complejoId, excepciones, token) => {
    const response = await axiosInstance.post(
      `/api/complexes/${complejoId}/excepciones/bulk`,
      { excepciones },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  actualizar: async (complejoId, fecha, datos, token) => {
    const response = await axiosInstance.put(
      `/api/complexes/${complejoId}/excepciones/${fecha}`,
      datos,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  eliminar: async (complejoId, fecha, token) => {
    const response = await axiosInstance.delete(
      `/api/complexes/${complejoId}/excepciones/${fecha}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
};

export const reservasService = {
  obtenerPorComplejo: async (complejoId, filtros = {}, token) => {
    const params = new URLSearchParams();
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    const url = `/api/reservas/complejo/${complejoId}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await axiosInstance.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
    return response.data;
  },

  obtenerPorCancha: async (canchaId, filtros = {}, token) => {
    const params = new URLSearchParams();
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    const url = `/api/reservas/cancha/${canchaId}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await axiosInstance.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
    return response.data;
  },

  getDisponibilidad: async (canchaId, fecha) => {
    const response = await axiosInstance.get(`/api/reservas/disponibilidad/${canchaId}?fecha=${fecha}`);
    return response.data;
  },

  mover: async (reservaId, datos, token) => {
    const response = await axiosInstance.patch(
      `/api/reservas/${reservaId}/mover`,
      datos,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.data;
  },

  registrarPagoTotal: async (reservaId, datos = {}, token) => {
    const response = await axiosInstance.patch(
      `/api/reservas/${reservaId}/pago-total`,
      datos,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.data;
  },

  cancelar: async (reservaId, token) => {
    const response = await axiosInstance.patch(
      `/api/reservas/${reservaId}/cancelar`,
      {},
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.data;
  }
};

export default {
  complejos: complejosService,
  horarios: horariosService,
  canchas: canchasService,
  precios: preciosCanchaService,
  excepciones: excepcionesService,
  reservas: reservasService
};
