let numColumns = 4;
let mapData;
const url = "../results/data.json";


const saveData = (data) => {
    mapData = data;
};

const generateRow = (map) => {
    const data = []
    data.push(map.id);
    data.push(`<img src="${map.image_source}" />`);
    data.push(map.header);
    if (map.paragraphs.length > 0) {
        data.push(map.paragraphs[0].substring(0, 300) + '...');
    } else {
        data.push('');
    }
    if (map.location) {
        data.push(map.location.city || '');
        data.push(map.location.state || '');
        data.push(map.location.country || '');
        if (map.location.geometry) {
            data.push(parseFloat(map.location.geometry.lat).toFixed(3));
            data.push(parseFloat(map.location.geometry.lng).toFixed(3));
        } else {
            data.push('');
            data.push('');
        }
    } else {
        data.push('');
        data.push('');
        data.push('');
        data.push('');
        data.push('');
    }
    data.push(map.footer);
    data.push(map.tags.join(', '));
    return `<tr><td>${data.join('</td><td>')}</td></tr>`
};

const renderData = () => {
    const rows = [];
    const visibleMapData = mapData.filter(map => !map.hide);
    for (const map of visibleMapData) {
        rows.push(generateRow(map));
    }
    if (visibleMapData.length === 0) {
        document.querySelector('main').innerHTML = `
            <p class="no-matches">No matches for 
                "${document.querySelector("#search-bar").value}</strong>"
            </p>
        `;
        return;
    }
    const headerRow = `
        <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Title</th>
            <th>Description</th>
            <th>City</th>
            <th>State</th>
            <th>Country</th>
            <th>Lat</th>
            <th>Lng</th>
            <th>Author</th>
            <th>Tags</th>
        </tr>
    `
    const tbody = rows.join('\n');
    document.querySelector('main').innerHTML = `
        <table>
            <thead>${headerRow}</thead>
            <tbody>${tbody}</tbody>
        </table>
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