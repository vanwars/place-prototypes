let numColumns = 4;
let mapData;
let mapMarkers = [];
let mymap;
const url = "../results/data.json";


const saveData = (data) => {
    mapData = data;
};

const generateCard = (map) => {
    let paragraphs = '';
    if (map.paragraphs.length > 1) {
        for (para of map.paragraphs.slice(1)) {
            paragraphs += `<p>${para}</p>`;
        }
    }
    let placeInfo = '';
    let geom = '';
    if (map.location) {
        let locale = '';
        if (map.location.city) {
            locale += map.location.city + ', ';
        }
        if (map.location.state) {
            locale += map.location.state + ', ';
        }
        if (map.location.country) {
            locale += map.location.country;
        }
        if (map.location.geometry && map.location.geometry.lng && map.location.geometry.lat) {
            let lat = parseFloat(map.location.geometry.lat);
            let lng = parseFloat( map.location.geometry.lng)
            geom = '(' + lat.toFixed(3) + ', ' + lng.toFixed(3) + ')';
        }
        placeInfo = `
            <table>
                <tr>
                    <th>Original:</th>
                    <td>${map.place}</td>
                </tr>
                <tr>
                    <th>Geocoded:</th>
                    <td>${locale}</td>
                </tr>
                <tr>
                    <th>Coordinates</th>
                    <td>
                        <i class="fas fa-map-marker-alt"></i> 
                        ${geom}
                    </td>
                </tr>
            </table>
        `;
    }
    return `<div class="card">
        <div>
            <h2>${map.header}</h2>
            <div class="metadata">Metadata!</div>
            <p>${map.paragraphs[0]}</p>
            <img src="${map.image_source}" />
            ${paragraphs}
            <p><strong>${map.footer}</strong></p>
            ${placeInfo}
            <span class="tag">${map.tags.join('</span><span class="tag">')}</span>
        </div>
   </div>`;
};

const drawMap = () => {
    //OSM tiles attribution and URL
		var osmLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
		var osmURL = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		var osmAttrib = '&copy; ' + osmLink;
		
		//Carto tiles attribution and URL
		var cartoLink = '<a href="http://cartodb.com/attributions">CartoDB</a>';
		var cartoURL = 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
		var cartoAttrib = '&copy; ' + osmLink + ' &copy; ' + cartoLink;

		//Stamen Toner tiles attribution and URL
		var tonerURL = 'http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}';
		var watercolorURL = 'http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}';
		var stamenAttrib = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';

		//Creation of map tiles
		var osmMap = L.tileLayer(osmURL, {attribution: osmAttrib});
		// var cartoMap = L.tileLayer(cartoURL, {attribution: cartoAttrib});
		var tonerMap = L.tileLayer(tonerURL,{
			attribution: stamenAttrib,
			subdomains: 'abcd',
			minZoom: 0,
			maxZoom: 20,
			ext: 'png'
        });
        var watercolorMap = L.tileLayer(watercolorURL,{
			attribution: stamenAttrib,
			subdomains: 'abcd',
			minZoom: 0,
			maxZoom: 20,
			ext: 'png'
		});
        mymap = L.map('mapid', {
            layers: [watercolorMap]
        }).setView([51.505, -0.09], 2);

		//Base layers definition and addition
		var baseLayers = {
			"OSM Mapnik": osmMap,
			"Stamen Toner": tonerMap,
			"Stamen Watercolor": watercolorMap
		};
	  
		 //Add baseLayers to map as control layers
		 L.control.layers(baseLayers).addTo(mymap);
};

const renderData = () => {
    document.querySelector('main').classList.remove('with-card');
    
    if (mapMarkers.length > 0) {
        for(mapMarker of mapMarkers) {
            mymap.removeLayer(mapMarker);
        }
        mapMarkers = [];
    }
    const visibleMapData = mapData.filter(map => !map.hide && map.location && map.location.geometry);
    
    for (const map of visibleMapData) {
        const lat = parseFloat(map.location.geometry.lat);
        const lng = parseFloat(map.location.geometry.lng);
        const marker = L.marker([lat, lng], map).addTo(mymap);
        // marker.extend(map);
        marker.on('click', function(e) {
            console.log(map);
            document.querySelector('main').classList.add('with-card');
            document.querySelector('#card-holder').innerHTML = generateCard(map);
        });
        mapMarkers.push(marker);
        marker.bindPopup(map.place);
    }
}

const init = () => {
    fetch(url)
        .then((response) => {
            return response.json();
        })
        .then(saveData)
        .then(drawMap)
        .then(renderData)
};

init();