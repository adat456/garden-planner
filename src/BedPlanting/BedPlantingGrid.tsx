import { useEffect, useState } from "react";
import { bedDataInterface, plantPickDataInterface } from "../Shared/interfaces";

interface bedPlantingGridInterface {
    curPlantPick: plantPickDataInterface | null,
};

const BedPlantingGrid: React.FC<bedPlantingGridInterface> = function({ curPlantPick }) {
    const [loading, setLoading] = useState(true);
    const [bedData, setBedData] = useState<bedDataInterface | null>(null);

    useEffect(() => {
        async function pullBedData() {
            try {
                const req = await fetch("http://localhost:3000/retrieve-bed/31", {credentials: "include"});
                const res = await req.json();
                if (req.ok) {
                    setBedData(res[0]);
                    setLoading(false);
                } else {
                    throw new Error(res);
                };
            } catch(err) {
                console.log(err.message);
            };
        };
        pullBedData();
    }, []);

    function createBedGrid() {
        let bedInnards = [];
        let counter = 1;
        if (bedData) {
            for (let j = 0; j < bedData.length; j++) {
                let row = []
                for (let i = 0; i < bedData.width; i++) {
                    let classes = "grid-cell ";
                    const gridData = bedData?.gridmap[counter - 1];
                    if (gridData.selected) classes += "selected ";
                    if (gridData.walkway) classes += "walkway ";
                    if (!gridData.selected && !gridData.walkway) classes += "away";
                    if (gridData.plantId) classes += "planted";
                    
                    row.push(<div key={`${j}${i}`} className={classes} id={`cell-${counter}`} data-plant-id={gridData.plantId} data-plant-name={gridData.plantName} style={{backgroundColor: gridData.gridColor}} onClick={togglePlant} onMouseOver={() => console.log(gridData.plantName)} />);       
                    counter++;
                };
                bedInnards.push(
                    <div key={`row-${j}`} className="row">
                        {row}
                    </div>
                );
            };
        }
        return bedInnards;
    };

    function togglePlant(e: React.MouseEvent) {
        const cell = e.target as HTMLDivElement;

        // if a cell is a selected cell and NOT a walkway cell
        if (cell.classList.contains("selected")) {
            const cellNum = Number(cell.getAttribute("id")?.slice(5));
            // if it has already been planted, determine whether the cell's plant ID matches the current plant pick's ID
            if (cell.classList.contains("planted")) {
                // if they do match, remove the planted class and replace the corresponding cell data with scrubbed cell data
                if (cell.getAttribute("data-plant-id") === curPlantPick?.id.toString()) {
                    cell.classList.remove("planted");
                    let gridMapCopy = bedData?.gridmap;
                    if (gridMapCopy) {
                        let cellCopy = gridMapCopy[cellNum - 1];
                        gridMapCopy?.splice((cellNum - 1), 1, {
                            num: cellCopy.num,
                            selected: cellCopy.selected,
                            walkway: cellCopy.walkway,
                            plantId: 0,
                            plantName: "",
                            gridColor: "",
                        });
                        setBedData({
                            ...bedData,
                            gridmap: gridMapCopy,
                        });
                    };
                } else {
                    // if they don't match, keep the planted class but replace the cell data with updated plant ID and name
                    let gridMapCopy = bedData?.gridmap;
                    if (gridMapCopy && curPlantPick) {
                        let cellCopy = gridMapCopy[cellNum - 1];
                        gridMapCopy?.splice((cellNum - 1), 1, {
                            num: cellCopy.num,
                            selected: cellCopy.selected,
                            walkway: cellCopy.walkway,
                            plantId: curPlantPick.id,
                            plantName: curPlantPick.name,
                            gridColor: curPlantPick.gridcolor,
                        });
                        setBedData({
                            ...bedData,
                            gridmap: gridMapCopy,
                        });
                    };
                };
            } else {
                // if the cell has not yet been planted, just replace the cell with plant ID and name data included
                cell.classList.add("planted");
                let gridMapCopy = bedData?.gridmap;
                if (gridMapCopy && curPlantPick) {
                    let cellCopy = gridMapCopy[cellNum - 1];
                    gridMapCopy?.splice((cellNum - 1), 1, {
                        num: cellCopy.num,
                        selected: cellCopy.selected,
                        walkway: cellCopy.walkway,
                        plantId: curPlantPick.id,
                        plantName: curPlantPick.name,
                        gridColor: curPlantPick.gridcolor
                    });
                    setBedData({
                        ...bedData,
                        gridmap: gridMapCopy,
                    });
                };
            };
        };
    };

    function clearAll() {
        const clearedGridMap = bedData?.gridmap.map(grid => {
            return ({
                num: grid.num,
                selected: grid.selected,
                walkway: grid.walkway,
                plantId: 0,
                plantName: "",
                gridColor: ""
            });
        });
        setBedData({
            ...bedData,
            gridmap: clearedGridMap
        })
    };

    async function updateBedData() {
        const reqOptions: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                gridMap: bedData?.gridmap,
                bedId: bedData?.id,
            }),
            credentials: "include"
        };

        try {
            const req = await fetch("http://localhost:3000/save-bed", reqOptions);
            const message = await req.json();
            if (req.ok) {
                console.log(message);
            };
        } catch(err) {
            console.log(err.message);
        };
    };

    return (
        <div className="bed-planting-grid">
            <div className="bed planting-bed">
                {loading ? 
                    <p>Loading garden bed details...</p> :
                    createBedGrid()
                }
            </div>
            <div className="button-cluster">
                <button type="button">Undo</button>
                <button type="button" onClick={clearAll}>CLEAR</button>
                <button type="button" onClick={updateBedData}>SAVE</button>
            </div>
        </div>
    );
};

export default BedPlantingGrid;