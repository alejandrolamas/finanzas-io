# Finanzas.io - Aplicación de Gestión Financiera Personal

Finanzas.io es una aplicación web completa y moderna diseñada para ayudarte a tomar el control total de tus finanzas personales. Con una interfaz intuitiva y potentes funcionalidades, puedes rastrear tus ingresos y gastos, gestionar deudas, establecer objetivos de ahorro y obtener una visión clara de tu salud financiera, todo ello potenciado con un asistente de IA.

![Captura de pantalla del Dashboard de Finanzas.io](https://blob.v0.dev/pjtmy8OGJ.png)

## ✨ Funcionalidades Principales

La aplicación está repleta de características para cubrir todas tus necesidades financieras:

*   **📊 Dashboard Interactivo:** Visualiza un resumen completo de tu estado financiero de un vistazo, incluyendo saldo total, ahorros, deudas, balance mensual y gráficos de ingresos vs. gastos.
*   **💸 Gestión de Transacciones:** Registra, edita y elimina fácilmente tus ingresos y gastos. Filtra y busca en tu historial para encontrar cualquier movimiento.
*   **🏦 Cuentas Bancarias:** Gestiona múltiples cuentas (corrientes, de ahorro, inversión) y visualiza sus saldos.
*   **🏷️ Categorías y Presupuestos:** Organiza tus movimientos con categorías personalizables. Asigna presupuestos mensuales a las categorías de gastos y sigue tu progreso.
*   **💳 Gestión de Deudas y Créditos:** Lleva un control detallado de lo que debes y lo que te deben. Registra pagos parciales y visualiza el progreso hasta saldar la deuda.
*   **🎯 Objetivos de Ahorro:** Define metas financieras (un viaje, un gadget, un fondo de emergencia) y registra tus contribuciones para ver cómo te acercas a ellas.
*   **🔄 Movimientos Recurrentes:** Automatiza la creación de transacciones fijas como nóminas, suscripciones o alquileres.
*   **↔️ Transferencias entre Cuentas:** Mueve dinero entre tus propias cuentas de forma sencilla.
*   **📈 Estadísticas Detalladas:** Analiza tus patrones de gasto con gráficos de desglose por categoría y comparativas históricas.
*   **🤖 Asistente IA:**
    *   **Frases Motivadoras:** Recibe consejos y frases de ánimo personalizadas basadas en tu actividad reciente.
    *   **Chat Financiero:** Haz preguntas en lenguaje natural sobre tus finanzas y recibe análisis y consejos de un coach financiero virtual.
*   **🔐 Autenticación:** Sistema de inicio y cierre de sesión para proteger tu información.
*   **📱 Diseño Responsivo:** Experiencia de usuario optimizada tanto para escritorio (con sidebar) como para dispositivos móviles (con barra de navegación inferior).
*   **🎨 Tema Claro y Oscuro:** Cambia la apariencia de la aplicación según tus preferencias.

## 🚀 Stack Tecnológico

Este proyecto está construido con tecnologías modernas, eficientes y escalables:

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
*   **Base de Datos:** [MongoDB](https://www.mongodb.com/) con [Mongoose](https://mongoosejs.com/) ODM
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
*   **Componentes UI:** [shadcn/ui](https://ui.shadcn.com/)
*   **Gráficos:** [Recharts](https://recharts.org/)
*   **Gestión de Formularios:** [React Hook Form](https://react-hook-form.com/) y [Zod](https://zod.dev/) para validación
*   **Inteligencia Artificial:** [Vercel AI SDK](https://sdk.vercel.ai/) y [OpenAI](https://openai.com/)
*   **Animaciones:** [Framer Motion](https://www.framer.com/motion/)

## ⚙️ Instalación y Puesta en Marcha

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

### 1. Prerrequisitos

*   [Node.js](https://nodejs.org/en/) (versión 18 o superior)
*   [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/) o [pnpm](https://pnpm.io/)
*   Una cuenta de [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) para la base de datos.
*   Una clave API de [OpenAI](https://platform.openai.com/api-keys).

### 2. Clonar el Repositorio

\`\`\`bash
git clone https://github.com/tu-usuario/finanzas-io.git
cd finanzas-io
\`\`\`

### 3. Instalar Dependencias

\`\`\`bash
npm install
\`\`\`

### 4. Configurar Variables de Entorno

Crea un archivo llamado `.env.local` en la raíz del proyecto copiando el ejemplo `.env.example`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Ahora, edita el archivo `.env.local` y añade tus propias claves:

```plaintext file=".env.local"
# URL de conexión a tu base de datos MongoDB Atlas
# Reemplaza <user>, <password> y el nombre de tu cluster/base de datos.
MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.mongodb.net/finanzas-app?retryWrites=true&w=majority"

# URL base de tu aplicación en desarrollo.
# No es necesario cambiarla si corres el proyecto en el puerto 3000.
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Clave API de OpenAI para las funcionalidades de IA
OPENAI_API_KEY="sk-..."
