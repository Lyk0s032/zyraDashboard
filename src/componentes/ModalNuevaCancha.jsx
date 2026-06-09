import { useState } from 'react';

function ModalNuevaCancha({ complejoId, onClose, onGuardar }) {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo_deporte: '',
    precio_hora: '',
    descripcion: '',
    state: 'DISPONIBLE'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deportes = [
    'Fútbol',
    'Fútbol 5',
    'Fútbol 7',
    'Fútbol 11',
    'Básquetbol',
    'Vóley',
    'Tenis',
    'Pádel',
    'Squash',
    'Otro'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.nombre.trim()) {
      setError('El nombre de la cancha es obligatorio');
      return;
    }
    if (!formData.tipo_deporte) {
      setError('Debes seleccionar un tipo de deporte');
      return;
    }
    if (!formData.precio_hora || parseFloat(formData.precio_hora) <= 0) {
      setError('El precio por hora debe ser mayor a 0');
      return;
    }

    setLoading(true);
    try {
      const datosCancha = {
        complejo_id: complejoId,
        nombre: formData.nombre,
        tipo_deporte: formData.tipo_deporte,
        precio_hora: parseFloat(formData.precio_hora),
        descripcion: formData.descripcion || null,
        state: formData.state
      };
      await onGuardar(datosCancha);
    } catch (err) {
      setError(err.message || 'Error al crear la cancha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '30px',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        width: '90%'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0 }}>Nueva Cancha</h2>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{
            padding: '15px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '5px',
            marginBottom: '20px',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
              Nombre de la Cancha *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Cancha 1, Cancha Principal"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
              Tipo de Deporte *
            </label>
            <select
              name="tipo_deporte"
              value={formData.tipo_deporte}
              onChange={handleChange}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '14px',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
            >
              <option value="">Selecciona un deporte</option>
              {deportes.map((deporte) => (
                <option key={deporte} value={deporte}>
                  {deporte}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
              Precio por Hora *
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#666'
              }}>
                $
              </span>
              <input
                type="number"
                name="precio_hora"
                value={formData.precio_hora}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 25px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
              Descripción (opcional)
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Agrega detalles sobre la cancha..."
              rows="4"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '14px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
              Estado
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '14px',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
            >
              <option value="DISPONIBLE">Disponible</option>
              <option value="MANTENIMIENTO">En Mantenimiento</option>
              <option value="NO_DISPONIBLE">No Disponible</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '30px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Creando...' : 'Crear Cancha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalNuevaCancha;
