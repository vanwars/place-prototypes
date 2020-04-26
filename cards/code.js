let numColumns = 4;
let mapData;
const url = "../results/data.json";


const saveData = (data) => {
    mapData = data;
};

const showCode = () => {
    document.querySelector('pre').innerHTML = `
        ${JSON.stringify(mapData, null, 4)}
    `;
};

const init = () => {
    fetch(url)
        .then((response) => {
            return response.json();
        })
        .then(saveData)
        .then(showCode);
};

init();