let mapData;
const url = "../results/data.json";

const saveData = (data) => {
    mapData = data;
};

const flattenObject = (ob) => {
	var toReturn = {};
	for (var i in ob) {
		if (!ob.hasOwnProperty(i)) continue;
		
		if ((typeof ob[i]) == 'object' && !Array.isArray(ob[i])) {
			var flatObject = flattenObject(ob[i]);
			for (var x in flatObject) {
				if (!flatObject.hasOwnProperty(x)) continue;
		
				toReturn[i + '.' + x] = flatObject[x];
			}
		} else {
			toReturn[i] = ob[i];
		}
	}
	return toReturn;
};


const generateTable = (data, columns) => {
    let ths = '';
    for (const column of columns) {
        ths += `<th style="min-width:${column.width || 100}px;">${column.title}</th>`
    }
    let html = `<table>
            <thead>
                <tr>
                    <th style="min-width: 150px;">
                        <select id="tag-selection">
                            <option value="location.country">Country</option>
                            <option value="location.state">State</option>
                            <option value="location.city">City</option>
                            <option value="id">Individuals</option>
                            <!-- option value="tags">Tags</option -->
                        </select>
                    </th>
                    ${ths}
                </tr>
            </thead>
            <tbody>`;
    for (const key in data) {
        const row = data[key];
        html += `<tr>`
        html += `<td>${key}</td>`;
        for (const col of columns) {
            //console.log(col.name);
            if (col.formatter) {
                html += `<td>${col.formatter(row[col.name])}</td>`;
            } else {
                html += `<td>${row[col.name]}</td>`;
            }
        }
        html += `</tr>`;
    }
    html += `</tbody></table>`;
    return html;
};

const compareNumbers = (a, b) => {
    return a - b;
};

const setOption = (selectElement, value) => {
    return [...selectElement.options].some((option, index) => {
        if (option.value == value) {
            selectElement.selectedIndex = index;
            return true;
        }
    });
}

const getUniqueValues = (data) => {
    return data.filter((value, index, self) => {
        return self.indexOf(value) === index && value !== 'Missing';
    });
}

const toCommaDelimitedList = (data) => {
    data = getUniqueValues(data);
    return data.join(', ');
};

const toHTMLImages = (imageURLs) => {
    return imageURLs.map((item, i) => {
        const delay = (0.5 + i * 0.1).toFixed(2) + 's;';
        return `<img style="animation-delay: ${delay}" src="${item}" />`;
    }).join('');
};
const toHTMLList = (data) => {
    data = getUniqueValues(data);
    return '<ul class="wrapper">' + data.map((item, i) => {
        const delay = (0.5 + i * 0.1).toFixed(2) + 's;';
        return `<li style="animation-delay: ${delay}">${item}</li>`;
    }).join('') + '</ul>';
};

const toTagList = (data) => {
    data = getUniqueValues(data);
    return data.map((item, i) => {
        const delay = (0.5 + i * 0.1).toFixed(2) + 's;';
        return `<span class="tag" style="animation-delay: ${delay}">${item}</span>`;
    }).join('');
};

const collapseBy = (groupBy, visibleData, columns) => {
    data = {}
    for (const row of visibleData) {
        const key = row[groupBy] || 'Missing';
        if (!data[key]) {
            data[key]= {};
        }
        aggregatedRec = data[key];
        for (const column of columns) {
            // 1) initialize as int or list:
            if (!aggregatedRec[column.name]) {
                if (column.type === 'count') {
                    aggregatedRec[column.name] = 0
                } else {
                    aggregatedRec[column.name] = []
                }
            }
            // 2) apply aggregation operation
            if (column.type === 'count') {
                aggregatedRec[column.name] += 1;
            } else if (column.type === 'tags') {
                aggregatedRec[column.name] = aggregatedRec[column.name].concat(row[column.name])
            } else {
                aggregatedRec[column.name].push(row[column.name] || 'Missing')
            }
        }
    }
    return data;
};

const renderData = () => {
    const visibleMapData = mapData.filter(map => !map.hide).map( item => flattenObject(item));
    let selectElement = document.querySelector("#tag-selection");
    const groupBy = selectElement ? selectElement.value : 'location.country';
    
    const container = document.querySelector('main');
    const tagName = groupBy.split('.')[groupBy.split('.').length - 1];

    const columns = [
        { name: 'count', type: 'count', title: 'Count' }, 
        { name: 'image_source', type: 'image', width: 450, title: 'Map Image', formatter: toHTMLImages }, 
        { name: 'tags', type: 'tags', width: 340, title: 'Tags', formatter: toTagList }, 
        { name: 'id', type: 'int', title: 'ID', width: 200, formatter: toCommaDelimitedList }, 
        { name: 'location.country', type: 'text', title: 'Country', width: 340, formatter: toCommaDelimitedList }, 
        { name: 'location.state', type: 'text', title: 'State', width: 340, formatter: toHTMLList }, 
        { name: 'location.city', type: 'text', title: 'City', width: 340, formatter: toHTMLList }, 
        { name: 'author', type: 'text', width: 340, title: 'Author', formatter: toHTMLList }
    ]
    const data = collapseBy(groupBy, visibleMapData, columns);
    console.log(data);

    const searchTerm = document.querySelector('#search-bar').value;
    if (searchTerm.length > 0) {
        container.innerHTML = `<p>Counts of <strong>${tagName}</strong> where the word <strong>${searchTerm}</strong> exists ANYWHERE in the submission.</p>`;
    } else {
        container.innerHTML = `<p> </p>`;
    }
    container.innerHTML += generateTable(data, columns);

    // make sure correct item is selected:
    selectElement = document.querySelector("#tag-selection");
    setOption(selectElement, groupBy);
    selectElement.onchange = renderData;
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