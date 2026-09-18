# 📋 Funcionalidades de Reservas Manuales

## 🎯 Resumen de Implementación

Se ha implementado un sistema completo de reservas manuales con las siguientes características profesionales:

---

## ✨ Funcionalidades Implementadas

### 1. 📱 Búsqueda Automática de Clientes

**Al escribir el teléfono:**
- ⚡ Búsqueda automática en tiempo real (800ms de debounce)
- 🔍 Busca en la base de datos si el cliente tiene historial
- 👤 Carga automática del nombre si el cliente existe
- ✅ Indicador visual de cliente encontrado/nuevo

**Tecnología:**
- Endpoint: `GET /api/reservas/historial-cliente/:telefono`
- Búsqueda por teléfono normalizado (sin caracteres especiales)
- Busca tanto en usuarios registrados como en contactos de reservas previas

---

### 2. 📊 Panel de Historial del Cliente

**Se muestra automáticamente al lado del formulario cuando:**
- El teléfono tiene 10 dígitos o más
- Se encuentra historial en el complejo actual

**Información mostrada:**
```
┌─────────────────────────────────────┐
│ Cliente • Registrado/Nuevo          │
│ Nombre del cliente                  │
│ +57 300 123 4567                    │
│ cliente@example.com                 │
│                                     │
│ ⚠️ ALERTA DE INCUMPLIMIENTOS        │
│ (si tiene reservas canceladas)      │
│                                     │
│ [Total] [Finalizadas] [Cumplimiento]│
│   15        13           87%         │
│                                     │
│ Historial en este complejo:         │
│ ┌───────────────────────────────┐   │
│ │ Cancha Maracana F5            │   │
│ │ 12 Jun, 2026 • 18:00         │   │
│ │ ✓ Finalizada                  │   │
│ │ 60 min • $120,000             │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Características:**
- 🎨 Animación suave de entrada (no mueve el formulario principal)
- ⚠️ Alerta visual si hay reservas canceladas o no asistidas
- 📈 Estadísticas: Total, Finalizadas, Tasa de cumplimiento
- 📜 Historial completo con scroll independiente
- 🎯 Estados visuales: Confirmada, Finalizada, Cancelada, No asistió
- 🔄 Carga en tiempo real mientras se escribe

---

### 3. ⏱️ Duración del Partido

**Selector de duración:**
```
┌──────────────────┬──────────────────┐
│ 🕐 1 hora (60 min)│ 🕐 2 horas (120 min)│
└──────────────────┴──────────────────┘
```

**Opciones disponibles:**
- ✅ 60 minutos (1 hora)
- ✅ 120 minutos (2 horas)
- 🎨 Selector visual con botones grandes
- ⚡ Cambio instantáneo sin recargar

---

### 4. 💰 Gestión de Pagos

**Estados de pago disponibles:**

1. **Abonó Anticipo (30%)**
   - Cobra el 30% del valor total
   - Muestra automáticamente el monto calculado
   - Requiere seleccionar método de pago

2. **Pago Total**
   - Cliente paga el 100% al momento
   - Requiere seleccionar método de pago
   - Estado final: PAGADA_TOTAL

3. **Pendiente (paga después)**
   - El cliente paga al llegar a la cancha
   - No requiere método de pago
   - Útil para reservas telefónicas

**Métodos de pago:**
```
┌─────────┬──────────────┬──────────┐
│ 📱 Nequi│ 🔄 Transfer. │ 💵 Efectivo│
└─────────┴──────────────┴──────────┘
```

---

### 5. 🏷️ Identificación de Origen

**Campo automático: `origen_reserva`**
- 🖐️ **MANUAL**: Reservas creadas por administrador (esta funcionalidad)
- 🌐 **WEB**: Reservas creadas por clientes en la web
- 📱 **APP**: Reservas desde aplicación móvil
- 🔌 **API**: Reservas por integración externa

**Beneficios:**
- 📊 Estadísticas por canal de venta
- 🎯 Identificación clara del origen
- 📈 Análisis de rendimiento por canal

---

### 6. ⚠️ Sistema de Alertas de Incumplimientos

**Detección automática:**
- ❌ Reservas canceladas por el cliente
- 🚫 Reservas con estado NO_SHOW (no asistió)
- 📊 Cálculo de tasa de cumplimiento

**Alertas visuales:**
```
┌───────────────────────────────────────┐
│ ⚠️ Este cliente tiene 2 reserva(s)    │
│    cancelada(s) y 1 no asistida(s)    │
└───────────────────────────────────────┘
```

**Información adicional:**
- 🔴 Badge rojo en el perfil del cliente
- 📊 Tasa de cumplimiento calculada
- 📜 Historial completo visible

---

## 🛠️ Implementación Técnica

### Backend

**Nuevos endpoints:**
```javascript
GET /api/reservas/historial-cliente/:telefono
  Query: complejo_id
  Response: {
    cliente: { nombre, telefono, email, user_id, es_cliente_registrado },
    estadisticas: { total, finalizadas, canceladas, no_show, cumplimiento },
    historial: [...]
  }
```

**Migración de base de datos:**
```sql
ALTER TABLE reservas ADD:
  - origen_reserva VARCHAR(20) DEFAULT 'WEB'
  - telefono_contacto VARCHAR(20) NULL
  - nombre_contacto VARCHAR(100) NULL
```

**Controlador actualizado:**
- ✅ Permite crear reservas sin user_id (manuales)
- ✅ Guarda telefono_contacto y nombre_contacto
- ✅ Calcula montos según estado de pago
- ✅ Valida disponibilidad de horario

### Frontend

**Componentes nuevos:**
- `HistorialCliente.jsx`: Panel lateral con historial
- Integración con `FormularioReservaManual.jsx`
- Búsqueda automática con debounce
- Animaciones suaves sin mover el formulario

**Estados manejados:**
```javascript
- telefono, nombre (inputs del usuario)
- buscandoCliente (loading state)
- historialCliente, estadisticasCliente, datosCliente
- muestraHistorial (controla visibilidad del panel)
- duracionMinutos (60 o 120)
- estadoPago, metodoPago
- guardando (loading al crear reserva)
```

---

## 🚀 Flujo de Usuario

1. **Usuario hace clic en celda disponible**
   - Se abre el formulario de reserva manual
   - Posición calculada para no salir de pantalla

2. **Usuario escribe teléfono**
   - Búsqueda automática después de 800ms
   - Si encuentra historial, muestra panel lateral con animación
   - Si es cliente nuevo, permite continuar normalmente

3. **Sistema muestra alertas (si aplica)**
   - Panel con incumplimientos previos
   - Estadísticas de cumplimiento
   - Historial completo de reservas

4. **Usuario completa el formulario**
   - Nombre (auto-cargado o manual)
   - Duración del partido (60 o 120 min)
   - Estado de pago
   - Método de pago (si aplica)

5. **Usuario confirma**
   - Validaciones en frontend
   - Envío a API con origen_reserva: 'MANUAL'
   - Recarga automática del dashboard
   - Cierre del formulario con animación

---

## 📦 Archivos Modificados/Creados

### Backend
```
✅ src/migrations/agregar_origen_reserva.js (nuevo)
✅ src/db/models/reservas.js (actualizado)
✅ src/controllers/reservaController.js (actualizado)
✅ src/routes/reservaRoutes.js (actualizado)
✅ MIGRACION_ORIGEN_RESERVA.md (nuevo)
```

### Frontend
```
✅ src/componentes/principal/HistorialCliente.jsx (nuevo)
✅ src/componentes/principal/FormularioReservaManual.jsx (actualizado)
✅ src/componentes/principal/principalDashboard.jsx (actualizado)
✅ FUNCIONALIDADES_RESERVAS_MANUALES.md (nuevo)
```

---

## ✅ Checklist de Funcionalidades

- [x] Búsqueda automática por teléfono
- [x] Carga de información del cliente
- [x] Panel de historial lateral
- [x] Animación suave sin mover formulario principal
- [x] Alertas de incumplimientos
- [x] Estadísticas de cumplimiento
- [x] Selector de duración (60/120 min)
- [x] Gestión de estados de pago
- [x] Métodos de pago visuales
- [x] Campo origen_reserva automático
- [x] Validaciones completas
- [x] Integración con backend
- [x] Recarga automática del dashboard
- [x] Manejo de errores
- [x] Loading states
- [x] Responsive design

---

## 🎨 Experiencia de Usuario

**Principios aplicados:**
- 🎯 No mover elementos mientras el usuario trabaja
- ⚡ Feedback instantáneo en todas las acciones
- 🎨 Animaciones suaves y profesionales
- ⚠️ Alertas claras y visibles
- 📊 Información contextual relevante
- ✨ Diseño moderno y limpio
- 🚀 Performance optimizada

---

## 🔧 Configuración Requerida

### 1. Ejecutar Migración
```bash
cd backend-zyra
node src/migrations/agregar_origen_reserva.js
```

### 2. Verificar Tabla
```sql
DESCRIBE reservas;
-- Debe mostrar: origen_reserva, telefono_contacto, nombre_contacto
```

### 3. Configurar complejo_id
En `FormularioReservaManual.jsx`, actualizar:
```javascript
const complejoId = 1; // Cambiar por el ID real del complejo
```

O mejor aún, obtenerlo del contexto de autenticación.

---

## 📝 Notas Importantes

1. **Búsqueda inteligente**: Busca tanto en usuarios registrados como en reservas manuales previas
2. **Sin user_id**: Las reservas manuales pueden crearse sin usuario registrado
3. **Trazabilidad completa**: Siempre se sabe de dónde vino cada reserva
4. **Escalable**: El sistema soporta múltiples canales de reserva
5. **Performance**: Búsquedas optimizadas con índices en la base de datos

---

## 🎯 Próximos Pasos Sugeridos

- [ ] Agregar notificaciones push cuando se crea una reserva
- [ ] Exportar estadísticas por origen de reserva
- [ ] Panel de métricas por canal de venta
- [ ] Integración con WhatsApp para confirmaciones
- [ ] Sistema de penalizaciones por incumplimientos
- [ ] Descuentos automáticos para clientes frecuentes

---

**Desarrollado con ❤️ para Zyra Dashboard**
