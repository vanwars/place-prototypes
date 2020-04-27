let numColumns = 4;
let mapData;
let mapMarkers = [];
let map;
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
        map = L.map('mapid', {
            layers: [watercolorMap],
            trackResize: true,
            minZoom: 2,
            maxZoom: 14
        }).setView([51.505, -0.09], 2);
};

const renderData = () => {
    document.querySelector('main').classList.remove('with-card');
    map.invalidateSize();
    
    if (mapMarkers.length > 0) {
        for(mapMarker of mapMarkers) {
            map.removeLayer(mapMarker);
        }
        mapMarkers = [];
    }
    const visibleMapData = mapData.filter(item => !item.hide && item.location && item.location.geometry);
    
    for (const item of visibleMapData) {
        const lat = parseFloat(item.location.geometry.lat);
        const lng = parseFloat(item.location.geometry.lng);
        const marker = L.marker([lat, lng], item).addTo(map);
        marker.on('click', function(e) {
            setTimeout(() => { 
                map.invalidateSize()
                map.setView(e.latlng); 
            }, 10);
            document.querySelector('main').classList.add('with-card');
            document.querySelector('#card-holder').innerHTML = generateCard(item);
            document.querySelector('.more').onclick = toggleFullScreen;
            document.querySelector('.less').onclick = toggleFullScreen;
        });
        mapMarkers.push(marker);
        marker.bindPopup(item.place);
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
    document.querySelector('#card-holder').classList.toggle('fullscreen');
    map.invalidateSize();
}

init();