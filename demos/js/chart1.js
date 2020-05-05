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

const collapseBy = (list, column) => {

};

const sortDesc = (obj, f) => {
    if (!f) {
        f = function(a, b) {
            return b[1] - a[1];
        };
    }
    var sortable = [];
    for (const key in obj) {
        sortable.push([key, obj[key]]);
    }
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
    return sortDesc(countsByGrouping);
};

const reduceToListOfLists = (groupBy, list, attribute) => {
    const d = list.reduce((d, item) => {
        const key = item[groupBy] || 'Missing';
        const imageURL = item[attribute];
        if (!d[key]) {
            d[key] = [];
        }
        d[key].push(imageURL);
        return d;
    }, {});
    return sortDesc(d, function(a, b) {
        return b[1].length - a[1].length;
    });
};
const reduceToListOfListsTags = (groupBy, list, attribute) => {
    const d = list.reduce((d, item) => {
        const key = item[groupBy] || 'Missing';
        const tags = item[attribute];
        if (!d[key]) {
            d[key] = [];
        }
        d[key] = d[key].concat(tags);
        return d;
    }, {});
    return sortDesc(d, function(a, b) {
        return b[1].length - a[1].length;
    });
};

const toHTMLImageList = (image_urls) => {
    return image_urls
}

const getImages = (groupBy, list) => {
    const sortedList = reduceToListOfLists(groupBy, list, 'image_source');
    for (const item of sortedList) {
        item[1] = item[1].map((item, i) => {
            const delay = (0.5 + i * 0.1).toFixed(2) + 's;';
            return `<img style="animation-delay: ${delay}" src="${item}" />`;
        }).join('');
    }
    return sortedList;
};
const getText = (groupBy, list, attribute, className) => {
    className = className || 'wrapper';
    const sortedList = reduceToListOfLists(groupBy, list, attribute);
    for (const item of sortedList) {
        const lis = 
            item[1]
                .filter((value, index, self) => {
                    return self.indexOf(value) === index;
                }).map((item, i) => {
                    const delay = (0.5 + i * 0.1).toFixed(2) + 's;';
                    return `<li style="animation-delay: ${delay}">${item || 'Missing'}</li>`;
                }).join('');
        item[1] = `<ul class="${className}">` + lis + `</ul>`;
    }
    return sortedList;
};

const getTags = (groupBy, list, attribute, className) => {
    className = className || 'wrapper';
    const sortedList = reduceToListOfListsTags(groupBy, list, attribute);
    for (const item of sortedList) {
        const tags = 
            item[1]
                .filter((value, index, self) => {
                    return self.indexOf(value) === index;
                }).map((item, i) => {
                    const delay = (0.5 + i * 0.1).toFixed(2) + 's;';
                    return `<span class="tag" style="animation-delay: ${delay}">${item}</span>`;
                }).join('');
        item[1] = tags
    }
    return sortedList;
};

const renderData = () => {
    const visibleMapData = mapData.filter(map => !map.hide).map( item => flattenObject(item));
    const container = document.querySelector('main');
    let selectElement = document.querySelector("#tag-selection");
    const groupBy = selectElement ? selectElement.value : 'location.country';
    const tagName = groupBy.split('.')[groupBy.split('.').length - 1];

    const columns = [
        { name: 'count', type: 'count', title: 'Count' }, 
        { name: 'image_source', type: 'image', width: 450, title: 'Map Image' }, 
        { name: 'tags', type: 'tags', width: 340, title: 'Tags'}, 
        { name: 'id', type: 'int', title: 'ID', width: 200 }, 
        { name: 'location.country', type: 'text', title: 'Country', width: 340 }, 
        { name: 'location.state', type: 'text', title: 'State', width: 340 }, 
        { name: 'location.city', type: 'text', title: 'City', width: 340 }, 
        { name: 'author', type: 'text', width: 340, title: 'Author'}
    ]
    for (column of columns) {
        if (column.type === 'count') {
            column.data = getCounts(groupBy, visibleMapData);
        } else if (column.type === 'image') {
            column.data = getImages(groupBy, visibleMapData);
        } else if (column.type === 'text') {
            column.data = getText(groupBy, visibleMapData, column.name);
        } else if (column.type === 'int') {
            column.data = getText(groupBy, visibleMapData, column.name, 'wrapper numbers');
        } else if (column.type === 'tags') {
            column.data = getTags(groupBy, visibleMapData, column.name);
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