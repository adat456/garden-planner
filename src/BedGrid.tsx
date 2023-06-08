import { useEffect } from "react";

interface BedGridInterface {
    length: number,
    width: number,
    coords: string[],
    setCoords: React.Dispatch<React.SetStateAction<string[]>>,
};

const BedGrid: React.FC<BedGridInterface> = function({length, width, coords, setCoords}) {
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
            } else {
                setCoords([...coords, coordPair]);
            };
        };
    };

    function createBedGrid() {
        let tableInnards = [];

        for (let j = 0; j < length; j++) {
            let row = []
            for (let i = 0; i < width; i++) {
                row.push(<td key={`${j}${i}`} className="cell" id={`cell-${j}${i}`} onPointerEnter={handleHover} onPointerLeave={handleHover} onClick={adjustCoordsArr} />);
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
        console.log(coords);
        const allCells = [...document.querySelectorAll(".cell")];
        allCells.forEach(cell => {
            cell.classList.remove("selected");
        });
        coords.forEach(coord => {
            const cell = document.getElementById(`cell-${coord}`);
            cell?.classList.add("selected");
        });
    }, [coords]);
    
    return (
        <table>
            {createBedGrid()}
        </table>
    );
};

export default BedGrid;