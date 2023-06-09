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
    const [tableWidthPx, setTableWidthPx] = useState<number | null>(null);
    const [tableLengthPx, setTableLengthPx] = useState<number | null>(null);

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
        for (let j = 0; j < length; j++) {
            let row = []
            for (let i = 0; i < width; i++) {
                row.push(<td key={`${j}${i}`} className="cell" id={`cell-${j}${i}`}  />);
            };
            tableInnards.push(
                <tr key={`row-${j}`}>
                    {row}
                </tr>
            );
        };
        return tableInnards;
    };

    function generateWalkwayMarkers(dimension: string) {
        let walkwayMarkers = [];
        if (dimension === "width") {
            for (let i = 0; i < width - 1; i++) {
                walkwayMarkers.push(<div key={i} className="arrow-down" />);
            };
        } else if (dimension === "length") {
            for (let i = 0; i < length - 1; i++) {
                walkwayMarkers.push(<div key={i} className="arrow-down" />);
            };
        };
        return walkwayMarkers;
    };

    useEffect(() => console.log(coords), [coords]);

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

    // obtaining table dimensions to provide walkway markers container with the appropriate dimensions
    useEffect(() => {
        const table = document.querySelector("table") as HTMLTableElement;
        const tableStyle = window.getComputedStyle(table);
        const tableWidth = tableStyle.getPropertyValue("width");
        setTableWidthPx(Number(tableWidth.slice(0, -2)));
    }, [createWalkway, width]);
    useEffect(() => {
        const table = document.querySelector("table") as HTMLTableElement;
        const tableStyle = window.getComputedStyle(table);
        const tableLength = tableStyle.getPropertyValue("height");
        setTableLengthPx(Number(tableLength.slice(0, -2)));
    }, [createWalkway, length]);
    
    return (
        <div className="bed-grid-container">
            {createWalkway ? 
                <div className="walkway-markers-container top" style={{maxWidth: `${tableWidthPx}px`}}>
                    {generateWalkwayMarkers("width")}
                </div> : null
            }
            <div className="table-flex-container">
                {createWalkway ? 
                    <div className="walkway-markers-container left"  style={{maxWidth: `${tableLengthPx}px`}}>
                        {generateWalkwayMarkers("length")}
                    </div> : null
                }
                <table>
                    {createBedGrid()}
                </table>
            </div>
        </div>
    );
};

export default BedGrid;