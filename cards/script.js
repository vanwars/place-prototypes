let numColumns = 4;
let mapData;
const url = "../results/data.json";

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
            <a class="add-button" href="#">+</a>
            <h2>${map.header}</h2>
            <div class="metadata">Metadata!</div>
            <p>${map.paragraphs[0]}</p>
            <img src="${map.image_source}" />
            ${paragraphs}
            <p><strong>${map.footer}</strong></p>
            ${placeInfo}
        </div>
   </div>`;
};

const saveData = (data) => {
    mapData = data;
}
const showMaps = () => {
    let i = 0;
    let cardMatrix = [[]];
    if (numColumns == 2) {
        cardMatrix = [[], []]
    } else if (numColumns == 3) {
        cardMatrix = [[], [], []]
    } else if (numColumns == 4) {
        cardMatrix = [[], [], [], []]
    };
    for (const map of mapData) {
        cardMatrix[i % numColumns].push(generateCard(map));
        i++;
    }
    // console.log(cardMatrix);
    document.querySelector(".grid").innerHTML = "";
    for (const column of cardMatrix) {
        const htmlColumn = `<section class="cards">${column.join('\n')}</section>`;
        document.querySelector(".grid").innerHTML += htmlColumn;
    }
    addEventHandlers();
};

const init = () => {
    fetch(url)
        .then((response) => {
            return response.json();
        })
        .then(saveData)
        .then(showMaps)
        .then(initMobileListeners);
};

const initMobileListeners = () => {
    const laptop = window.matchMedia("(max-width: 1100px)");
    laptop.addListener(() => {
        numColumns = 4;
        if (laptop.matches) {
            numColumns = 3;
        }
        // console.log(numColumns);
        showMaps()
    });
   
    const tablet = window.matchMedia("(max-width: 900px)");
    tablet.addListener(() => {
        numColumns = 3;
        if (tablet.matches) {
            numColumns = 2;
        }
        // console.log(numColumns);
        showMaps()
    });
   
    const mobile = window.matchMedia("(max-width: 700px)");
    mobile.addListener(() => {
        numColumns = 2;
        if (mobile.matches) {
            numColumns = 1;
        }
        // console.log(numColumns);
        showMaps();
    });
};

const addEventHandlers = () => {
    const buttons = document.querySelectorAll('.add-button');
    for (const btn of buttons) {
        btn.onclick = (ev) => { 
            const cardElement = ev.srcElement.parentElement.parentElement; 
            cardElement.querySelector('.metadata').style.display = 'block';
            ev.preventDefault();
        };
    }
};

init();