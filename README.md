# WooCommerce CSV Smart Translator

Transforma archivos CSV de scrapers y marketplaces en productos listos para importar en WooCommerce.

## ✨ Funcionalidades

- **Subida inteligente** — Arrastrá y soltá tu CSV o seleccionalo desde el explorador
- **Mapeo automático de columnas** — Detecta automáticamente la correspondencia entre las columnas de tu CSV y los campos de WooCommerce
- **Vista previa en tiempo real** — Visualizá las primeras filas antes de transformar
- **Generación automática de SKU** — Si no tenés SKU, los genera con formato `nombre-producto-xxxx`
- **Limpieza de datos** — Precios, imágenes y categorías se normalizan automáticamente
- **Descarga directa** — El archivo transformado se descarga al instante
- **100% en el cliente** — Ningún dato se sube a ningún servidor, todo queda en tu navegador

## Requisitos

- Node.js 18+
- npm / pnpm / yarn

## Instalación

```bash
git clone <repo-url>
cd woocommerce-csv-translator
npm install
```

## Desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en tu navegador.

## Build

```bash
npm run build
npm start
```

## Tecnologías

- [Next.js 14](https://nextjs.org/) (App Router)
- [React 18](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PapaParse](https://www.papaparse.com/) — Parseo de CSV
- [Lucide](https://lucide.dev/) — Iconos
- [Syne](https://fonts.google.com/specimen/Syne) + [DM Sans](https://fonts.google.com/specimen/DM+Sans) — Tipografía

## Estructura

```
src/
├── app/
│   ├── globals.css      # Estilos globales y animaciones
│   ├── icon.svg         # Favicon
│   ├── layout.tsx       # Layout con fuentes
│   └── page.tsx         # Página principal con fondo
├── components/
│   └── CSVTranslator.tsx # Componente principal
└── lib/
    └── csv-utils.ts     # Lógica de transformación CSV
```

## Cómo funciona

1. **Carga** — Subí un archivo CSV (de AliExpress, scraper, etc.)
2. **Mapeo** — Asigná las columnas del CSV a los campos de WooCommerce (se auto-detectan)
3. **Descarga** — Recibí un CSV limpio listo para importar en WooCommerce

## Licencia

MIT
