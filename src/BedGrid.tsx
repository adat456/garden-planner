import { useEffect, useState } from "react";

interface BedGridInterface {
    length: number,
    width: number,
    whole: boolean,
};

const BedGrid: React.FC<BedGridInterface> = function({length, width, whole}) {
    const [arrowVis, setArrowVis] = useState(false);
    const [addPlot, setAddPlot] = useState(true);

    // different classes for bed cells/plots: all should have .grid-cell; may also have .selected, .custom-walkway, .vertical-walkway, and .horizontal-walkway

    function toggleSelectedPlots(e: React.MouseEvent) {
        const plot = e.target as HTMLTableCellElement;
        if (addPlot) {
            if (plot.classList.contains("selected")) {
                plot.className = "grid-cell";
            } else {
                plot.className = "selected grid-cell";
            };
        } else {
            if (plot.classList.contains("custom-walkway")) {
                plot.className = "grid-cell";
            } else {
                plot.className = "custom-walkway grid-cell";
            };
        };
    };

    function toggleWalkwayMarkerStyle(e: React.MouseEvent) {
        const arrowCell = e.target as HTMLTableCellElement;
        arrowCell.classList.toggle("clicked");
    };

    function toggleWalkwayRowPlacement(line: number, direction: string) {
        // grab all the grid cells in an array
        const allCells = [...document.querySelectorAll(".grid-cell")];
        // find the cells within the row or column by...
        const lineCells = allCells.filter(cell => {
            // ...pulling each grid cell's number and performing operations to determine which cells qualify
            const cellId = Number(cell.getAttribute("id")?.slice(5));
            if (direction === "vertical") {
                if ((cellId - line) % width === 0) {
                    return cell;
                };
            };
            if (direction === "horizontal") {
                if (cellId > (line * width) && cellId <= ((line + 1) * width)) {
                    return cell;
                };
            };
        });
        // then toggle the classes (need to be separate even though they have the same style, otherwise adding a horizontal walkway could interfere with a vertical walkway that was already placed)
        if (direction === "vertical") {
            lineCells.forEach(cell => {
                if (cell.classList.contains("vertical-walkway")) {
                    cell.className = "grid-cell";
                } else {
                    cell.className = "vertical-walkway grid-cell";
                };
            });
        };
        if (direction === "horizontal") {
            lineCells.forEach(cell => {
                if (cell.classList.contains("horizontal-walkway")) {
                    cell.className = "grid-cell";
                } else {
                    cell.className = "horizontal-walkway grid-cell";
                };
            });
        };
    };

    function clearAllWalkways() {
        const allCells = [...document.querySelectorAll(".grid-cell")];
        allCells.forEach(cell => {
            cell.classList.remove("horizontal-walkway", "vertical-walkway", "custom-walkway");
        });
        const allMarkers = [...document.querySelectorAll(".arrow")];
        allMarkers.forEach(marker => marker.classList.remove("clicked"));
    };

    function clearAllSelectedPlots() {
        const allCells = [...document.querySelectorAll(".grid-cell")];
        allCells.forEach(cell => {
            cell.classList.remove("selected");
        });
    };

    function clearAll() {
        const allCells = [...document.querySelectorAll(".grid-cell")];
        allCells.forEach(cell => {
            cell.className = "grid-cell";
        });
    };

    function createBedGrid() {
        let bedInnards = [];
        let counter = 1;
        let lengthCounter = 0;
        let widthCounter = 1;
        for (let j = 0; j <= length; j++) {
            let row = []
            for (let i = 0; i <= width; i++) {
                // first two conditions generate walkway markers
                if (j === 0 && i >= 1) {
                    const width = widthCounter;
                    row.push(<div key={`${j}${i}`} className="arrow-cell">
                        <div key={i} className={arrowVis ? "arrow arrow-down" : "arrow arrow-down hidden"} onClick={(e) => {toggleWalkwayMarkerStyle(e); toggleWalkwayRowPlacement(width, "vertical");}} />
                    </div>);
                    widthCounter++;
                } else if (j >= 1 && i === 0) {
                    const length = lengthCounter;
                    row.push(<div key={`${j}${i}`} className="arrow-cell">
                        <div key={i} className={arrowVis ? "arrow arrow-right" : "arrow arrow-right hidden"} onClick={(e) => {toggleWalkwayMarkerStyle(e); toggleWalkwayRowPlacement(length, "horizontal");}} />
                    </div>);
                    lengthCounter++;
                // renders the very first cell w/ invisible borders
                } else if (j === 0 && i === 0) {
                    row.push(<div key={`${j}${i}`} className="arrow-cell" />);
                // renders all other cells
                } else {
                    row.push(<div key={`${j}${i}`} className="grid-cell" id={`cell-${counter}`} onClick={toggleSelectedPlots}  />);
                    counter++;
                };
            };
            bedInnards.push(
                <div key={`row-${j}`} className="row">
                    {row}
                </div>
            );
        };
        return bedInnards;
    };

    useEffect(() => {
        const allCells = [...document.querySelectorAll(".grid-cell")];
        if (whole) {
            allCells.forEach(cell => cell.setAttribute("inert", "true"));
        } else {
            allCells.forEach(cell => cell.removeAttribute("inert"));
        };
    }, [whole]);

    return (
        <div>
            {whole ?
                <div>
                    <button type="button" disabled>Clear all</button>
                    <button type="button" disabled>Add bed cells</button>
                    <button type="button" disabled>Clear all selected plots</button>
                </div> :
                <div>
                    <button type="button" onClick={clearAll}>Clear all</button>
                    <button type="button" onClick={() => setAddPlot(!addPlot)}>{addPlot ? "Add bed cells" : "Add walkway cells"}</button>
                    <button type="button" onClick={clearAllSelectedPlots}>Clear all selected plots</button>
                </div>  
            }
            <div className="bed">
                {createBedGrid()}
            </div>
            <button type="button" onClick={() => setArrowVis
            (!arrowVis)}>{arrowVis ? "Remove walkway markers" : "Show walkway markers"}</button>
            <button type="button" onClick={clearAllWalkways}>Clear all walkways</button>
        </div>
    );
};

export default BedGrid;