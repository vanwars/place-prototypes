let numColumns = 4;
let mapData;
const url =
   "../results/data.json";

const threeColumns = `
    <section id="col1"></section>
    <section id="col2"></section>
    <section id="col3"></section>
`;
const twoColumns = `
    <section id="col1"></section>
    <section id="col2"></section>
`;
const oneColumn = `
    <section id="col1"></section>
`;

const generateCard = (map) => {
   return `<div class="card">
        <div>
            <a class="add-button" href="#">+</a>
            <h2>${map.header}</h2>
            <div class="metadata">Metadata!</div>
            <p>${map.paragraphs[0]}</p>
            <img src="${map.image_source}" />
            <p>${map.paragraphs[1]}</p>
            <p><strong>${map.paragraphs[2]}</strong></p>
        </div>
   </div>`;
};

const saveData = (data) => {
    mapData = data;
}
const showMaps = () => {
    let cardMatrix = [[]];
    if (numColumns == 2) {
        cardMatrix = [[], []]
    } else if (numColumns == 3) {
        cardMatrix = [[], [], []]
    } else if (numColumns == 4) {
        cardMatrix = [[], [], [], []]
    };
    let i = 0;
    for (const map of mapData) {
        if (map.image_source) {
            const template = generateCard(map);
            cardMatrix[i % numColumns].push(template);
            ++i;
        } else {
            console.log("no image found", map) 
        }
    }
    console.log(cardMatrix);
    document.querySelector(".grid").innerHTML = "";
    for (const column of cardMatrix) {
        const htmlColumn = `<section class="cards">${column.join('\n')}</section>`;
        document.querySelector(".grid").innerHTML += htmlColumn;
    }
};

const init = () => {
   fetch(url)
   .then((response) => {
      return response.json();
   })
   .then(saveData)
   .then(showMaps)
   .then(addEventHandlers);

    const laptop = window.matchMedia("(max-width: 1100px)");
    laptop.addListener(() => {
        numColumns = 4;
        if (laptop.matches) {
            numColumns = 3;
        }
        console.log(numColumns);
        showMaps()
    });
   
    const tablet = window.matchMedia("(max-width: 900px)");
    tablet.addListener(() => {
        numColumns = 3;
        if (tablet.matches) {
            numColumns = 2;
        }
        console.log(numColumns);
        showMaps()
    });
   
    const mobile = window.matchMedia("(max-width: 700px)");
    mobile.addListener(() => {
        numColumns = 2;
        if (mobile.matches) {
            numColumns = 1;
        }
        console.log(numColumns);
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
}

const updateLayout = (x) => {
   if (x.matches) {
      // If media query matches
      console.log("small");
   } else {
      console.log("big");
   }
};

init();