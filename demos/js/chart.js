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

const sortDesc = (obj) => {
    var sortable = [];
    for (const key in obj) {
        sortable.push([key, obj[key]]);
    }
    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });
    return sortable;
    // var objSorted = {}
    // for (const item of sortable) {
    //     objSorted[item[0]]=item[1];
    // }
    // return objSorted;
};

const generateTable = (tag, list) => {
    let html = `<table>
            <thead>
                <tr>
                    <th>
                        <select id="tag-selection">
                            <option value="location.country">Country</option>
                            <option value="location.state">State</option>
                            <option value="location.city">City</option>
                            <option value="tags">Tags</option>
                        </select>
                    </th>
                    <th>Count</th>
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

const renderData = () => {
    const container = document.querySelector('main');
    let selectElement = document.querySelector("#tag-selection");
    const visibleMapData = mapData.filter(map => !map.hide).map( item => flattenObject(item));
    const tag = selectElement ? selectElement.value : 'location.country';
    const tagName = tag.split('.')[tag.split('.').length - 1];
    const countsByTag = visibleMapData.reduce((d, item) => {
        const key = item[tag] || 'Unknown';
        d[key] = d[key] + 1 || 1;
        return d;
      }, {});
    console.log(Object.keys(visibleMapData[0]));
    const countsByTagSorted = sortDesc(countsByTag);
    const searchTerm = document.querySelector('#search-bar').value;
    if (searchTerm.length > 0) {
        container.innerHTML = `<p>Counts of <strong>${tagName}</strong> where the word <strong>${searchTerm}</strong> exists ANYWHERE in the submission.</p>`;
    } else {
        container.innerHTML = `<p> </p>`;
    }
    container.innerHTML += generateTable(tagName, countsByTagSorted);

    // make sure correct item is selected:
    selectElement = document.querySelector("#tag-selection");
    setOption(selectElement, tag);
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