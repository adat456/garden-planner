import { useEffect, useState } from "react";

interface BedGridInterface {
    length: number,
    width: number,
    whole: boolean,
};

const BedGrid: React.FC<BedGridInterface> = function({length, width, whole}) {
    const [arrowVis, setArrowVis] = useState(false);

    function handleHover(e: React.PointerEvent) {
        const plot = e.target as HTMLTableCellElement;
        plot.classList.toggle("hover");
    };

    function adjustCoordsArr(e: React.MouseEvent) {
        const plot = e.target as HTMLTableCellElement;
        plot.classList.toggle("selected");
    };

    function handleClearAll() {
        const allCells = [...document.querySelectorAll(".grid-cell")];
        allCells.forEach(cell => {
            cell.classList.remove("selected");
        });
    };

    function toggleWalkwayPlacement(line: number, direction: string) {
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
                cell.classList.toggle("vertical-walkway");
                cell.classList.remove("selected");
            });
        };
        if (direction === "horizontal") {
            lineCells.forEach(cell => {
                cell.classList.toggle("horizontal-walkway");
                cell.classList.remove("selected");
            });
        };
    };

    function toggleWalkwayMarkerStyle(e: React.MouseEvent) {
        const arrowCell = e.target as HTMLTableCellElement;
        arrowCell.classList.toggle("clicked");
    };

    function clearAllWalkways() {
        const allCells = [...document.querySelectorAll(".grid-cell")];
        allCells.forEach(cell => {
            cell.classList.remove("horizontal-walkway");
            cell.classList.remove("vertical-walkway");
        });
        const allMarkers = [...document.querySelectorAll(".arrow")];
        allMarkers.forEach(marker => marker.classList.remove("clicked"));
    };

    function createBedGrid() {
        let tableInnards = [];
        let counter = 1;
        let lengthCounter = 0;
        let widthCounter = 1;
        for (let j = 0; j <= length; j++) {
            let row = []
            for (let i = 0; i <= width; i++) {
                // first two conditions generate walkway markers
                if (j === 0 && i >= 1) {
                    const width = widthCounter;
                    row.push(<td key={`${j}${i}`} className="arrow-cell">
                        <div key={i} className={arrowVis ? "arrow arrow-down" : "arrow arrow-down hidden"} onClick={(e) => {toggleWalkwayMarkerStyle(e); toggleWalkwayPlacement(width, "vertical");}} />
                    </td>);
                    widthCounter++;
                } else if (j >= 1 && i === 0) {
                    const length = lengthCounter;
                    row.push(<td key={`${j}${i}`} className="arrow-cell">
                        <div key={i} className={arrowVis ? "arrow arrow-right" : "arrow arrow-right hidden"} onClick={(e) => {toggleWalkwayMarkerStyle(e); toggleWalkwayPlacement(length, "horizontal");}} />
                    </td>);
                    lengthCounter++;
                // renders the very first cell w/ invisible borders
                } else if (j === 0 && i === 0) {
                    row.push(<td key={`${j}${i}`} className="arrow-cell" />);
                // renders all other cells
                } else {
                    row.push(<td key={`${j}${i}`} className="grid-cell" id={`cell-${counter}`}  />);
                    counter++;
                };
            };
            tableInnards.push(
                <tr key={`row-${j}`}>
                    {row}
                </tr>
            );
        };
        return tableInnards;
    };

    useEffect(() => {
        const allCells = [...document.querySelectorAll(".grid-cell")];
        if (whole === true) {
            allCells.forEach(cell => {
                cell.removeEventListener("pointerenter", handleHover);
                cell.removeEventListener("pointerleave", handleHover);
                cell.removeEventListener("click", adjustCoordsArr);
            });
        } else {
            allCells.forEach(cell => {
                cell.addEventListener("pointerenter", handleHover);
                cell.addEventListener("pointerleave", handleHover);
                cell.addEventListener("click", adjustCoordsArr);
            });
        };
    }, [whole]);

    return (
        <div>
            {whole ?
                <button type="button" disabled>Clear all</button> :
                <button type="button" onClick={handleClearAll}>Clear all</button>
            }
            <table>
                <tbody>
                    {createBedGrid()}
                </tbody>
            </table>
            <button type="button" onClick={() => setArrowVis
            (!arrowVis)}>{arrowVis ? "Remove walkway markers" : "Show walkway markers"}</button>
            <button type="button" onClick={clearAllWalkways}>Clear all walkways</button>
        </div>
    );
};

export default BedGrid;