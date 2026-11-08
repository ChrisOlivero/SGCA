# SGCA — Sistema de Gestión de Certificados Académicos

## 1. Descripción del proyecto

El Sistema de Gestión de Certificados Académicos (SGCA) es una aplicación informática destinada a gestionar solicitudes de certificados académicos, permitiendo organizar y administrar la información relacionada con estudiantes y sus solicitudes.

El proyecto se desarrolla en el marco de la asignatura **Metodología de Sistemas II**, correspondiente a la Tecnicatura Universitaria en Programación.

Actualmente, el proyecto cuenta con un backend funcional. El desarrollo del frontend se encuentra pendiente.

## 2. Objetivos

- Gestionar solicitudes de certificados académicos.
- Validar la información recibida.
- Administrar las transiciones de estado de las solicitudes.
- Mantener una arquitectura organizada y modular.
- Aplicar principios SOLID y Clean Code.
- Incorporar pruebas automatizadas para verificar el funcionamiento del sistema.

## 3. Tecnologías utilizadas

| Tecnología | Utilización |
|---|---|
| Node.js | Entorno de ejecución |
| TypeScript | Lenguaje de programación |
| PostgreSQL | Sistema gestor de base de datos |
| pg | Conexión y consultas a PostgreSQL |
| Zod | Validación de datos |
| Swagger UI | Documentación interactiva de la API |
| tsx | Ejecución de TypeScript durante el desarrollo |
| Node.js Test Runner | Pruebas automatizadas |

## 4. Estructura del proyecto

```text
SGCA/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── docs/
│   └── evidencias/
└── README.md
```

## 5. Requisitos previos

Para ejecutar el backend se necesita:

- Node.js.
- npm.
- PostgreSQL.

## 6. Instalación y configuración

### 6.1. Clonar el repositorio

```bash
git clone https://github.com/ChrisOlivero/SGCA.git
```

### 6.2. Ingresar al backend

```bash
cd SGCA/backend
```

### 6.3. Instalar dependencias

```bash
npm install
```

### 6.4. Configurar la base de datos

Crear una base de datos PostgreSQL con el nombre:

```sql
CREATE DATABASE sgca_db;
```

### 6.5. Configurar variables de entorno

Crear un archivo `.env` dentro de la carpeta `backend`, tomando como referencia `.env.example`.

Completar los datos de conexión:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sgca_db
DB_USER=postgres
DB_PASSWORD=tu_password
```

Reemplazar los valores según la configuración local de PostgreSQL.

**Importante:** el archivo `.env` contiene credenciales y no debe subirse al repositorio.

## 7. Ejecución del proyecto

Desde la carpeta `backend`:

### Modo desarrollo

```bash
npm run dev
```

### Compilar el proyecto

```bash
npm run build
```

### Ejecutar la versión compilada

```bash
npm start
```

El servidor backend utiliza el puerto `3000`.

## 8. Documentación de la API

El proyecto incorpora Swagger UI para consultar la documentación interactiva de los endpoints, basada en OpenAPI 3.0.3.

Con el servidor iniciado, acceder a:

- **Swagger UI:** http://localhost:3000/api-docs
- **Especificación OpenAPI:** http://localhost:3000/api-docs/openapi.json

## 9. Pruebas automatizadas

El proyecto utiliza el ejecutor de pruebas nativo de Node.js.

Para ejecutar las pruebas:

```bash
npm test
```

Se incorporaron pruebas unitarias y de integración para verificar, entre otros aspectos:

- Validación de datos de entrada.
- Creación y consulta de solicitudes.
- Transiciones válidas e inválidas de estados.
- Manejo de errores HTTP.
- Actualizaciones concurrentes.
- Comportamiento de los endpoints.

**Importante:** para ejecutar las pruebas de integración, el servidor debe estar iniciado y disponible en `http://localhost:3000`.

## 10. Mejoras de calidad y refactorización

Como parte del trabajo académico se realizaron mejoras sobre el código fuente, aplicando criterios de Clean Code y principios SOLID.

Entre las principales modificaciones se encuentran:

- Extracción de métodos para mejorar la legibilidad.
- Separación de responsabilidades.
- Simplificación del manejo de parámetros.
- Centralización de las reglas de transición de estados.
- Incorporación de errores específicos.
- Validación de variables de entorno.
- Protección frente a actualizaciones concurrentes.
- Incorporación de pruebas automatizadas.

## 11. Documentación complementaria

En la carpeta `docs/` se encuentra la documentación técnica y las evidencias correspondientes al proceso de diagnóstico, refactorización y pruebas.

## 12. Estado actual

El backend se encuentra implementado y cuenta con pruebas automatizadas.

El frontend todavía no fue desarrollado y queda previsto como una etapa posterior del proyecto.

---

**Proyecto académico — Tecnicatura Universitaria en Programación**  
**Asignatura: Metodología de Sistemas II**