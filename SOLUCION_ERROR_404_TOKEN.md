# 🔐 Configuración del Token de Autenticación

## ❌ Error 404 al Configurar Horarios

Si estás recibiendo un error 404 al intentar configurar los horarios, es porque **necesitas estar autenticado**.

### ¿Por qué necesito autenticación?

Los endpoints de configuración de horarios están protegidos y solo el dueño del complejo puede modificarlos. Por eso necesitas un token válido.

---

## ✅ Soluciones

### Opción 1: Iniciar Sesión en la Aplicación (Recomendado)

Si tu aplicación ya tiene un sistema de autenticación:

1. Ve a la página de login
2. Inicia sesión con tu usuario
3. El token debería guardarse automáticamente en `localStorage`
4. Regresa al detalle del complejo e intenta configurar los horarios

### Opción 2: Configurar Token Manualmente (Para Pruebas)

Si solo quieres probar la funcionalidad:

#### Paso 1: Obtener un Token Válido

Primero necesitas obtener un token usando el endpoint de login:

```bash
# Usando curl (PowerShell)
curl -X POST http://192.168.1.22:3000/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"tu_email@ejemplo.com\",\"password\":\"tu_password\"}'

# O usando Invoke-RestMethod (PowerShell)
$body = @{
    email = "tu_email@ejemplo.com"
    password = "tu_password"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://192.168.1.22:3000/auth/login" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"

$response.token
```

#### Paso 2: Guardar el Token en localStorage

Abre la **Consola del Navegador** (F12) y ejecuta:

```javascript
// Reemplaza 'TU_TOKEN_AQUI' con el token que obtuviste
localStorage.setItem('token', 'TU_TOKEN_AQUI');

// Verifica que se guardó correctamente
console.log('Token guardado:', localStorage.getItem('token'));
```

#### Paso 3: Recarga la Página

1. Recarga la página del complejo (F5)
2. Ahora deberías poder configurar los horarios

---

## 🔍 Verificar Estado Actual

### Ver si hay Token Guardado

En la consola del navegador:

```javascript
const token = localStorage.getItem('token');
if (token) {
  console.log('✅ Token encontrado:', token.substring(0, 20) + '...');
} else {
  console.log('❌ No hay token guardado');
}
```

### Ver tu Usuario Actual (si tienes token)

```javascript
const token = localStorage.getItem('token');
if (token) {
  // Decodificar el JWT (si es un JWT)
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Usuario:', payload);
}
```

---

## 🛠️ Verificar que el Backend Está Corriendo

Antes de intentar configurar horarios, asegúrate de que el backend esté corriendo:

### 1. Verificar Salud del Servidor

Abre en el navegador: http://192.168.1.22:3000/

Deberías ver:
```json
{"message":"Zyra Backend API"}
```

### 2. Iniciar el Backend (si no está corriendo)

En la terminal del proyecto backend:

```bash
cd c:\Users\WINDOWS 11\Desktop\desarrollo\zyra\backend-zyra
npm start
```

---

## 📋 Checklist de Solución de Problemas

- [ ] El backend está corriendo en http://192.168.1.22:3000
- [ ] Puedes acceder a http://192.168.1.22:3000/ y ver el mensaje de bienvenida
- [ ] Tienes un token válido guardado en localStorage
- [ ] El token no es 'tu_token_aqui' (el valor por defecto)
- [ ] Has recargado la página después de guardar el token

---

## 🎯 Crear un Usuario de Prueba

Si no tienes un usuario, crea uno usando el endpoint de registro:

```bash
# PowerShell
$body = @{
    name = "Test User"
    nick = "testuser"
    email = "test@ejemplo.com"
    password = "password123"
    telefono = "123456789"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://192.168.1.22:3000/auth/register" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

Luego haz login con ese usuario para obtener el token.

---

## 🔐 Autenticación Futura

Para integración completa con el sistema de autenticación:

1. Implementar componente de Login
2. Guardar el token automáticamente después del login
3. Crear un contexto global para manejar la autenticación
4. Implementar auto-refresh del token antes de que expire
5. Implementar logout que limpie el token

---

## ⚠️ Nota de Seguridad

En producción, **NUNCA** guardes tokens sensibles directamente en localStorage sin medidas de seguridad adicionales. Considera:

- HTTPOnly cookies
- Tokens de corta duración con refresh tokens
- Validación del token en cada petición
- Implementar HTTPS
