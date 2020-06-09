let mapData;
const noData = 'Not specified';
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


const generateTable = (data, columns, groupBy) => {
    let ths = '';
    for (const column of columns) {
        if (column.name !== 'count') {
            ths += `<th style="min-width:${column.width || 100}px;">${column.title}</th>`
        }
    }
    let html = `
        <table class="draggable">
            <thead>
                <tr>
                    <th class="no-drag">
                        <select id="tag-selection">
                            <option value="id">No Grouping</option>
                            <option value="location.city">Group by City</option>
                            <option value="location.state">Group by State</option>
                            <option value="location.country">Group by Country</option>
                            <option value="tags">Group by Tag</option>
                        </select>
                    </th>
                    ${ths}
                </tr>
            </thead>
            <tbody>
        `;
    
    // drop header column:
    data.shift();

    // then generate cells:
    for (row of data) {
        html += `<tr>`
        for (let i = 0; i < row.length; i++) {
            const cell = row[i];
            if (i === 0) {
                if (groupBy !== 'id') {
                    const count = row[i + 1];
                    html += `<td>${cell}: <span>${count}</span> </td>`;
                } else {
                    html += `<td>${cell}</td>`;
                }
            } else {
                const column = columns[i-1];
                if (column.name !== 'count') {
                    const formatter = column.formatter;
                    html += `<td>${formatter(cell)}</td>`;
                }
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
        return self.indexOf(value) === index && value !== noData;
    });
}

const toCommaDelimitedList = (data) => {
    data = getUniqueValues(data);
    return data.join(', ');
};

const toHTMLImages = (imageURLs) => {
    return imageURLs
        .filter(item => item !== noData)
        .map((item, i) => {
            const delay = (0.5 + i * 0.1).toFixed(2) + 's;';
            return `<img class="tilt" style="animation-delay: ${delay}" src="${item}" />`;
        }).join('');
};

const toHTMLImagesLarge = (imageURLs) => {
    return imageURLs.map(item => {
        return `<img style="height:auto;width:300px;" src="${item}" />`;
    }).join('');
};

const toParagraphs = (data) => {
    return '<p>' + data.join('</p><p>') + '</p>'
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


const updateEntry = (entry, row, columns, groupBy) => {
    for (const column of columns) {
        // 1) initialize as int or list:
        if (!entry[column.name]) {
            if (column.type === 'count') {
                entry[column.name] = 0
            } else {
                entry[column.name] = []
            }
        }
        // 2) apply aggregation operation
        if (column.type === 'count') {
            entry[column.name] += 1;
        } else if (column.type === 'list') {
            entry[column.name] = entry[column.name].concat(row[column.name])
        } else {
            entry[column.name].push(row[column.name] || noData)
        }
    }
}
const collapseByTag = (visibleData, columns) => {
    // first, get a list of all the unique tags:
    let tags = [];
    for (const row of visibleData) {
        tags = tags.concat(row['tags']);
    }
    tags = getUniqueValues(tags);
    
    const data = {}
    for (const tag of tags) {
        data[tag] = {};
        for (const row of visibleData) {
            if (row['tags'].indexOf(tag) != -1) {
                updateEntry(data[tag], row, columns, 'tags');
            }
        }
    }
    return data; 
};

const collapseBy = (groupBy, visibleData, columns) => {
    let data = {};
    if (groupBy === 'tags') {
        data = collapseByTag(visibleData, columns);
    } else {
        for (const row of visibleData) {
            const key = row[groupBy] || noData;
            if (!data[key]) {
                data[key]= {};
            }
            updateEntry(data[key], row, columns, groupBy);
        }
    }
    return data;  

};

const toSortedMatrix = (groupBy, visibleMapData, columns, sortBy) => {
    const rows = []
    const headers = [groupBy].concat(columns.map(item => item.name));
    const sortIndex = headers.indexOf(sortBy);
    rows.push(headers);
    for (const key in visibleMapData) {
        const val = visibleMapData[key];
        const row = [key]
        for (const column of columns) {
            row.push(val[column.name]);
        }
        rows.push(row);
    }

    rows.sort(function(first, second) {
        return second[sortIndex] - first[sortIndex];
    });
    return rows;
}

const renderData = () => {
    const visibleMapData = mapData.filter(map => !map.hide).map( item => flattenObject(item));
    let selectElement = document.querySelector("#tag-selection");
    const groupBy = selectElement ? selectElement.value : 'id'; //'location.country';
    
    const container = document.querySelector('main');
    const tagName = groupBy.split('.')[groupBy.split('.').length - 1];

    let columns = [
        { name: 'count', type: 'count', width: 180, title: 'Count', formatter: String },
        { name: 'image_source', type: 'image', width: 500, title: 'Map Image', formatter: toHTMLImages }, 
        { name: 'tags', type: 'list', width: 340, title: 'Tags', formatter: toTagList }, 
        { name: 'id', type: 'int', title: 'ID', width: 200, formatter: toCommaDelimitedList }, 
        { name: 'location.country', type: 'text', title: 'Country', width: 340, formatter: toHTMLList }, 
        { name: 'location.state', type: 'text', title: 'State', width: 340, formatter: toHTMLList }, 
        { name: 'location.city', type: 'text', title: 'City', width: 340, formatter: toHTMLList }, 
        { name: 'author', type: 'text', width: 340, title: 'Author', formatter: toHTMLList }
    ]
    if (groupBy === "id") {
        columns = [
            { name: 'id', type: 'int', title: 'ID', width: 40, formatter: toCommaDelimitedList }, 
            { name: 'image_source', type: 'image', width: 310, title: 'Map Image', formatter: toHTMLImagesLarge }, 
            { name: 'header', type: 'type', width: 240, title: 'Title', formatter: String },
            { name: 'paragraphs', type: 'list', width: 340, title: 'Description', formatter: toParagraphs },
            { name: 'tags', type: 'list', width: 240, title: 'Tags', formatter: toTagList }, 
            { name: 'location.country', type: 'text', title: 'Country', width: 140, formatter: String }, 
            { name: 'location.state', type: 'text', title: 'State', width: 140, formatter: String }, 
            { name: 'location.city', type: 'text', title: 'City', width: 140, formatter: String }, 
            { name: 'author', type: 'text', width: 140, title: 'Author', formatter: String }
        ];
    } 
    const dataDictionary = collapseBy(groupBy, visibleMapData, columns);
    const matrix = toSortedMatrix(groupBy, dataDictionary, columns, 'count')
    const searchTerm = document.querySelector('#search-bar').value;
    if (searchTerm.length > 0) {
        container.innerHTML = `<p>Counts of <strong>${tagName}</strong> where the word <strong>${searchTerm}</strong> exists ANYWHERE in the submission.</p>`;
    } else {
        container.innerHTML = `<p> </p>`;
    }
    container.innerHTML += generateTable(matrix, columns, groupBy);
    
    // add dragging, sorting, adjusting functionality:
    const table = document.querySelector('main table');
    resizableGrid(table);
    dragtable.makeDraggable(table);

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