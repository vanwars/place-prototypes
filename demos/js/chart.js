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
    sortable.sort(f);
    return sortable;
};

const generateTable = (list) => {
    let html = `<table>
            <thead>
                <tr>
                    <th>
                        Grouping Field: 
                        <select id="tag-selection">
                            <option value="location.country">Country</option>
                            <option value="location.state">State</option>
                            <option value="location.city">City</option>
                            <option value="author">Individuals</option>
                            <!-- option value="tags">Tags</option -->
                        </select>
                    </th>
                    <th>
                        Display Field: 
                        <select id="aggregation-type">
                            <option value="count">Count</option>
                            <!-- option value="tags">Tags</option -->
                            <option value="image_source">Picture</option>
                            <option value="author">Author</option>
                            <option value="header">Map Title</option>
                            <option value="location.country">Country</option>
                            <option value="location.state">State</option>
                            <option value="location.city">City</option>
                        </select>
                    </th>
                </tr>
            </thead>
            <tbody>`;
    for (const row of list) {
        html += `<tr><td>` + row.join('</td><td>') + `</td></tr>`;
    }
    html += `</tbody></table>`;
    return html;
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
        const key = item[groupBy] || 'Unknown';
        d[key] = d[key] + 1 || 1;
        return d;
      }, {});
    //console.log(Object.keys(list[0]));
    return sortDesc(countsByGrouping);
};

const getImages = (groupBy, list) => {
    const countsByGrouping = list.reduce((d, item) => {
        const key = item[groupBy] || 'Unknown';
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

const renderData = () => {
    const visibleMapData = mapData.filter(map => !map.hide).map( item => flattenObject(item));
    const container = document.querySelector('main');
    let selectElement = document.querySelector("#tag-selection");
    let aggregationElement = document.querySelector("#aggregation-type");
    const groupBy = selectElement ? selectElement.value : 'location.country';
    const aggregationType = aggregationElement ? aggregationElement.value : 'count';
    const tagName = groupBy.split('.')[groupBy.split('.').length - 1];
    let data;
    if (aggregationType === 'count') {
        data = getCounts(groupBy, visibleMapData);
    } else if (aggregationType === 'image_source') {
        data = getImages(groupBy, visibleMapData);
    } else if (aggregationType === 'header') {
        data = getText(groupBy, visibleMapData, aggregationType);
    } else if (aggregationType === 'author') {
        data = getText(groupBy, visibleMapData, aggregationType);
    } else if (aggregationType === 'location.city') {
        data = getText(groupBy, visibleMapData, aggregationType);
    } else if (aggregationType === 'location.state') {
        data = getText(groupBy, visibleMapData, aggregationType);
    } else if (aggregationType === 'location.country') {
        data = getText(groupBy, visibleMapData, aggregationType);
    }
    const searchTerm = document.querySelector('#search-bar').value;
    if (searchTerm.length > 0) {
        container.innerHTML = `<p>Counts of <strong>${tagName}</strong> where the word <strong>${searchTerm}</strong> exists ANYWHERE in the submission.</p>`;
    } else {
        container.innerHTML = `<p> </p>`;
    }
    container.innerHTML += generateTable(data);

    // make sure correct item is selected:
    selectElement = document.querySelector("#tag-selection");
    aggregationElement = document.querySelector("#aggregation-type");
    setOption(selectElement, groupBy);
    setOption(aggregationElement, aggregationType);
    selectElement.onchange = renderData;
    aggregationElement.onchange = renderData;
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