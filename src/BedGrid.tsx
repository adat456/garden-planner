import { useEffect, useState } from "react";

interface BedGridInterface {
    length: number,
    width: number,
    whole: boolean,
    coords: string[],
    setCoords: React.Dispatch<React.SetStateAction<string[]>>,
    createWalkway: boolean,
};

const BedGrid: React.FC<BedGridInterface> = function({length, width, whole, coords, setCoords, createWalkway}) {
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

    function createBedGrid() {
        let tableInnards = [];
        for (let j = 0; j <= length; j++) {
            let row = []
            for (let i = 0; i <= width; i++) {
                // first two conditions generate walkway markers
                if (j === 0 && i >= 1) {
                    row.push(<td key={`${j}${i}`} className="cell arrow-cell" id={`cell-${j}${i}`}>
                        <div key={i} className="arrow-down hidden" />
                    </td>);
                } else if (j >= 1 && i === 0) {
                    row.push(<td key={`${j}${i}`} className="cell arrow-cell" id={`cell-${j}${i}`}>
                        <div key={i} className="arrow-right hidden" />
                    </td>);
                // renders the very first cell w/ invisible borders
                } else if (j === 0 && i === 0) {
                    row.push(<td key={`${j}${i}`} className="cell arrow-cell" id={`cell-${j}${i}`} />);
                // renders all other cells
                } else {
                    row.push(<td key={`${j}${i}`} className="cell" id={`cell-${j}${i}`}  />);
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
            const allCells = [...document.querySelectorAll(".cell")];
            allCells.forEach(cell => {
                cell.removeEventListener("pointerenter", handleHover);
                cell.removeEventListener("pointerleave", handleHover);
                cell.removeEventListener("click", adjustCoordsArr);
            });
        } else {
            const allCells = [...document.querySelectorAll(".cell")];
            allCells.forEach(cell => {
                cell.addEventListener("pointerenter", handleHover);
                cell.addEventListener("pointerleave", handleHover);
                cell.addEventListener("click", adjustCoordsArr);
            });
        };
    }, [whole]);

    return (
        <table>
            {createBedGrid()}
        </table>
    );
};

export default BedGrid;