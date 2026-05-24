"use client";

import React, { useState, useCallback, useRef } from "react";
import Papa from "papaparse";
import {
  Upload,
  Download,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Sparkles,
  RefreshCw,
  Zap,
  Table2,
  Plus,
  X,
} from "lucide-react";
import {
  guessMapping,
  WOO_REQUIRED_FIELDS,
  transformCSV,
  downloadCSV,
} from "@/lib/csv-utils";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STEP_NAMES = ["Carga", "Mapeo", "Descarga"];

export default function CSVTranslator() {
  const [step, setStep] = useState(1);
  const [rawData, setRawData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [activeFields, setActiveFields] = useState<string[]>(WOO_REQUIRED_FIELDS.map(f => f.key));
  const [reverseRows, setReverseRows] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const fileHeaders = Object.keys(results.data[0] || {});
          setRawData(results.data);
          setHeaders(fileHeaders);
          const guessed = guessMapping(fileHeaders);
          setMapping(guessed);
          
          // Smart selection of active fields
          const initialActive = WOO_REQUIRED_FIELDS
            .filter(f => guessed[f.key] || ["Name", "Regular price", "SKU"].includes(f.key))
            .map(f => f.key);
          setActiveFields(initialActive);
          setStep(2);
        },
      });
    },
    []
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.name.endsWith(".csv")) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const fileHeaders = Object.keys(results.data[0] || {});
        setRawData(results.data);
        setHeaders(fileHeaders);
        const guessed = guessMapping(fileHeaders);
        setMapping(guessed);
        
        const initialActive = WOO_REQUIRED_FIELDS
          .filter(f => guessed[f.key] || ["Name", "Regular price", "SKU"].includes(f.key))
          .map(f => f.key);
        setActiveFields(initialActive);
        setStep(2);
      },
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleMappingChange = useCallback(
    (wooField: string, userField: string) => {
      setMapping((prev) => ({ ...prev, [wooField]: userField }));
    },
    []
  );

  const toggleField = (fieldKey: string) => {
    setActiveFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handleTransform = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const finalMapping: Record<string, string> = {};
      activeFields.forEach(f => {
        finalMapping[f] = mapping[f];
      });
      
      const dataToProcess = reverseRows ? [...rawData].reverse() : rawData;
      const csv = transformCSV(dataToProcess, finalMapping);
      downloadCSV(csv, "woocommerce_ready.csv");
      setIsProcessing(false);
      setStep(3);
    }, 1000);
  };

  const reset = () => {
    setStep(1);
    setRawData([]);
    setHeaders([]);
    setMapping({});
    setActiveFields(WOO_REQUIRED_FIELDS.map(f => f.key));
  };

  const canTransform = activeFields.length > 0 && activeFields.every(
    (f) => f === "SKU" || mapping[f]
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(245,158,11,0.08)] border border-[#f59e0b]/20 text-[#f59e0b] text-xs font-medium tracking-wide uppercase">
          <Sparkles size={12} />
          Herramienta de traducción
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          CSV <span className="text-[#f59e0b]">Smart</span> Translator
        </h1>
        <p className="text-[#a1a1aa] text-base max-w-lg mx-auto leading-relaxed">
          Transforma archivos CSV de scrapers y marketplaces en productos
          listos para importar en WooCommerce.
        </p>
      </header>

      {/* Steps Indicator */}
      <div className="flex items-center justify-center gap-0 max-w-md mx-auto">
        {STEP_NAMES.map((name, i) => {
          const s = i + 1;
          const isActive = step === s;
          const isCompleted = step > s;
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "relative w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                    isCompleted && "bg-[#10b981] text-white shadow-lg shadow-[#10b981]/20",
                    isActive && "bg-[#f59e0b] text-black shadow-lg shadow-[#f59e0b]/25",
                    !isActive && !isCompleted && "bg-[#18181b] text-[#52525b] border border-[#27272a]"
                  )}
                >
                  {isCompleted ? <CheckCircle2 size={18} /> : <span>{s}</span>}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium tracking-wide transition-colors duration-300",
                    isCompleted && "text-[#10b981]",
                    isActive && "text-[#f59e0b]",
                    !isActive && !isCompleted && "text-[#52525b]"
                  )}
                >
                  {name}
                </span>
              </div>
              {i < STEP_NAMES.length - 1 && (
                <div className="relative flex-1 mx-3 mb-6">
                  <div className="h-[2px] bg-[#27272a] rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full bg-[#f59e0b] rounded-full transition-all duration-500",
                        step > s ? "w-full" : step === s ? "w-1/3" : "w-0"
                      )}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Main Content Card */}
      <div className="relative bg-[#0e0e10]/80 border border-[#222226] rounded-3xl p-6 md:p-10 backdrop-blur-xl min-h-[420px] flex flex-col justify-center transition-all duration-300">
        {step === 1 && (
          <div
            className="space-y-6"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div
              className={cn(
                "group relative border-2 border-dashed rounded-2xl p-14 md:p-20 text-center transition-all duration-300 cursor-pointer overflow-hidden",
                isDragOver
                  ? "border-[#f59e0b] bg-[#f59e0b]/5"
                  : "border-[#27272a] hover:border-[#f59e0b]/40 hover:bg-[#f59e0b]/[0.02]"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              <div className="flex flex-col items-center gap-5">
                <div className="p-5 rounded-2xl bg-[#18181c] text-[#a1a1aa] group-hover:scale-110 group-hover:text-[#f59e0b] group-hover:bg-[#f59e0b]/10 transition-all">
                  <Upload size={36} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-lg font-semibold text-white">Sube tu archivo CSV</p>
                  <p className="text-sm text-[#71717a]">Arrastra y suelta o haz clic para seleccionar</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Table2 size={20} className="text-[#f59e0b]" />
                  Configurar Campos
                </h2>
                <p className="text-sm text-[#71717a] mt-1">Elige qué datos exportar y mapea su origen.</p>
              </div>
              <div className="flex items-center gap-2 text-sm bg-[#18181c] border border-[#27272a] rounded-lg px-3 py-1.5">
                <Zap size={14} className="text-[#f59e0b]" />
                <span className="text-[#a1a1aa] font-medium">{rawData.length} filas detectadas</span>
              </div>
            </div>

            {/* Field Toggles */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap gap-2 flex-1">
                {WOO_REQUIRED_FIELDS.map((field) => (
                  <button
                    key={field.key}
                    onClick={() => toggleField(field.key)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 border",
                      activeFields.includes(field.key)
                        ? "bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]"
                        : "bg-[#18181c] border-[#27272a] text-[#52525b] hover:border-[#3f3f46]"
                    )}
                  >
                    {activeFields.includes(field.key) ? <CheckCircle2 size={12} /> : <Plus size={12} />}
                    {field.key}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setReverseRows(!reverseRows)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all border",
                  reverseRows 
                    ? "bg-blue-500/10 border-blue-500/40 text-blue-400" 
                    : "bg-[#18181c] border-[#27272a] text-[#52525b]"
                )}
              >
                <RefreshCw size={14} className={reverseRows ? "rotate-180 transition-transform" : ""} />
                {reverseRows ? "Orden Invertido" : "Invertir Orden"}
              </button>
            </div>

            <div className="grid gap-3">
              {WOO_REQUIRED_FIELDS.filter(f => activeFields.includes(f.key)).map((field) => (
                <div
                  key={field.key}
                  className="grid grid-cols-1 md:grid-cols-[1fr_auto_1.5fr_auto] items-center gap-3 md:gap-4 p-4 rounded-xl border bg-[#121214] border-[#222226]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                    <span className="text-sm font-medium text-[#e4e4e7] truncate">{field.key}</span>
                  </div>
                  <ArrowRight size={16} className="text-[#52525b] hidden md:block" />
                  <select
                    value={mapping[field.key] || ""}
                    onChange={(e) => handleMappingChange(field.key, e.target.value)}
                    className="w-full text-sm rounded-lg border border-[#27272a] bg-[#0e0e10] text-[#e4e4e7] p-2.5 focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] outline-none"
                  >
                    <option value="">
                      {field.key === "SKU" ? "✨ Generar automáticamente" : "Selecciona origen..."}
                    </option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <button onClick={() => toggleField(field.key)} className="p-2 text-[#52525b] hover:text-red-400 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>

            {activeFields.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-[#27272a] rounded-xl text-[#52525b]">
                No hay campos seleccionados.
              </div>
            )}

            <button
              onClick={handleTransform}
              disabled={isProcessing || !canTransform}
              className="w-full py-4 px-6 font-bold rounded-xl bg-[#f59e0b] text-black disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#f59e0b]/20 flex items-center justify-center gap-2"
            >
              {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
              <span>{isProcessing ? "Procesando..." : "Transformar y Descargar"}</span>
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6 py-8 animate-scale-in">
            <div className="mx-auto w-20 h-20 bg-[#10b981]/10 rounded-full flex items-center justify-center">
              <CheckCircle2 size={40} className="text-[#10b981]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">¡Archivo Listo!</h2>
              <p className="text-[#a1a1aa]">Tu CSV se ha procesado correctamente.</p>
            </div>
            <button onClick={reset} className="px-8 py-3 bg-[#18181c] border border-[#27272a] text-white rounded-xl hover:bg-[#222226] transition-all">
              Procesar otro archivo
            </button>
          </div>
        )}
      </div>

      <footer className="text-center text-[#3f3f46] text-xs">
        © 2026 WooCommerce CSV Smart Translator. Procesamiento en cliente.
      </footer>
    </div>
  );
}
