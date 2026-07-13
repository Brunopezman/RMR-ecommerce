/**
 * Minimal type declarations for jsPDF (loaded from CDN as window.jspdf).
 * We only use a subset of its API.
 */
declare interface JsPDF {
  setFont(font: string, style: string): void;
  setFontSize(size: number): void;
  text(text: string, x: number, y: number): void;
  addPage(): void;
  save(filename: string): void;
}

interface JsPDFConstructor {
  new (orientation?: string, unit?: string, format?: string): JsPDF;
}

interface Window {
  jspdf: {
    jsPDF: JsPDFConstructor;
  };
}
