import Papa from "papaparse";

export const WOO_REQUIRED_FIELDS = [
  { key: "Name", aliases: ["nombre", "name", "titulo", "title", "product", "producto"] },
  { key: "SKU", aliases: ["sku", "referencia", "ref", "id", "code", "codigo"] },
  { key: "Regular price", aliases: ["precio", "price", "regular price", "valor", "costo", "cost"] },
  { key: "Sale price", aliases: ["precio rebajado", "sale price", "oferta", "descuento"] },
  { key: "Categories", aliases: ["categorias", "categories", "category", "categoria", "tags"] },
  { key: "Images", aliases: ["imagenes", "images", "img", "foto", "photos", "urls", "gallery"] },
  { key: "Description", aliases: ["descripcion", "description", "texto", "body", "content", "contenido"] },
  { key: "Short description", aliases: ["descripcion corta", "short description", "resumen", "summary"] },
  { key: "Weight (kg)", aliases: ["peso", "weight", "masa"] },
  { key: "Shipping class", aliases: ["clase de envio", "shipping class", "envio", "clase"] },
  { key: "Attribute 1 name", aliases: ["color", "talla", "size", "material", "atributo", "attribute"] },
  { key: "Attribute 1 value(s)", aliases: ["valor", "values", "opciones", "options"] },
  { key: "Attribute 2 name", aliases: ["marca", "brand", "modelo", "model"] },
  { key: "Attribute 2 value(s)", aliases: ["valor 2", "values 2"] },
  { key: "Attribute 3 name", aliases: ["material", "composicion"] },
  { key: "Attribute 3 value(s)", aliases: ["valor 3"] },
  { key: "Attribute 4 name", aliases: ["dimensiones", "medidas"] },
  { key: "Attribute 4 value(s)", aliases: ["valor 4"] },
  { key: "Attribute 5 name", aliases: ["garantia", "warranty"] },
  { key: "Attribute 5 value(s)", aliases: ["valor 5"] },
];

export function guessMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  WOO_REQUIRED_FIELDS.forEach((field) => {
    const match = headers.find((h) =>
      field.aliases.some((alias) => h.toLowerCase().includes(alias.toLowerCase()))
    );
    if (match) {
      mapping[field.key] = match;
    }
  });

  return mapping;
}

export function cleanPrice(value: string): string {
  if (!value) return "";
  const cleaned = value.replace(/[^\d.,]/g, "").replace(",", ".");
  return cleaned || "";
}

export function cleanImages(value: string): string {
  if (!value) return "";
  return value.split(/[|;\s]+/).filter(Boolean).join(", ");
}

export interface TransformationResult {
  data: any[];
  fileName: string;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function transformCSV(
  rawData: any[],
  mapping: Record<string, string>
): string {
  const transformedData = rawData.map((row, index) => {
    const newRow: Record<string, any> = {};

    // 1. Core Fields (Always present)
    newRow["Type"] = "simple";
    newRow["Published"] = "1";
    newRow["Is featured?"] = "0";
    newRow["Visibility in catalog"] = "visible";
    newRow["In stock?"] = "1";
    newRow["Backorders allowed?"] = "0";
    newRow["Sold individually?"] = "0";

    // 2. Mapped Fields with processing
    const fieldHandlers: Record<string, (val: string) => string> = {
      "Regular price": cleanPrice,
      "Sale price": cleanPrice,
      "Images": cleanImages,
    };

    // Use a fixed order for common columns
    const order = [
      "SKU", "Name", "Categories", "Regular price", "Sale price", 
      "Images", "Description", "Short description", "Weight (kg)", 
      "Shipping class"
    ];

    order.forEach(key => {
      const sourceCol = mapping[key];
      if (key === "SKU" && (!sourceCol || !row[sourceCol])) {
        const nameCol = mapping["Name"];
        const productName = row[nameCol] || "product";
        const rand = Math.random().toString(36).substring(2, 6);
        newRow["SKU"] = `${slugify(productName).slice(0, 10)}-${rand}`;
      } else if (sourceCol) {
        let val = row[sourceCol] || "";
        if (fieldHandlers[key]) val = fieldHandlers[key](val);
        newRow[key] = val;
      } else if (["SKU", "Name"].includes(key)) {
        newRow[key] = ""; // Keep placeholder for key fields
      }
    });

    // 3. Attributes handling (Technical Sheet style)
    for (let i = 1; i <= 5; i++) {
      const nameKey = `Attribute ${i} name`;
      const valKey = `Attribute ${i} value(s)`;
      
      const mappedName = mapping[nameKey];
      const mappedVal = mapping[valKey];
      
      if (mappedName && mappedVal) {
        newRow[nameKey] = row[mappedName] || "";
        newRow[valKey] = row[mappedVal] || "";
        newRow[`Attribute ${i} visible`] = "1";
        newRow[`Attribute ${i} global`] = "1";
        newRow[`Attribute ${i} variation`] = "0"; // 0 means it's just info, not a variation
      }
    }

    return newRow;
  });

  return Papa.unparse(transformedData);
}

export function downloadCSV(csvContent: string, fileName: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
