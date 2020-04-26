const applyFilter = () => {
    const searchTerm = document.querySelector("#search-bar").value;
    for (const map of mapData) {
        let text = map.paragraphs.join(' ') +  map.header + map.footer;
        if (map.location) {
            text +=  map.location.county + ' ' + map.location.country + ' ' +
                     map.location.state + ' ' + map.location.city
        }
        map.hide = !checkMatch(text, searchTerm); 
    }
    renderData();
};
 
const checkMatch = (text, searchTerm) => {
    console.log(text);
    if (text.toUpperCase().indexOf(searchTerm.toUpperCase()) > -1) {
       return true;
    }
    return false;
};

document.querySelector('#search-bar').onkeyup = applyFilter;