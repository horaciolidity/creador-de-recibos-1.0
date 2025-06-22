let mapa, marcador, geocoder, autocomplete;

function initMap() {
  const mapaElemento = document.getElementById("mapa");
  mapa = new google.maps.Map(mapaElemento, {
    center: { lat: -34.6, lng: -58.4 },
    zoom: 14
  });

  geocoder = new google.maps.Geocoder();
  const input = document.getElementById("direccion");
  autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo("bounds", mapa);

  mapa.addListener("click", function(event) {
    geocoder.geocode({ location: event.latLng }, (results, status) => {
      if (status === "OK" && results[0]) {
        input.value = results[0].formatted_address;
        colocarMarcador(event.latLng);
      }
    });
  });
}

function colocarMarcador(ubicacion) {
  if (marcador) marcador.setMap(null);
  marcador = new google.maps.Marker({
    position: ubicacion,
    map: mapa
  });
}

function habilitarFirma(canvas) {
  const ctx = canvas.getContext("2d");
  let dibujando = false;

  canvas.addEventListener("mousedown", (e) => {
    dibujando = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (dibujando) {
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    }
  });

  canvas.addEventListener("mouseup", () => { dibujando = false; });
  canvas.addEventListener("mouseleave", () => { dibujando = false; });
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
