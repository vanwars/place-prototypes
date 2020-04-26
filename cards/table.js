let numColumns = 4;
let mapData;
const url = "../results/data.json";


const saveData = (data) => {
    mapData = data;
};

const generateRow = (map) => {
    const data = []
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
            data.push(map.location.geometry.lat || '');
            data.push(map.location.geometry.lng || '');
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
    return `<tr><td>${data.join('</td><td>')}</td></tr>`


//     let placeInfo = '';
//     let geom = '';
//     if (map.location) {
//         let locale = '';
//         if (map.location.city) {
//             locale += map.location.city + ', ';
//         }
//         if (map.location.state) {
//             locale += map.location.state + ', ';
//         }
//         if (map.location.country) {
//             locale += map.location.country;
//         }
//         if (map.location.geometry && map.location.geometry.lng && map.location.geometry.lat) {
//             let lat = parseFloat(map.location.geometry.lat);
//             let lng = parseFloat( map.location.geometry.lng)
//             geom = '(' + lat.toFixed(3) + ', ' + lng.toFixed(3) + ')';
//         }
//         placeInfo = `
//             <table>
//                 <tr>
//                     <th>Original:</th>
//                     <td>${map.place}</td>
//                 </tr>
//                 <tr>
//                     <th>Geocoded:</th>
//                     <td>${locale}</td>
//                 </tr>
//                 <tr>
//                     <th>Coordinates</th>
//                     <td>
//                         <i class="fas fa-map-marker-alt"></i> 
//                         ${geom}
//                     </td>
//                 </tr>
//             </table>
//         `;
//     }
// //     return `<div class="card">
// //         <div>
// //             <h2>${map.header}</h2>
// //             <div class="metadata">Metadata!</div>
// //             <p>${map.paragraphs[0]}</p>
// //             <img src="${map.image_source}" />
// //             ${paragraphs}
// //             <p><strong>${map.footer}</strong></p>
// //             ${placeInfo}
// //         </div>
// //    </div>`;
//    return `<tr>
//         <td>${map.header}</td>
//         <td>${map.paragraphs[0].substring(0, 200) + '...'}</td>
//     </tr>
//     `;
};

const drawTable = () => {
    const rows = [];
    for (const map of mapData) {
        rows.push(generateRow(map));
    }
    const headerRow = `
        <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Description</th>
            <th>City</th>
            <th>State</th>
            <th>Country</th>
            <th>Lat</th>
            <th>Lng</th>
            <th>Author</th>
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
        .then(drawTable);
};

init();