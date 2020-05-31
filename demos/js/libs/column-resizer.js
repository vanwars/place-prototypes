// if curCol is defined, then resizer is disabled.
let curCol;
    
const resizableGrid = (table) => {
    const init = () => {
        const row = table.getElementsByTagName('tr')[0],
        cols = row ? row.children : undefined;
        if (!cols) {
            return;
        }
    
        for (const cell of cols) {
            const div = createDiv(table.offsetHeight);
            cell.appendChild(div);
            setListeners(div);
        }
    }

    const setListeners = (div) => {
        let pageX,
            //curCol,
            curColWidth;

        div.addEventListener('mousedown', e => {
            curCol = e.target.parentElement;
            pageX = e.pageX;
            curColWidth = curCol.offsetWidth - paddingDiff(curCol);
        });

        div.addEventListener('mouseover', e => {
            e.target.style.borderRight = '3px solid #7B8CDE';
        });

        div.addEventListener('mouseout', e => {
            e.target.style.borderRight = '';
        });

        document.addEventListener('mousemove', function (e) {
            if (!curCol) {
                return;
            }
            const diffX = e.pageX - pageX;
            curCol.style.minWidth = (curColWidth + diffX) + 'px';
        });

        document.addEventListener('mouseup', function (e) { 
            curCol = undefined;
            pageX = undefined;
            curColWidth = undefined
        });
    };
    
    const createDiv = height => {
        var div = document.createElement('div');
        Object.assign(div.style,  {
            top: 0,
            right: 0,
            width: '5px',
            position: 'absolute',
            cursor: 'col-resize',
            userSelect: 'none',
            height: height + 'px'
        });
        return div;
    };
    
    const paddingDiff = col => {
        if (getStyleVal(col,'box-sizing') == 'border-box') {
            return 0;
        }
        var padLeft = getStyleVal(col,'padding-left');
        var padRight = getStyleVal(col,'padding-right');
        return parseInt(padLeft) + parseInt(padRight);
    };

    const getStyleVal = (elm,css) => {
        return window.getComputedStyle(elm, null).getPropertyValue(css);
    };

    init();
};