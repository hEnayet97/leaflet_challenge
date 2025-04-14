// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors & CartoDB' //Used CartoDB so that it is different from the open street maps
});

// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create the map object with center and zoom options.
let map = L.map("map", {
  center: [37.0983, -95.5795],
  zoom: 4,
  layers: [basemap]
});

// Then add the 'basemap' tile layer to the map.
basemap.addTo(map);

// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
let earthquakes = new L.LayerGroup();
let tectonic_plates = new L.LayerGroup();

// Add a control to the map that will allow the user to change which layers are visible.
let baseMaps = {
  "Street Map": streets,
  "Basemap": basemap
};

let overlayMaps = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonic_plates
};

L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(map);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      opacity: 0.75,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]), // Depth
      color: "black", // set outline to black
      radius: getRadius(feature.properties.mag), // Magnitude
      stroke: true
    };

  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    if (depth <= 10) {
      return "#00ff00"; // green
    } else if (depth <= 30) {
      return "#ffff66"; // light yellow
    } else if (depth <= 50) {
      return "#ffff00"; // yellow
    } else if (depth <= 70) {
      return "#ff9900"; // orange
    } else if (depth <= 90) {
      return "#ff6666"; // light red
    } else {
      return "#ff0000"; // red
    }
}

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return magnitude * 1
    };
    return magnitude * 5
  };

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },

    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        "<h3>Magnitude: " + feature.properties.mag + "</h3>" +
        "<h3>Location: " + feature.properties.place + "</h3>"
      );
    }
  }).addTo(earthquakes); // add to earthquake layer

  // OPTIONAL: Step 2
  // Add the data to the earthquake layer instead of directly to the map.
  earthquakes.addTo(map);

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    // Initialize depth intervals and colors for the legend
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = [
      "#00ff00", // green
      "#ffff66", // light yellow
      "#ffff00", // yellow
      "#ff9900", // orange
      "#ff6666", // light red
      "#ff0000"  // red
    ];

    // Loop through our depth intervals to generate a label with a colored square for each interval.
    for (var i = 0; i < depths.length; i++) {
      div.innerHTML +=
      '<i style="background:' + colors[i] + '"></i> ' +
      depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
  } // Added legend formatting from leaflet Interactive Choropleth Map Tutorial to style.css
    return div;
  };

  // Finally, add the legend to the map.
  legend.addTo(map);

  // OPTIONAL: Step 2
  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Save the geoJSON data, along with style information, to the tectonic_plates layer.
    L.geoJson (plate_data, {
      color: "orange",
      weight: 2
    }).addTo(tectonic_plates);

    // Then add the tectonic_plates layer to the map.
    tectonic_plates.addTo(map);
  });
});