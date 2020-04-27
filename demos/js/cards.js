let numColumns = 3;
let mapData;
const url = "../results/data.json";

const saveData = (data) => {
    mapData = data;
}
const renderData = () => {
    let i = 0;
    let cardMatrix = [[]];
    if (numColumns == 2) {
        cardMatrix = [[], []]
    } else if (numColumns == 3) {
        cardMatrix = [[], [], []]
    } else if (numColumns == 4) {
        cardMatrix = [[], [], [], []]
    };
    const visibleMapData = mapData.filter(map => !map.hide);
    if (visibleMapData.length === 0) {
        document.querySelector('main').innerHTML = `
            <p class="no-matches">No matches for 
                "${document.querySelector("#search-bar").value}</strong>"
            </p>
        `;
        document.querySelector('.grid').innerHTML = "";
        return;
    } else {
        document.querySelector('main').innerHTML = "";
    }
    for (const map of visibleMapData) {
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
        .then(renderData)
        .then(initMobileListeners);
};

const initMobileListeners = () => {
   
    const tablet = window.matchMedia("(max-width: 1000px)");
    tablet.addListener(() => {
        numColumns = 3;
        if (tablet.matches) {
            numColumns = 2;
        }
        renderData()
    });
   
    const mobile = window.matchMedia("(max-width: 700px)");
    mobile.addListener(() => {
        numColumns = 2;
        if (mobile.matches) {
            numColumns = 1;
        }
        renderData();
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