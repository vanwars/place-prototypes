let numColumns = 4;
let mapData;
let mapMarkers = [];
let mymap;
const url = "../results/data.json";

const saveData = (data) => {
    mapData = data;
};

const drawMap = () => {	
		//Stamen Toner tiles attribution and URL
		var watercolorURL = 'http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}';
        var watercolorMap = L.tileLayer(watercolorURL,{
			subdomains: 'abcd',
			minZoom: 0,
			maxZoom: 20,
			ext: 'png'
		});
        mymap = L.map('mapid', {
            layers: [watercolorMap],
            trackResize: true,
            minZoom: 2,
            maxZoom: 14
        }).setView([51.505, -0.09], 2);
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
        marker.on('click', function(e) {
            setTimeout(() => { 
                mymap.invalidateSize()
                mymap.setView(e.latlng); 
            }, 10);
            document.querySelector('main').classList.add('with-card');
            document.querySelector('#card-holder').innerHTML = generateCard(map);
            document.querySelector('.more').onclick = toggleFullScreen;
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

const toggleFullScreen = () => {
    document.querySelector('#card-holder').classList.toggle('fullscreen')
}

init();