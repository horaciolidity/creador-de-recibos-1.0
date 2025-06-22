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

document.addEventListener("DOMContentLoaded", () => {
  initMap();

  const firmaClienteToggle = document.getElementById("firmaClienteToggle");
  const firmaClienteCanvas = document.getElementById("firmaCliente");

  firmaClienteToggle.addEventListener("change", () => {
    firmaClienteCanvas.classList.toggle("oculto", !firmaClienteToggle.checked);
  });
});
