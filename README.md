# MundoBiker — Comunidad de Motociclistas

Pequeña descripción: panel y gestión para clubes, eventos y miembros con autenticación JWT y una UX móvil-first.

## Resumen (qué hay hasta ahora)

- Frontend en Next.js (App Router) con TypeScript.
- Autenticación JWT contra un backend (se diseñó para Django REST Framework).
- Formularios con React Hook Form + Zod para validación tipada y mensajes en español.
- Gestión global de auth con React Context + useReducer, tokens en localStorage y refresh automático.
- UI con Tailwind CSS y componentes reutilizables bajo `components/ui/`.
- Navegación móvil: barra superior (usuario + logout) y navegación inferior fija.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- React Hook Form + Zod
- React Context + useReducer (auth)
- Django REST Framework (backend, se espera endpoints JWT)

## Funcionalidades implementadas

- Registro e inicio de sesión con validación cliente.
- Gestión de tokens (access / refresh) con refresh automático y cierre de sesión al fallar.
- Dashboard protegido (`app/page.tsx`) que redirige a `/auth/login` si no hay sesión.
- `TopNavigation` muestra el usuario conectado y el botón de cerrar sesión.
- `BottomNavigation` para navegación móvil.
- Componentes UI: tarjetas, botones, formularios, inputs.

## Estructura relevante

- `app/` — rutas y layout
- `app/layout.tsx` — provee `AuthProvider`, `TopNavigation` y `BottomNavigation`
- `contexts/AuthContext.tsx` — estado de auth y acciones (login, logout, refresh)
- `components/navigation/TopNavigation.tsx` — barra superior con usuario
- `components/navigation/BottomNavigation.tsx` — navegación inferior móvil
- `components/ui/` — primitives (button, input, card, form)

## Desarrollo local

1. Copia el ejemplo de variables de entorno y ajusta (crear `.env.local`):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

2. Instala dependencias y ejecuta en modo desarrollo:

```bash
npm install
npm run dev
```

3. Abre http://localhost:3000

Nota: la app espera un backend con endpoints JWT (por ejemplo `/api/auth/jwt-create/` y `/api/auth/jwt-refresh/`).

## Notas de arquitectura y decisiones

- `AuthContext` centraliza la lógica de autenticación; sus acciones están memoizadas para evitar renders innecesarios y ciclos de efecto.
- Tokens se guardan en `localStorage` para simplicidad; para producción considerar httpOnly cookies.
- Las páginas que requieren sesión verifican `state.isAuthenticated` y `state.user` y redirigen si no hay sesión.

## Próximos pasos recomendados

- Añadir tests de integración para flujo de login / refresh.
- Mejorar manejo de errores e introducir toasts o alertas globales.
- Evaluar estrategias de almacenamiento de tokens más seguras (httpOnly cookies) y CSRF.
- Crear scripts o documentación de despliegue (Vercel, Docker, etc.).

---

Si quieres, añado una sección "Troubleshooting" con errores comunes y variables de entorno necesarias.
