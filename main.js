let mapa, marcador;

function initMap() {
  mapa = L.map('mapa').setView([-34.6, -58.4], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapa);

  mapa.on('click', function(e) {
    const latlng = e.latlng;
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
      .then(res => res.json())
      .then(data => {
        document.getElementById("direccion").value = data.display_name || `${latlng.lat}, ${latlng.lng}`;
        if (marcador) mapa.removeLayer(marcador);
        marcador = L.marker([latlng.lat, latlng.lng]).addTo(mapa);
      });
  });
}

function habilitarFirma(canvas) {
  const ctx = canvas.getContext("2d");
  let dibujando = false;

  const iniciarDibujo = (x, y) => {
    dibujando = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const trazar = (x, y) => {
    if (!dibujando) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const detener = () => {
    dibujando = false;
  };

  const getXY = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.offsetX,
        y: e.offsetY
      };
    }
  };

  canvas.addEventListener("mousedown", e => {
    const { x, y } = getXY(e, canvas);
    iniciarDibujo(x, y);
  });

  canvas.addEventListener("mousemove", e => {
    const { x, y } = getXY(e, canvas);
    trazar(x, y);
  });

  canvas.addEventListener("mouseup", detener);
  canvas.addEventListener("mouseleave", detener);

  canvas.addEventListener("touchstart", e => {
    e.preventDefault();
    const { x, y } = getXY(e, canvas);
    iniciarDibujo(x, y);
  });

  canvas.addEventListener("touchmove", e => {
    e.preventDefault();
    const { x, y } = getXY(e, canvas);
    trazar(x, y);
  });

  canvas.addEventListener("touchend", detener);
}

document.addEventListener("DOMContentLoaded", () => {
  initMap();

  const firmaClienteToggle = document.getElementById("firmaClienteToggle");
  const firmaClienteCanvas = document.getElementById("firmaCliente");
  const firmaClienteTexto = document.getElementById("firmaClienteTexto");
  const firmaUsuarioCanvas = document.getElementById("firmaUsuario");

  firmaClienteToggle.addEventListener("change", () => {
    const visible = firmaClienteToggle.checked;
    firmaClienteCanvas.classList.toggle("oculto", !visible);
    firmaClienteTexto.classList.toggle("oculto", !visible);
  });

  habilitarFirma(firmaUsuarioCanvas);
  habilitarFirma(firmaClienteCanvas);

  const form = document.getElementById("reciboForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const datos = {
      nombre: document.getElementById("nombre").value,
      concepto: document.getElementById("concepto").value,
      monto: document.getElementById("monto").value,
      fecha: document.getElementById("fecha").value,
      formaPago: document.getElementById("formaPago").value,
      sena: document.getElementById("montoSena").value,
      direccion: document.getElementById("direccion").value,
      incluirFirmaCliente: firmaClienteToggle.checked,
      color: document.getElementById("colorRecibo").value
    };

    const resultado = document.getElementById("resultado");
    resultado.innerHTML = `
      <div id="recibo" style="padding:2rem;border:2px dashed ${datos.color};position:relative;">
        <h2>Recibo de Pago</h2>
        <p><strong>Cliente:</strong> ${datos.nombre}</p>
        <p><strong>Concepto:</strong> ${datos.concepto}</p>
        <p><strong>Monto:</strong> $${datos.monto}</p>
        <p><strong>Fecha:</strong> ${datos.fecha}</p>
        <p><strong>Forma de pago:</strong> ${datos.formaPago}</p>
        ${datos.formaPago === "Con seña" ? `<p><strong>Seña:</strong> $${datos.sena}</p>` : ""}
        <p><strong>Dirección:</strong> ${datos.direccion}</p>
        <div style="margin-top:1rem;"><strong>Firma Usuario:</strong><br><img src="${firmaUsuarioCanvas.toDataURL()}"/></div>
        ${datos.incluirFirmaCliente ? `<div style="margin-top:1rem;"><strong>Firma Cliente:</strong><br><img src="${firmaClienteCanvas.toDataURL()}"/></div>` : ""}
      </div>
      <button id="descargarPDF">Descargar PDF</button>
    `;

    document.getElementById("descargarPDF").addEventListener("click", () => {
      const recibo = document.getElementById("recibo");
      html2canvas(recibo).then(canvas => {
        const img = canvas.toDataURL("image/png");
        const pdf = new jspdf.jsPDF();
        const imgProps = pdf.getImageProperties(img);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(img, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("recibo.pdf");
      });
    });
  });
});
