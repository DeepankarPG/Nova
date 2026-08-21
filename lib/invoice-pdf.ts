import type jsPDF from "jspdf";

/**
 * Rasterizes the given DOM node and saves it as a paginated A4 PDF.
 * html2canvas-pro (not plain html2canvas) is required because Tailwind v4
 * emits modern CSS color functions (oklch/color-mix) that plain
 * html2canvas cannot parse and would silently render as black boxes.
 */
export async function downloadNodeAsPdf(node: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { default: JsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const pdf: jsPDF = new JsPDF({ unit: "px", format: [canvas.width, canvas.height] });
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(filename);
}
