let mapData;
const url = "../results/data.json";

const saveData = (data) => {
    mapData = data;
};

const flattenObject = (ob) => {
	var toReturn = {};
	for (var i in ob) {
		if (!ob.hasOwnProperty(i)) continue;
		
		if ((typeof ob[i]) == 'object') {
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

const collapseBy = (list, column) => {

};

const sortDesc = (obj, f) => {
    if (!f) {
        f = function(a, b) {
            return b[1] - a[1];
        };
    }
    console.log(f);
    var sortable = [];
    for (const key in obj) {
        sortable.push([key, obj[key]]);
    }
    // sortable.sort(f);
    return sortable;
};

const generateTable = (columns) => {
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
    const numRows = columns[0].data.length;
    for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
        html += `<tr>`
        html += `<td>` + columns[0].data[rowIdx][0] + `</td>`;
        for (let colIdx = 0; colIdx < columns.length; colIdx++) {
            html += `<td>` + columns[colIdx].data[rowIdx][1] + `</td>`;
        }
        html += `</tr>`
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

const getCounts = (groupBy, list) => {
    const countsByGrouping = list.reduce((d, item) => {
        const key = item[groupBy] || 'Missing';
        d[key] = d[key] + 1 || 1;
        return d;
      }, {});
    //console.log(Object.keys(list[0]));
    return sortDesc(countsByGrouping);
};

const getImages = (groupBy, list) => {
    const countsByGrouping = list.reduce((d, item) => {
        const key = item[groupBy] || 'Missing';
        const imageURL = item['image_source'];
        if (!d[key]) {
            d[key] = [];
        }
        d[key].push(imageURL);
        return d;
    }, {});
    
    const sortedList = sortDesc(countsByGrouping, function(a, b) {
        return b[1].length - a[1].length;
    });
    for (let i = 0; i < sortedList.length; i++) {
        let html = '';
        let counter = 1;
        for (const url of sortedList[i][1]) {
            const delay = counter.toFixed(2) + 's;';
            html += `<img style="animation-delay: ${delay}" src="${url}" />`;
            counter += 0.1;
        }
        sortedList[i][1] = html;
    }
    return sortedList;
};

const getText = (groupBy, list, attribute) => {
    const countsByGrouping = list.reduce((d, item) => {
        const key = item[groupBy] || 'Unknown';
        if (!d[key]) {
            d[key] = [];
        }
        d[key].push(item[attribute] || 'Unknown');
        return d;
    }, {});
    
    const sortedList = sortDesc(countsByGrouping, function(a, b) {
        return b[1].length - a[1].length;
    });
    for (let i = 0; i < sortedList.length; i++) {
        let html = '';
        let counter = 0;
        // get unique values:
        const uniqueList = sortedList[i][1].filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
        uniqueList.sort();
        for (const text of uniqueList) {
            const delay = counter.toFixed(2) + 's;';
            html += `<p style="animation-delay: ${delay}">${text}</p>`;
            counter += 0.05;
        }
        sortedList[i][1] = html;
    }
    return sortedList;
};

const getNums = (groupBy, list, attribute) => {
    const listsByGrouping = list.reduce((d, item) => {
        const key = item[groupBy] || 'Missing';
        if (!d[key]) {
            d[key] = [];
        }
        d[key].push(item[attribute] || 'Missing');
        return d;
    }, {});
    
    const sortedList = sortDesc(listsByGrouping);
    for (let i = 0; i < sortedList.length; i++) {
        sortedList[i][1].sort(compareNumbers);
        sortedList[i][1] = sortedList[i][1].join(', ')
    }
    return sortedList;
};

const renderData = () => {
    const visibleMapData = mapData.filter(map => !map.hide).map( item => flattenObject(item));
    const container = document.querySelector('main');
    let selectElement = document.querySelector("#tag-selection");
    const groupBy = selectElement ? selectElement.value : 'location.country';
    const tagName = groupBy.split('.')[groupBy.split('.').length - 1];
    //let data;
    const columns = [
        { name: 'count', type: 'count', title: 'Count' }, 
        { name: 'image_source', type: 'image', width: 600, title: 'Map Image' }, 
        { name: 'id', type: 'int', title: 'ID' }, 
        { name: 'location.country', type: 'text', title: 'Country', width: 300 }, 
        { name: 'location.state', type: 'text', title: 'State', width: 300 }, 
        { name: 'location.city', type: 'text', title: 'City', width: 300 }, 
        { name: 'author', type: 'text', width: 300, title: 'Author'} //,
        //{ name: 'header', type: 'text', width: 700, title: 'Map Title' }
    ]
    for (column of columns) {
        if (column.type === 'count') {
            column.data = getCounts(groupBy, visibleMapData);
        } else if (column.type === 'image') {
            column.data = getImages(groupBy, visibleMapData);
        } else if (column.type === 'text') {
            column.data = getText(groupBy, visibleMapData, column.name);
        } else if (column.type === 'int') {
            column.data = getNums(groupBy, visibleMapData, column.name);
        } else {
            console.error(column.type, 'is unknown');
        }
    }

    const searchTerm = document.querySelector('#search-bar').value;
    if (searchTerm.length > 0) {
        container.innerHTML = `<p>Counts of <strong>${tagName}</strong> where the word <strong>${searchTerm}</strong> exists ANYWHERE in the submission.</p>`;
    } else {
        container.innerHTML = `<p> </p>`;
    }
    container.innerHTML += generateTable(columns);

    // make sure correct item is selected:
    selectElement = document.querySelector("#tag-selection");
    //aggregationElement = document.querySelector("#aggregation-type");
    setOption(selectElement, groupBy);
    //setOption(aggregationElement, aggregationType);
    selectElement.onchange = renderData;
    //aggregationElement.onchange = renderData;
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