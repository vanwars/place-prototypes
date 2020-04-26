let numColumns = 4;
let mapData;
const url = "../results/data.json";


const saveData = (data) => {
    mapData = data;
};

const renderData = () => {
    const visibleMapData = mapData.filter(map => !map.hide);
    document.querySelector('pre').innerHTML = `
        ${JSON.stringify(visibleMapData, null, 4)}
    `;
};

const init = () => {
    fetch(url)
        .then((response) => {
            return response.json();
        })
        .then(saveData)
        .then(renderData);
};

init();