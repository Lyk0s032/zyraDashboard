# 🎨 Nuevas Funcionalidades - Dashboard Zyra

## ✨ Funcionalidades Agregadas

### 1. Gestión de Precios Dinámicos 💰

**Componente:** `ModalPreciosDinamicos.jsx`

**Características:**
- ✅ Configurar precios por día de la semana (Lun-Dom + Festivos)
- ✅ Múltiples franjas horarias por día
- ✅ Estrategias predefinidas (Premium y Simple)
- ✅ Configuración personalizada
- ✅ Vista de precios actuales
- ✅ Eliminar precios dinámicos (volver a precio base)

**Ubicación:** Botón "💰 Precios" en cada card de cancha

**Estrategias Incluidas:**

#### Premium
- Lun-Jue: $60,000 (08:00-22:00)
- Viernes: $60,000 (08:00-18:00), $100,000 (18:00-23:00)
- Sábado: $90,000 (09:00-23:00)
- Festivos: $120,000 (08:00-23:00)

#### Simple
- Lun-Jue: $40,000
- Viernes: $50,000
- Fin de semana: $60,000
- Festivos: $80,000

---

### 2. Gestión de Excepciones de Calendario 📅

**Componente:** `ModalExcepciones.jsx`

**Características:**
- ✅ Agregar excepciones individuales
- ✅ Importar festivos de Colombia 2026 (19 festivos)
- ✅ Marcar días como festivos (precios especiales)
- ✅ Marcar días como cerrados (mantenimiento, eventos)
- ✅ Lista completa de excepciones configuradas
- ✅ Eliminar excepciones

**Ubicación:** Botón "📅 Gestionar Excepciones" en la sección de Horarios

**Festivos Incluidos:**
- Año Nuevo, Reyes Magos, San José
- Semana Santa (Jueves y Viernes Santo)
- Día del Trabajo
- Ascensión del Señor, Corpus Christi
- Independencia (20 de Julio)
- Batalla de Boyacá (7 de Agosto)
- Y más... (19 festivos en total)

---

### 3. Servicios API Actualizados 🔌

**Archivo:** `src/api/services.js`

**Nuevos servicios:**

```javascript
// Precios Dinámicos
preciosCanchaService.obtener(canchaId)
preciosCanchaService.configurar(canchaId, precios, token)
preciosCanchaService.actualizarFranja(canchaId, precioId, datos, token)
preciosCanchaService.eliminarFranja(canchaId, precioId, token)
preciosCanchaService.eliminarTodos(canchaId, token)

// Excepciones
excepcionesService.obtener(complejoId, filtros)
excepcionesService.obtenerPorFecha(complejoId, fecha)
excepcionesService.agregar(complejoId, excepcion, token)
excepcionesService.agregarMasivas(complejoId, excepciones, token)
excepcionesService.actualizar(complejoId, fecha, datos, token)
excepcionesService.eliminar(complejoId, fecha, token)
```

---

## 🚀 Cómo Usar

### Configurar Precios para una Cancha

1. Ir a **Detalle del Complejo**
2. En la card de la cancha, clic en **"💰 Precios"**
3. Elegir entre:
   - **Estrategia Predefinida**: Clic en "Premium" o "Simple"
   - **Personalizada**: Agregar franjas manualmente
4. Clic en **"Guardar Precios"**

### Importar Festivos de Colombia 2026

1. Ir a **Detalle del Complejo**
2. Clic en **"📅 Gestionar Excepciones"**
3. Clic en pestaña **"📥 Importar Festivos"**
4. Revisar la lista de 19 festivos
5. Clic en **"Importar 19 Festivos"**
6. Confirmar la importación

### Agregar Cierre por Mantenimiento

1. Ir a **"📅 Gestionar Excepciones"**
2. Clic en pestaña **"+ Agregar"**
3. Seleccionar fecha
4. Escribir descripción (Ej: "Mantenimiento General")
5. **Desmarcar** "El complejo está abierto"
6. Clic en **"Agregar Excepción"**

---

## 📋 Componentes Creados

### 1. ModalPreciosDinamicos.jsx
- **Props:** `cancha`, `complejoId`, `onClose`, `onActualizar`
- **Estado:** Maneja precios actuales, estrategias, y configuración personalizada
- **Validaciones:** Horarios en formato HH:MM, precios > 0

### 2. ModalExcepciones.jsx
- **Props:** `complejoId`, `onClose`, `onActualizar`
- **Estado:** Maneja 3 vistas (lista, agregar, importar)
- **Validaciones:** Fecha y descripción obligatorias

### 3. DetalleComplejo.jsx (Actualizado)
- **Nuevos estados:** `mostrarModalPrecios`, `mostrarModalExcepciones`, `canchaSeleccionada`
- **Nuevas funciones:** `handleAbrirModalPrecios`, `handleCerrarModalPrecios`
- **Integración:** Botones para abrir modales

---

## 🎨 Interfaz de Usuario

### Colores y Estilos

**Precios:**
- Botón principal: `#f39c12` (naranja)
- Estrategia seleccionada: `#e3f2fd` (azul claro)
- Guardado exitoso: Verde

**Excepciones:**
- Festivos (abierto): `#e8f5e9` (verde claro)
- Cerrado: `#ffebee` (rojo claro)
- Importar: `#9b59b6` (morado)

### Iconos Usados
- 💰 Precios
- 📅 Excepciones
- 🎉 Festivo
- 🔒 Cerrado
- ✓ Éxito
- ✕ Eliminar

---

## ⚙️ Configuración del Token

Los componentes usan `localStorage` para obtener el token:

```javascript
const token = localStorage.getItem('token') || '';
```

**Asegúrate de:**
1. Iniciar sesión en el sistema
2. El token se guarda automáticamente en localStorage
3. El token incluye permisos de dueño del complejo

---

## 🔄 Flujo de Datos

### Precios Dinámicos

```
Usuario → Modal Precios → API Service → Backend
                ↓
         Actualiza Vista de Cancha
```

1. Usuario abre modal de precios
2. Modal carga precios actuales (si existen)
3. Usuario configura precios
4. Modal envía a API
5. Backend valida y guarda
6. Vista se actualiza automáticamente

### Excepciones

```
Usuario → Modal Excepciones → API Service → Backend
                ↓
         Actualiza Lista
```

1. Usuario abre modal de excepciones
2. Modal carga excepciones existentes
3. Usuario agrega/importa/elimina
4. Modal envía a API
5. Backend valida y guarda
6. Lista se recarga automáticamente

---

## 🧪 Testing Manual

### Probar Precios Dinámicos

1. **Crear cancha** con precio base $50,000
2. **Configurar precios** con estrategia Premium
3. **Verificar** que se muestran precios actuales
4. **Editar** una franja horaria
5. **Eliminar** todos los precios
6. **Verificar** que vuelve a precio base

### Probar Excepciones

1. **Importar festivos** de Colombia 2026
2. **Verificar** que aparecen 19 excepciones
3. **Agregar** un cierre por mantenimiento
4. **Verificar** que aparece marcado como cerrado
5. **Eliminar** una excepción
6. **Verificar** que desaparece de la lista

---

## 📝 Notas Importantes

### Precios Dinámicos
- Los precios dinámicos **sobreescriben** el precio base
- Si no hay precios dinámicos, se usa el precio base
- Tipo día **7** = Festivos (se usa cuando hay excepción festiva)
- Horarios en formato **HH:MM** (24 horas)

### Excepciones
- Una excepción con `es_festivo: true` activa precios de tipo día 7
- Una excepción con `esta_abierto: false` cierra el complejo
- Los festivos importados están marcados como abiertos por defecto
- Se pueden tener excepciones sin que sean festivos (eventos especiales)

### Validaciones
- Solo el **dueño del complejo** puede configurar precios y excepciones
- Las fechas deben ser válidas y en formato YYYY-MM-DD
- Los precios deben ser mayores a 0
- Los horarios no pueden superponerse (el backend lo valida)

---

## 🐛 Troubleshooting

### Error: "No tienes permiso"
**Causa:** El token no pertenece al dueño del complejo
**Solución:** Iniciar sesión con la cuenta correcta

### Error: "Token inválido"
**Causa:** Token expirado o localStorage vacío
**Solución:** Cerrar sesión e iniciar sesión nuevamente

### Los precios no se guardan
**Causa:** Formato de hora incorrecto
**Solución:** Asegurarse de usar formato HH:MM (08:00, 14:30, etc.)

### Los festivos no se importan
**Causa:** Excepciones duplicadas
**Solución:** El backend detecta duplicados y los omite automáticamente

---

## 🔮 Mejoras Futuras (Sugeridas)

### Precios
- [ ] Vista previa de precios por fecha específica
- [ ] Copiar precios de una cancha a otra
- [ ] Plantillas personalizadas de precios
- [ ] Gráfico de precios por día/hora

### Excepciones
- [ ] Vista de calendario visual
- [ ] Filtros por mes/año
- [ ] Exportar excepciones a CSV
- [ ] Notificaciones de festivos próximos

### General
- [ ] Historial de cambios de precios
- [ ] Estadísticas de ingresos por franja horaria
- [ ] Comparación de estrategias de precios
- [ ] Sugerencias automáticas de precios

---

## 📚 Documentación Backend

Para más detalles sobre la API:
- `backend-zyra/TUTORIAL_PRACTICO.md` - Tutorial completo
- `backend-zyra/GUIA_CONFIGURACION_CANCHAS.md` - Guía técnica
- `backend-zyra/REFERENCIA_RAPIDA_CANCHAS.md` - Comandos rápidos

---

## ✅ Checklist de Implementación

- [x] Servicio API para precios dinámicos
- [x] Servicio API para excepciones
- [x] Modal de configuración de precios
- [x] Estrategias predefinidas de precios
- [x] Modal de gestión de excepciones
- [x] Importación de festivos Colombia 2026
- [x] Integración con DetalleComplejo
- [x] Botones en cards de canchas
- [x] Validaciones de formularios
- [x] Manejo de errores
- [x] Estados de carga
- [x] Actualización automática de vista
- [x] Documentación completa

---

**Estado:** ✅ Implementación Completa  
**Versión:** 1.0  
**Fecha:** 17 de Abril, 2026
