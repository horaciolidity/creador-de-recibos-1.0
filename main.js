const firmaUsuarioCanvas = document.getElementById("firmaUsuario");
const firmaClienteCanvas = document.getElementById("firmaCliente");
const firmaUsuarioCtx = firmaUsuarioCanvas.getContext("2d");
const firmaClienteCtx = firmaClienteCanvas.getContext("2d");

function habilitarFirma(canvas, ctx) {
  let dibujando = false;

  function getXY(e) {
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
  }

  function comenzar(e) {
    e.preventDefault();
    dibujando = true;
    const { x, y } = getXY(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function trazar(e) {
    if (!dibujando) return;
    e.preventDefault();
    const { x, y } = getXY(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function finalizar() {
    dibujando = false;
  }

  canvas.addEventListener("mousedown", comenzar);
  canvas.addEventListener("mousemove", trazar);
  canvas.addEventListener("mouseup", finalizar);
  canvas.addEventListener("touchstart", comenzar);
  canvas.addEventListener("touchmove", trazar);
  canvas.addEventListener("touchend", finalizar);
}

habilitarFirma(firmaUsuarioCanvas, firmaUsuarioCtx);
habilitarFirma(firmaClienteCanvas, firmaClienteCtx);

// Firma cliente opcional
document.getElementById("checkFirmaCliente").addEventListener("change", e => {
  document.getElementById("bloqueFirmaCliente").style.display = e.target.checked ? "block" : "none";
});

document.getElementById("guardarFirmaUsuario").onclick = () => {
  const firma = firmaUsuarioCanvas.toDataURL();
  localStorage.setItem("firmaUsuario", firma);
  alert("Firma del usuario guardada.");
};

document.getElementById("limpiarFirmaUsuario").onclick = () =>
  firmaUsuarioCtx.clearRect(0, 0, firmaUsuarioCanvas.width, firmaUsuarioCanvas.height);

document.getElementById("limpiarFirmaCliente").onclick = () =>
  firmaClienteCtx.clearRect(0, 0, firmaClienteCanvas.width, firmaClienteCanvas.height);

// Ubicación automática
document.getElementById("getUbicacion").onclick = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const link = `https://maps.google.com/?q=${lat},${lng}`;
      document.getElementById("direccionManual").value = link;
    }, err => {
      alert("Error al obtener la ubicación. Escribe la dirección manualmente.");
    });
  } else {
    alert("Tu navegador no permite geolocalización.");
  }
};

document.getElementById("reciboForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const incluirFirmaCliente = document.getElementById("checkFirmaCliente").checked;
  const conSena = document.getElementById("conSena").checked;

  const datos = {
    nombre: document.getElementById("nombre").value,
    concepto: document.getElementById("concepto").value,
    monto: document.getElementById("monto").value,
    fecha: document.getElementById("fecha").value,
    formaPago: document.getElementById("formaPago").value,
    direccion: document.getElementById("direccionManual").value,
    cuit: document.getElementById("cuit").value,
    color: document.getElementById("colorRecibo").value,
    marcaAgua: document.getElementById("marcaAgua").value,
    firmaCliente: incluirFirmaCliente ? firmaClienteCanvas.toDataURL() : "",
    firmaUsuario: localStorage.getItem("firmaUsuario") || "",
    conSena
  };

  localStorage.setItem("configColor", datos.color);
  localStorage.setItem("configMarcaAgua", datos.marcaAgua);

  const vista = document.getElementById("vistaPrevia");
  vista.innerHTML = `
    <div style="position: relative; background: ${datos.color}; padding: 1rem;">
      <div style="position:absolute;opacity:0.1;font-size:5em;top:50%;left:10%">${datos.marcaAgua}</div>
      <h2>RECIBO</h2>
      <p><strong>Cliente:</strong> ${datos.nombre}</p>
      <p><strong>Concepto:</strong> ${datos.concepto}</p>
      <p><strong>Monto:</strong> $${datos.monto}</p>
      <p><strong>Fecha:</strong> ${datos.fecha}</p>
      <p><strong>Forma de Pago:</strong> ${datos.formaPago}${datos.conSena ? " (con seña)" : ""}</p>
      <p><strong>Dirección:</strong> <a href="${datos.direccion}" target="_blank">${datos.direccion}</a></p>
      <p><strong>CUIT/CUIL:</strong> ${datos.cuit}</p>
      <p><strong>Firma Usuario:</strong><br><img src="${datos.firmaUsuario}" style="width:150px"></p>
      ${incluirFirmaCliente ? `<p><strong>Firma Cliente:</strong><br><img src="${datos.firmaCliente}" style="width:250px"></p>` : ""}
    </div>
  `;
});

document.getElementById("descargarPDF").onclick = () => {
  const element = document.getElementById("vistaPrevia");
  html2pdf().from(element).save("recibo.pdf");
};

document.getElementById("enviarWhatsApp").onclick = () => {
  const mensaje = encodeURIComponent("Hola, te comparto el recibo de tu operación. Puedes descargarlo como PDF.");
  window.open(`https://wa.me/?text=${mensaje}`, "_blank");
};

window.addEventListener("DOMContentLoaded", () => {
  const color = localStorage.getItem("configColor");
  const marcaAgua = localStorage.getItem("configMarcaAgua");
  if (color) document.getElementById("colorRecibo").value = color;
  if (marcaAgua) document.getElementById("marcaAgua").value = marcaAgua;
});
