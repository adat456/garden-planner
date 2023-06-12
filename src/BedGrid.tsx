import { useEffect, useState } from "react";

interface BedGridInterface {
    length: number,
    width: number,
    whole: boolean,
    coords: string[],
    setCoords: React.Dispatch<React.SetStateAction<string[]>>,
    createWalkway: boolean,
};

const BedGrid: React.FC<BedGridInterface> = function({length, width, whole, coords, setCoords}) {
    const [createWalkway, setCreateWalkway] = useState(false);

    function handleHover(e: React.PointerEvent) {
        const plot = e.target as HTMLTableCellElement;
        plot.classList.toggle("hover");
    };

    function adjustCoordsArr(e: React.MouseEvent) {
        const plot = e.target as HTMLTableCellElement;
        const coordPair = plot.getAttribute("id")?.slice(-2).toString().padStart(2, '0');
        if (coordPair) {
            if (coords.includes(coordPair)) {
                setCoords(coords.filter(coords => coords !== coordPair));
                plot.classList.remove("selected");
            } else {
                console.log("hello??")
                setCoords([...coords, coordPair]);
                plot.classList.add("selected");
            };
        };
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
                if (cellId >= (line * width) && cellId < ((line + 1) * width)) {
                    return cell;
                };
            };
        });
        // then toggle the classes (need to be separate even though they have the same style, otherwise adding a horizontal walkway could interfere with a vertical walkway that was already placed)
        if (direction === "vertical") {
            lineCells.forEach(cell => cell.classList.toggle("vertical-walkway"));
        };
        if (direction === "horizontal") {
            lineCells.forEach(cell => cell.classList.toggle("horizontal-walkway"));
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
        let counter = 0;
        let lengthCounter = 0;
        let widthCounter = 0;
        for (let j = 0; j <= length; j++) {
            let row = []
            for (let i = 0; i <= width; i++) {
                // first two conditions generate walkway markers
                if (j === 0 && i >= 1) {
                    const width = widthCounter;
                    row.push(<td key={`${j}${i}`} className="arrow-cell" onClick={() => toggleWalkwayPlacement(width, "vertical")}>
                        <div key={i} className={createWalkway ? "arrow arrow-down" : "arrow arrow-down hidden"} onClick={(e) => toggleWalkwayMarkerStyle(e)} />
                    </td>);
                    widthCounter++;
                } else if (j >= 1 && i === 0) {
                    const length = lengthCounter;
                    row.push(<td key={`${j}${i}`} className="arrow-cell" onClick={() => toggleWalkwayPlacement(length, "horizontal")}>
                        <div key={i} className={createWalkway ? "arrow arrow-down" : "arrow arrow-down hidden"} onClick={(e) => toggleWalkwayMarkerStyle(e)} />
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

    // toggles walkway marker visibility
    useEffect(() => {
        const arrows = [...document.querySelectorAll(".arrow-cell div")];
        if (createWalkway === true) {
            arrows.forEach(arrow => arrow.classList.remove("hidden"));
        } else {
            arrows.forEach(arrow => arrow.classList.add("hidden"));
        };
    }, [createWalkway]);

    useEffect(() => {
        if (whole === true) {
            const allCells = [...document.querySelectorAll(".grid-cell")];
            allCells.forEach(cell => {
                cell.removeEventListener("pointerenter", handleHover);
                cell.removeEventListener("pointerleave", handleHover);
                cell.removeEventListener("click", adjustCoordsArr);
            });
        } else {
            const allCells = [...document.querySelectorAll(".grid-cell")];
            allCells.forEach(cell => {
                cell.addEventListener("pointerenter", handleHover);
                cell.addEventListener("pointerleave", handleHover);
                cell.addEventListener("click", adjustCoordsArr);
            });
        };
    }, [whole]);

    return (
        <div>
            <table>
            {createBedGrid()}
            </table>
            <button type="button" onClick={() => setCreateWalkway
            (!createWalkway)}>{createWalkway ? "Remove walkway markers" : "Show walkway markers"}</button>
            <button type="button" onClick={clearAllWalkways}>Clear all walkways</button>
        </div>
    );
};

export default BedGrid;