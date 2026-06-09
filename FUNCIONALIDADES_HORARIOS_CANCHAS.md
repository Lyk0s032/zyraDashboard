# Gestión de Horarios y Canchas - Dashboard Zyra

## Funcionalidades Implementadas

### 1. Configuración de Horarios del Complejo

Se ha implementado un sistema completo para gestionar los horarios de apertura y cierre de los complejos deportivos.

#### Características:

- **Dos Modos de Configuración:**
  - **Horario Estándar:** Configura rápidamente con 3 grupos de horarios (Lun-Vie, Sábado, Domingo)
  - **Horario Personalizado:** Configura cada día de la semana individualmente

- **Visualización de Horarios:**
  - Muestra todos los días de la semana con sus horarios
  - Indica claramente qué días están cerrados
  - Permite ver el horario de apertura y cierre de cada día

- **Edición de Horarios:**
  - Botón para configurar horarios nuevos o editar existentes
  - Modal intuitivo con formularios para ambos modos
  - Botones individuales para cerrar/abrir días específicos

#### Endpoints Utilizados:

- `POST /api/complexes/:id/horarios/estandar` - Configurar horario estándar
- `POST /api/complexes/:id/horarios` - Configurar horario personalizado
- `GET /api/complexes/:id/horarios` - Obtener horarios (ya incluido en el detalle del complejo)
- `PATCH /api/complexes/:id/horarios/:dia` - Marcar día como cerrado/abierto
- `DELETE /api/complexes/:id/horarios` - Eliminar todos los horarios

### 2. Gestión de Canchas

Se ha implementado la capacidad de agregar nuevas canchas al complejo.

#### Características:

- **Crear Nueva Cancha:**
  - Formulario completo para agregar canchas
  - Validación de campos obligatorios
  - Selección de tipo de deporte desde un listado predefinido
  - Configuración de precio por hora
  - Estado inicial de la cancha (Disponible, En Mantenimiento, No Disponible)

- **Visualización de Canchas:**
  - Grid responsive con todas las canchas del complejo
  - Muestra información relevante: nombre, deporte, precio, estado
  - Botón de reservar (habilitado solo si está disponible)

- **Estado Vacío:**
  - Mensaje amigable cuando no hay canchas
  - Invita al usuario a crear la primera cancha

#### Endpoints Utilizados:

- `POST /api/canchas` - Crear nueva cancha
- Las canchas se cargan automáticamente con el detalle del complejo

### 3. Archivos Creados/Modificados

#### Archivos Nuevos:

1. **`src/componentes/ModalHorarios.jsx`**
   - Componente modal para configurar horarios
   - Maneja modo estándar y personalizado
   - Interfaz intuitiva con inputs de tiempo

2. **`src/componentes/ModalNuevaCancha.jsx`**
   - Componente modal para crear nuevas canchas
   - Formulario con validación
   - Lista de deportes predefinidos

#### Archivos Modificados:

1. **`src/api/services.js`**
   - Agregado `horariosService` con todos los métodos CRUD
   - Actualizado `canchasService` con método `crear`

2. **`src/componentes/DetalleComplejo.jsx`**
   - Integración de modales
   - Botones de acción para horarios y canchas
   - Funciones para guardar horarios y canchas
   - Función para abrir/cerrar días específicos
   - Mejoras en la UI para estados vacíos

### 4. Uso de la Aplicación

#### Configurar Horarios:

1. Navega al detalle de un complejo
2. En la sección "Horarios de Atención", haz clic en "Configurar Horarios" o "Editar Horarios"
3. Selecciona el modo deseado:
   - **Estándar:** Configura horarios rápidamente por grupos de días
   - **Personalizado:** Configura cada día individualmente
4. Haz clic en "Guardar Horarios"

#### Cerrar/Abrir un Día Específico:

1. En la lista de horarios, cada día tiene un botón a la derecha
2. Haz clic en "✕ Cerrar" para marcar el día como cerrado
3. Haz clic en "✓ Abrir" para reabrir el día

#### Agregar Nueva Cancha:

1. Navega al detalle de un complejo
2. En la sección "Canchas Disponibles", haz clic en "+ Nueva Cancha"
3. Completa el formulario:
   - Nombre de la cancha (obligatorio)
   - Tipo de deporte (obligatorio)
   - Precio por hora (obligatorio)
   - Descripción (opcional)
   - Estado (Disponible, En Mantenimiento, No Disponible)
4. Haz clic en "Crear Cancha"

### 5. Autenticación

**IMPORTANTE:** Actualmente el token se obtiene de `localStorage.getItem('token')`.

Para probar la funcionalidad, debes:

1. Iniciar sesión en la aplicación
2. El token debe guardarse automáticamente en localStorage
3. O temporalmente, puedes agregar un token manualmente en la consola del navegador:
   ```javascript
   localStorage.setItem('token', 'TU_TOKEN_AQUI');
   ```

**TODO:** Integrar con el sistema de autenticación del contexto global de la aplicación.

### 6. Próximos Pasos Sugeridos

- [ ] Integrar autenticación con el contexto global de la app
- [ ] Agregar funcionalidad para editar canchas existentes
- [ ] Agregar funcionalidad para eliminar canchas
- [ ] Agregar carga de imágenes para las canchas
- [ ] Implementar sistema de notificaciones/toasts en lugar de alerts
- [ ] Agregar confirmaciones más elegantes para acciones destructivas
- [ ] Implementar paginación para complejos con muchas canchas
- [ ] Agregar filtros y búsqueda de canchas por deporte

### 7. Ejemplos de Datos

#### Horario Estándar:
```json
{
  "lun_vie_apertura": "08:00",
  "lun_vie_cierre": "22:00",
  "sab_apertura": "09:00",
  "sab_cierre": "23:00",
  "dom_apertura": "10:00",
  "dom_cierre": "20:00"
}
```

#### Horario Personalizado:
```json
{
  "horarios": [
    { "dia_semana": 1, "hora_apertura": "08:00", "hora_cierre": "22:00" },
    { "dia_semana": 2, "hora_apertura": "08:00", "hora_cierre": "22:00" },
    { "dia_semana": 3, "hora_apertura": "08:00", "hora_cierre": "22:00" },
    { "dia_semana": 4, "hora_apertura": "08:00", "hora_cierre": "22:00" },
    { "dia_semana": 5, "hora_apertura": "08:00", "hora_cierre": "23:00" },
    { "dia_semana": 6, "hora_apertura": "09:00", "hora_cierre": "23:00" },
    { "dia_semana": 0, "hora_apertura": "10:00", "hora_cierre": "20:00" }
  ]
}
```

#### Nueva Cancha:
```json
{
  "complex_id": 1,
  "nombre": "Cancha Principal",
  "tipo_deporte": "Fútbol 5",
  "precio_hora": 50.00,
  "descripcion": "Cancha de pasto sintético con iluminación",
  "state": "DISPONIBLE"
}
```

### 8. Notas Técnicas

- Los modales se renderizan con `position: fixed` para superponerse al contenido
- Se usa `z-index: 1000` para asegurar que estén por encima de otros elementos
- Los estados de carga (`guardandoHorarios`, `guardandoCancha`) previenen múltiples envíos
- Los errores se manejan tanto a nivel de API como a nivel de validación en el frontend
- Los días de la semana siguen el estándar: 0=Domingo, 1=Lunes, ..., 6=Sábado
