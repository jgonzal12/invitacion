const { PDFDocument, rgb, StandardFonts } = PDFLib;

// CONFIGURACIÓN
const URL_IMAGEN_FONDO = '../img/night.png';
const API_URL = '/api/ticket'; // NUESTRA API AZURE

const btn = document.getElementById('btnGenerar');
const spanContador = document.getElementById('displayContador');

// --- 1. OBTENER NÚMERO DESDE NUESTRA API ---
async function obtenerNumeroTicket() {
  console.log("Solicitando número al servidor...");

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!res.ok) {
    throw new Error("Error al obtener el número");
  }

  const data = await res.json();
  console.log("Número asignado:", data.numero);

  return data.numero;
}

// --- 2. CREAR PDF (TU LÓGICA, SIN CAMBIOS) ---
async function generarTicket(numero) {
  const imagenBytes = await fetch(URL_IMAGEN_FONDO).then(res => res.arrayBuffer());

  const pdfDoc = await PDFDocument.create();

  const imagenFondo = URL_IMAGEN_FONDO.toLowerCase().endsWith('.png')
    ? await pdfDoc.embedPng(imagenBytes)
    : await pdfDoc.embedJpg(imagenBytes);

  const { width, height } = imagenFondo.scale(1);
  const page = pdfDoc.addPage([width, height]);

  page.drawImage(imagenFondo, {
    x: 0,
    y: 0,
    width,
    height
  });

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const text = `#${numero}`;
  const size = 50;
  const textWidth = font.widthOfTextAtSize(text, size);

  page.drawText(text, {
    x: (width - textWidth) / 2,
    y: height -650,
    size,
    font,
    color: rgb(1, 1, 1)
  });

  const pdfBytes = await pdfDoc.save();
  downloadBlob(pdfBytes, `Ticket_JAGH_${numero}.pdf`, 'application/pdf');
}

// --- HELPER DESCARGA ---
function downloadBlob(data, fileName, mimeType) {
  const blob = new Blob([data], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}

// --- EVENTO PRINCIPAL ---
btn.addEventListener('click', async () => {
  if (btn.disabled) return;

  const textoOriginal = btn.innerText;
  btn.disabled = true;
  btn.innerText = "Asignando número...";

  try {
    // 1️⃣ Número DESDE SERVIDOR
    const numero = await obtenerNumeroTicket();

    // 2️⃣ Mostrar número
    spanContador.innerText = numero;

    // 3️⃣ Crear PDF
    btn.innerText = "Creando PDF...";
    await generarTicket(numero);

    btn.innerText = "¡Ticket descargado!";
  } catch (error) {
    alert("Error al generar el ticket");
    console.error(error);
    btn.innerText = "Error";
  }

  btn.disabled = false;

  setTimeout(() => {
    btn.innerText = textoOriginal;
  }, 3000);
});