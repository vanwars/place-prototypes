let numColumns = 4;
let mapData;
let mapMarkers = [];
let map;
let oms;
const popup = new L.Popup({
    offset: [0, -30]
});
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

        // Add marker clustering control: 
        oms = new OverlappingMarkerSpiderfier(map);
        oms.addListener('click', marker => {
            const item = marker.item;
            const latLng = marker.getLatLng();
            setTimeout(() => { 
                map.invalidateSize()
                map.setView(latLng); 
            }, 10);

            // Card right-hand side:
            document.querySelector('main').classList.add('with-card');
            document.querySelector('#card-holder').innerHTML = generateCard(item);
            document.querySelector('.more').onclick = toggleFullScreen;
            document.querySelector('.less').onclick = toggleFullScreen;

            // popup
            popup.setContent(item.place);
            popup.setLatLng(latLng);
            map.openPopup(popup);
        });

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
        // const icon = L.divIcon({ popupAnchor: [0, 30] });
        // const icon = L.Icon.Default.extend({ 
        //     options: { 
        //         popupAnchor: [0, 30], 
        //         iconUrl: L.Icon.Default.imagePath + '/marker-desat.png'
        //     } 
        // });
        // item.icon = icon;
        const marker = L.marker([lat, lng], item).addTo(map);
        marker.item = item;
        mapMarkers.push(marker);
        oms.addMarker(marker);
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