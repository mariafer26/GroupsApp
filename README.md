# GroupsApp

Aplicación de mensajería instantánea similar a WhatsApp/Telegram, desarrollada como proyecto para el curso Tópicos Especiales en Telemática.
(monolito)

## Link del video
https://youtu.be/WtUkYKmxOGc


---

## Funcionalidades

- Registro e inicio de sesión con JWT
- Creación y gestión de grupos con 2 tipos de suscripción:
  - 🌐 Público — cualquiera con el código puede unirse
  - ✋ Con aprobación — el admin aprueba cada solicitud
- Canales dentro de grupos
- Mensajería en tiempo real (Socket.IO)
- Envío de archivos e imágenes
- Estado de entrega y lectura (chulitos)
- Presencia online/offline en tiempo real
- Sistema de invitaciones con código

---

## Arquitectura
```
Cliente (Browser)
        ↓
   Express Server (Node.js)
        ↓           ↓
   PostgreSQL     Redis
   (mensajes,     (presencia
   usuarios,      online/offline)
   grupos)
```

### Tecnologías usadas

| Tecnología |
| Node.js + Express|
| PostgreSQL |
| Redis |
| Socket.IO |
| JWT |
| bcrypt |
| Docker |
| AWS EC2 |


## 🚀 Cómo correr el proyecto localmente

### Prerequisitos
- Docker Desktop instalado
- Git

### Pasos
```bash
# 1. Clonar el repositorio
git clone https://github.com/mariafer26/GroupsApp.git
cd GroupsApp/monolith

# 2. Levantar todo con Docker
docker compose up --build

# 3. Abrir en el navegador
http://localhost:3000
```

---

## 📡 API REST

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |

### Grupos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/groups` | Crear grupo |
| GET | `/api/groups/my` | Mis grupos |
| GET | `/api/groups/:id/invite` | Obtener código de invitación |
| POST | `/api/groups/join/:code` | Unirse con código |
| GET | `/api/groups/:id/requests` | Ver solicitudes pendientes |
| PUT | `/api/groups/:id/requests/:reqId` | Aprobar/rechazar solicitud |
| GET | `/api/groups/:id/online` | Ver miembros online |

### Canales y Mensajes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/channels/groups/:id/channels` | Crear canal |
| GET | `/api/channels/grupos/:id/list` | Listar canales |
| POST | `/api/channels/:id/messages` | Enviar mensaje |
| GET | `/api/channels/:id/messages` | Obtener historial |
| POST | `/api/channels/:id/files` | Enviar archivo |
| PUT | `/api/channels/:id/read` | Marcar como leído |

---


María Fernanda Álvarez Marín  
ST0263 Tópicos Especiales en Telemática  
Universidad EAFIT — 2026