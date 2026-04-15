# Guía de Estilos y Especificación de UI (Template Genérico)

Esta guía define los cimientos visuales y de comportamiento para replicar la interfaz de usuario en cualquier sistema basado en React y Tailwind CSS.

## 1. Stack Tecnológico Recomendado
*   **Framework:** React 18+ (Vite)
*   **Estilos:** Tailwind CSS 3.4+
*   **Iconografía:** Lucide React
*   **Componentes UI:** Headless UI (Sin estilos para máxima personalización)
*   **Notificaciones:** React Hot Toast
*   **Gráficos:** Recharts

## 2. Paleta de Colores (Tokens)
Configuración para `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb', // Color de acción principal
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
      gray: {
        // Escala neutra por defecto de Tailwind (Slate o Gray)
      }
    },
  },
}
```

### Aplicación Semántica
*   **Fondo Cuerpo:** `bg-gray-50` (Light) / `bg-gray-900` (Dark)
*   **Texto Principal:** `text-gray-900` (Light) / `text-gray-100` (Dark)
*   **Éxito:** `#10b981` (Emerald-500)
*   **Error:** `#ef4444` (Red-500)

## 3. Tipografía
*   **Familia:** San-serif nativa del sistema (Modern UI stack).
*   **Configuración:** Inherente a la clase `sans` de Tailwind.
*   **Pesos sugeridos:**
    *   Títulos: `font-bold` o `font-semibold`
    *   Cuerpo: `font-normal`
    *   Botones/Labels: `font-medium`

## 4. Estilos de Componentes Base (CSS Unificado)
Implementar en el archivo CSS global (`index.css`):

```css
@layer components {
  /* Contenedores Elevados */
  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700;
  }

  /* Botonería Standard */
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
  }

  .btn-primary {
    @apply btn bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
  }

  .btn-secondary {
    @apply btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600;
  }

  /* Entradas de Datos */
  .input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100;
  }

  .label {
    @apply block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300;
  }
}
```

## 5. Animaciones y UX
*   **Transiciones:** Usar `transition-colors duration-200` en todos los elementos interactivos para suavizar cambios de estado y Dark Mode.
*   **Cargas:** Spinner animado con `animate-spin`.
*   **Micro-interacciones:** Escalamientos sutiles o cambios de brillo en hover para botones.

## 6. Arquitectura de Navegación
*   **Layout:** Estructura persistente con Sidebar lateral (izquierda) y Header superior para acciones rápidas y perfil.
*   **Responsividad:** Mobile-first. Sidebar colapsable o menú hamburguesa en dispositivos móviles.
*   **Modo Oscuro:** Activación mediante clase `.dark` en el elemento `<html>`.

## 7. Manejo de Diálogos y Feedback
*   **Toasts:** Fondo oscuro (`#363636`) con texto blanco para notificaciones rápidas.
*   **Modales:** Centrados, con overlay semitransparente oscuro y animación de entrada suave (fade + scale).
