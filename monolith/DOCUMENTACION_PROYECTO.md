# GroupsApp — Documentación del Proyecto

## 1. ¿Qué es GroupsApp?

GroupsApp es una **aplicación de mensajería en tiempo real** que permite a los usuarios crear grupos, organizar canales de comunicación dentro de esos grupos, y enviar mensajes instantáneos. Es similar en concepto a plataformas como Slack o Discord, pero a menor escala.

### Funcionalidades principales:

- **Registro e inicio de sesión** con autenticación JWT
- **Creación de grupos** con roles de administrador y miembro
- **Invitaciones por código** para unirse a grupos
- **Canales** dentro de cada grupo para organizar conversaciones
- **Chat en tiempo real** usando WebSockets (Socket.IO)
- **Persistencia de mensajes** en base de datos PostgreSQL

---

## 2. ¿Por qué es un proyecto monolítico?

### ¿Qué significa "monolítico"?

En una arquitectura monolítica, **toda la aplicación vive en un solo proyecto y se ejecuta como un único proceso**. Esto significa que:

- La API REST, los WebSockets, la lógica de negocio, el acceso a datos y los archivos estáticos del frontend se sirven **desde un solo servidor**.
- Todo el código backend está en una sola carpeta (`src/`), se arranca con un solo comando (`npm run dev`) y se conecta a una sola base de datos.

### ¿Por qué se eligió esta arquitectura?

| Ventaja | Explicación |
|---------|-------------|
| **Simplicidad** | No hay que coordinar múltiples servicios, todo está en un lugar |
| **Fácil de desarrollar** | Un solo `npm run dev` levanta todo el proyecto |
| **Fácil de desplegar** | Se despliega como una sola unidad |
| **Ideal para proyectos pequeños/medianos** | No se necesita la complejidad de microservicios |
| **Menos latencia interna** | Las llamadas entre componentes son directas, no hay comunicación de red interna |

### Diferencia con microservicios:

En una arquitectura de **microservicios**, la autenticación, los grupos, los canales y los mensajes serían servicios independientes, cada uno con su propia base de datos y servidor. Esto agregaría complejidad innecesaria para un proyecto de este tamaño.

---

## 3. Stack Tecnológico

| Componente | Tecnología | Propósito |
|-----------|------------|-----------|
| **Runtime** | Node.js | Ejecutar JavaScript en el servidor |
| **Framework HTTP** | Express 5 | Manejo de rutas, middlewares y API REST |
| **Base de datos** | PostgreSQL 15 | Almacenamiento persistente relacional |
| **ORM** | Sequelize 6 | Mapeo objeto-relacional para interactuar con PostgreSQL |
| **WebSockets** | Socket.IO 4 | Comunicación en tiempo real (chat) |
| **Autenticación** | JWT + bcrypt | Tokens seguros y hashing de contraseñas |
| **Contenedores** | Docker Compose | Ejecutar PostgreSQL sin instalarlo localmente |
| **Dev tools** | nodemon | Reinicio automático del servidor en desarrollo |
| **Variables de entorno** | dotenv | Cargar configuración desde `.env` |

---

## 4. Estructura de Archivos (Backend)

```
monolith/
├── .env                          # Variables de entorno
├── docker-compose.yml            # Configuración de Docker para PostgreSQL
├── package.json                  # Dependencias y scripts
├── public/                       # Frontend (HTML/CSS/JS estáticos)
└── src/                          # Todo el código backend
    ├── index.js                  # Punto de entrada principal
    ├── database.js               # Conexión a PostgreSQL
    ├── middlewares/
    │   └── auth.js               # Middleware de autenticación JWT
    ├── models/
    │   ├── User.js               # Modelo de usuario
    │   ├── Group.js              # Modelo de grupo
    │   ├── GroupMember.js        # Modelo de membresía (relación usuario-grupo)
    │   ├── Channel.js            # Modelo de canal
    │   └── Message.js            # Modelo de mensaje
    ├── controllers/
    │   ├── authController.js     # Lógica de registro y login
    │   ├── groupController.js    # Lógica de grupos e invitaciones
    │   └── channelController.js  # Lógica de canales y mensajes
    ├── routes/
    │   ├── authRoutes.js         # Rutas de autenticación
    │   ├── groupRoutes.js        # Rutas de grupos
    │   └── channelRoutes.js      # Rutas de canales y mensajes
    └── services/                 # (Reservado para lógica de negocio futura)
```

---

## 5. Explicación Detallada de Cada Archivo

### 5.1 Archivos de Configuración

#### `.env`
Almacena las variables de entorno sensibles que **no deben estar en el código fuente**:
- `PORT`: Puerto donde escucha el servidor (3000)
- `DATABASE_URL`: URL de conexión a PostgreSQL con formato `postgres://usuario:contraseña@host:puerto/basededatos`
- `JWT_SECRET`: Clave secreta para firmar y verificar tokens JWT

#### `docker-compose.yml`
Define un servicio de Docker para ejecutar **PostgreSQL 15** sin necesidad de instalarlo en la máquina local:
- Crea un contenedor llamado `groupsapp_db`
- Configura la base de datos `groupsapp` con usuario `postgres` y contraseña `password123`
- Expone el puerto `5432` al host
- Usa un volumen (`pgdata`) para persistir los datos entre reinicios del contenedor

#### `package.json`
Define las dependencias del proyecto y los scripts de ejecución:
- `npm start` → Ejecuta `node src/index.js` (producción)
- `npm run dev` → Ejecuta `nodemon src/index.js` (desarrollo, con recarga automática)

---

### 5.2 Punto de Entrada — `src/index.js`

Este archivo es **el corazón del monolito**. Hace todo lo siguiente en orden:

1. **Carga variables de entorno** con `dotenv`
2. **Importa Express** y crea la aplicación HTTP
3. **Crea el servidor HTTP** envolviendo Express con `http.createServer()` — necesario para que Socket.IO y Express compartan el mismo puerto
4. **Inicializa Socket.IO** sobre ese servidor HTTP
5. **Registra los modelos** de Sequelize (User, Group, GroupMember, Channel, Message)
6. **Configura middlewares**:
   - `express.json()` — parsea cuerpos JSON de las peticiones
   - `express.static('public')` — sirve archivos estáticos del frontend
7. **Monta las rutas** de la API REST bajo `/api/auth`, `/api/groups`, `/api/channels`
8. **Configura Socket.IO** con tres eventos:
   - `join_channel` — Cuando un usuario se conecta a un canal, lo une a la "room" de Socket.IO de ese canal
   - `send_message` — Reenvía el mensaje a todos los conectados en ese canal
   - `disconnect` — Registra desconexiones
9. **Conecta a la base de datos** y arranca el servidor en el puerto configurado

**¿Por qué es monolítico?** Porque el servidor HTTP, la API REST, los WebSockets y el servicio de archivos estáticos se ejecutan todos desde **este único archivo** como un solo proceso.

---

### 5.3 Base de Datos — `src/database.js`

Crea la instancia de Sequelize que se conecta a PostgreSQL usando la URL definida en `.env`.

**Funciones clave:**
- `sequelize.authenticate()` — Verifica que la conexión a la base de datos funcione
- `sequelize.sync({ alter: true })` — Sincroniza los modelos con las tablas de la base de datos. La opción `alter: true` modifica las tablas existentes para que coincidan con los modelos (agrega columnas nuevas, etc.) sin perder datos

---

### 5.4 Modelos — `src/models/`

Los modelos definen la **estructura de las tablas** en la base de datos y las **relaciones** entre ellas.

#### `User.js` — Modelo de Usuario
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID (auto-generado) | Identificador único del usuario |
| `username` | STRING (único) | Nombre de usuario |
| `email` | STRING (único) | Correo electrónico |
| `password` | STRING | Contraseña hasheada con bcrypt |
| `status` | ENUM ('online', 'offline') | Estado de conexión |

#### `Group.js` — Modelo de Grupo
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `name` | STRING | Nombre del grupo |
| `description` | TEXT | Descripción del grupo |
| `adminId` | UUID (FK → User) | Quién creó el grupo |
| `inviteCode` | STRING (único) | Código de 8 caracteres para invitaciones |

**Relación:** `Group.belongsTo(User)` → Cada grupo tiene un administrador

#### `GroupMember.js` — Tabla Intermedia (Membresía)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `userId` | UUID (FK → User) | ID del usuario miembro |
| `groupId` | UUID (FK → Group) | ID del grupo |
| `role` | ENUM ('admin', 'member') | Rol del usuario en el grupo |

Esta es una **tabla de relación muchos-a-muchos**: un usuario puede pertenecer a muchos grupos y un grupo puede tener muchos usuarios. El campo `role` permite diferenciar entre administradores y miembros regulares.

#### `Channel.js` — Modelo de Canal
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `name` | STRING | Nombre del canal (ej: "general") |
| `groupId` | UUID (FK → Group) | A qué grupo pertenece |

**Relación:** `Channel.belongsTo(Group)` → Cada canal pertenece a un grupo

#### `Message.js` — Modelo de Mensaje
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `content` | TEXT | Contenido del mensaje |
| `type` | ENUM ('text', 'image', 'file') | Tipo de mensaje |
| `fileUrl` | STRING | URL del archivo (si es de tipo image/file) |
| `senderId` | UUID (FK → User) | Quién envió el mensaje |
| `channelId` | UUID (FK → Channel) | En qué canal se envió |

**Relaciones:**
- `Message.belongsTo(User)` → Cada mensaje tiene un remitente
- `Message.belongsTo(Channel)` → Cada mensaje pertenece a un canal

---

### 5.5 Middleware — `src/middlewares/auth.js`

El middleware de autenticación es una función que se ejecuta **antes de cada ruta protegida**. Su lógica es:

1. Extrae el token JWT del header `Authorization: Bearer <token>`
2. Si no hay token → responde `401 Token requerido`
3. Verifica y decodifica el token con `jwt.verify()` usando la clave secreta
4. Si el token es válido → agrega los datos del usuario (`id`, `username`) a `req.user` y permite continuar
5. Si el token es inválido o expirado → responde `401 Token inválido`

**Importancia:** Sin este middleware, cualquier persona podría hacer peticiones a la API sin estar autenticada.

---

### 5.6 Controladores — `src/controllers/`

Los controladores contienen la **lógica de negocio** de la aplicación. Reciben las peticiones HTTP, procesan los datos y devuelven respuestas.

#### `authController.js` — Autenticación

**`register`** — Registro de usuario nuevo:
1. Recibe `username`, `email` y `password` del cuerpo de la petición
2. Hashea la contraseña con **bcrypt** (10 rondas de salt) — nunca se guarda la contraseña en texto plano
3. Crea el usuario en la base de datos
4. Retorna los datos del usuario creado (sin la contraseña)

**`login`** — Inicio de sesión:
1. Busca el usuario por `email` en la base de datos
2. Compara la contraseña ingresada con el hash guardado usando `bcrypt.compare()`
3. Si es correcta, genera un **token JWT** que contiene el `id` y `username` del usuario, con expiración de 24 horas
4. Retorna el token y los datos del usuario

#### `groupController.js` — Gestión de Grupos

**`createGroup`** — Crear grupo:
1. Genera un código de invitación aleatorio de 8 caracteres hexadecimales usando `crypto.randomBytes(4)`
2. Crea el grupo en la base de datos con el usuario actual como `adminId`
3. Automáticamente agrega al creador como miembro con rol `admin` en la tabla `GroupMember`

**`getMyGroups`** — Obtener mis grupos:
1. Busca todas las membresías (`GroupMember`) del usuario autenticado
2. Incluye los datos del grupo asociado usando el `include` de Sequelize (JOIN implícito)
3. Retorna la lista de grupos

**`joinGroup`** — Unirse a un grupo por ID:
1. Verifica que el usuario no sea ya miembro del grupo
2. Si no es miembro, lo agrega con rol `member`

**`getInviteCode`** — Obtener código de invitación:
1. Busca el grupo por ID
2. Si no tiene código de invitación, genera uno nuevo y lo guarda
3. Retorna el código y un link de invitación

**`joinByCode`** — Unirse con código de invitación:
1. Busca un grupo que tenga el código proporcionado
2. Si no existe → error "Código inválido"
3. Verifica que el usuario no sea ya miembro
4. Lo agrega al grupo como `member`

#### `channelController.js` — Canales y Mensajes

**`createChannel`** — Crear canal en un grupo:
1. Verifica que el usuario sea miembro del grupo (seguridad)
2. Crea el canal asociado al grupo

**`sendMessage`** — Enviar mensaje:
1. Crea el mensaje en la base de datos con el `senderId` del usuario autenticado
2. Esto persiste el mensaje para que no se pierda al recargar

**`getMessages`** — Obtener mensajes de un canal:
1. Busca todos los mensajes del canal ordenados cronológicamente
2. Incluye los datos del remitente (username) usando `include` de Sequelize

**`getChannels`** — Listar canales de un grupo:
1. Retorna todos los canales asociados al `groupId`

---

### 5.7 Rutas — `src/routes/`

Las rutas conectan las **URLs de la API** con los **controladores**. Definen qué función se ejecuta para cada combinación de método HTTP + URL.

#### `authRoutes.js`
| Método | Ruta | Controlador | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | `register` | ❌ No |
| POST | `/api/auth/login` | `login` | ❌ No |

#### `groupRoutes.js`
| Método | Ruta | Controlador | Auth |
|--------|------|-------------|------|
| POST | `/api/groups` | `createGroup` | ✅ Sí |
| GET | `/api/groups/my` | `getMyGroups` | ✅ Sí |
| POST | `/api/groups/join/:code` | `joinByCode` | ✅ Sí |
| GET | `/api/groups/:groupId/invite` | `getInviteCode` | ✅ Sí |
| POST | `/api/groups/:groupId/join` | `joinGroup` | ✅ Sí |

#### `channelRoutes.js`
| Método | Ruta | Controlador | Auth |
|--------|------|-------------|------|
| POST | `/api/channels/groups/:groupId/channels` | `createChannel` | ✅ Sí |
| POST | `/api/channels/:channelId/messages` | `sendMessage` | ✅ Sí |
| GET | `/api/channels/:channelId/messages` | `getMessages` | ✅ Sí |
| GET | `/api/channels/grupos/:groupId/list` | `getChannels` | ✅ Sí |

---

## 6. Diagrama de Relaciones de la Base de Datos

```
┌──────────────┐         ┌──────────────────┐         ┌──────────────┐
│    User      │         │   GroupMember     │         │    Group     │
├──────────────┤         ├──────────────────┤         ├──────────────┤
│ id (PK)      │◄───────►│ userId (FK)       │         │ id (PK)      │
│ username     │         │ groupId (FK)      │◄───────►│ name         │
│ email        │         │ role              │         │ description  │
│ password     │         └──────────────────┘         │ adminId (FK) │──► User
│ status       │                                      │ inviteCode   │
└──────────────┘                                      └──────────────┘
       │                                                     │
       │  (senderId)                                         │  (groupId)
       ▼                                                     ▼
┌──────────────┐                                      ┌──────────────┐
│   Message    │                                      │   Channel    │
├──────────────┤                                      ├──────────────┤
│ id (PK)      │                                      │ id (PK)      │
│ content      │◄─────── channelId (FK) ─────────────►│ name         │
│ type         │                                      │ groupId (FK) │
│ fileUrl      │                                      └──────────────┘
│ senderId (FK)│
│ channelId(FK)│
└──────────────┘
```

---

## 7. Flujo de Comunicación en Tiempo Real

El chat utiliza **dos canales de comunicación simultáneos**:

### HTTP REST (persistencia):
```
Cliente → POST /api/channels/:channelId/messages → Servidor → PostgreSQL
```
Guarda el mensaje en la base de datos para que no se pierda al recargar la página.

### WebSocket / Socket.IO (tiempo real):
```
Cliente A → emit('send_message', data) → Servidor → io.to(channelId).emit('new_message', data) → Cliente B, C, D...
```
Envía el mensaje instantáneamente a todos los usuarios conectados al canal.

**¿Por qué ambos?** El WebSocket es rápido pero volátil (los mensajes se pierden si el servidor se reinicia). La API REST persiste los datos en PostgreSQL. Al abrir un canal, se cargan los mensajes históricos vía REST, y los nuevos llegan por WebSocket.

---

## 8. Flujo de Autenticación

```
1. Usuario se registra → POST /api/auth/register
   - Se hashea la contraseña con bcrypt
   - Se crea el usuario en la BD

2. Usuario inicia sesión → POST /api/auth/login
   - Se verifica la contraseña con bcrypt.compare()
   - Se genera un JWT con id y username, expira en 24h
   - Se devuelve el token al cliente

3. Cliente almacena el token en localStorage

4. Para rutas protegidas, el cliente envía:
   Header: Authorization: Bearer <token>

5. El middleware auth.js verifica el token y permite o rechaza el acceso
```

---

## 9. Cómo Ejecutar el Proyecto

### Prerequisitos:
- Node.js instalado
- Docker Desktop instalado (para PostgreSQL)

### Pasos:

```bash
# 1. Levantar la base de datos con Docker
docker-compose up -d

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm run dev

# 4. Abrir en el navegador
# http://localhost:3000
```

---

## 10. Seguridad Implementada

| Medida | Implementación |
|--------|---------------|
| **Contraseñas hasheadas** | bcrypt con 10 rondas de salt |
| **Autenticación por token** | JWT con expiración de 24 horas |
| **Rutas protegidas** | Middleware `authMiddleware` en todas las rutas excepto register/login |
| **Verificación de membresía** | Se verifica que el usuario pertenezca al grupo antes de crear canales |
| **IDs no predecibles** | Se usan UUIDs v4 en vez de IDs incrementales |

---

## 11. Posibles Mejoras Futuras

- **Validación de entrada**: Agregar validación con librerías como `joi` o `express-validator`
- **Subida de archivos**: Implementar envío de imágenes y archivos en el chat
- **Notificaciones push**: Notificar a usuarios quando hay nuevos mensajes
- **Roles avanzados**: Implementar permisos más granulares (moderador, solo lectura)
- **Paginación**: Limitar la cantidad de mensajes cargados por petición
- **Tests automatizados**: Agregar pruebas unitarias y de integración
- **Rate limiting**: Limitar peticiones para prevenir abuso
