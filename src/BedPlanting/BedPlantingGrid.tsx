import { useEffect, useState } from "react";
import { bedDataInterface, plantDataInterface } from "../interfaces";

interface bedPlantingGridInterface {
    curPlantPick: plantDataInterface | null,
};

const BedPlantingGrid: React.FC<bedPlantingGridInterface> = function({ curPlantPick }) {
    const [loading, setLoading] = useState(true);
    const [bedData, setBedData] = useState<bedDataInterface | null>(null);

    useEffect(() => {
        async function pullBedData() {
            try {
                const req = await fetch("http://localhost:3000/retrieve-bed/3");
                const res = await req.json();
                if (req.ok) {
                    setBedData(res[0]);
                    setLoading(false);
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
                    row.push(<div key={`${j}${i}`} className={classes} id={`cell-${counter}`} data-plant-id={gridData.plantId} data-plant-name={gridData.plantName} onClick={togglePlant} />);       
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
                            plantName: ""
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
                            plantName: curPlantPick.name
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
                        plantName: curPlantPick.name
                    });
                    setBedData({
                        ...bedData,
                        gridmap: gridMapCopy,
                    });
                };
            };
        };
    };

    async function updateBedData() {
        const reqOptions: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                gridMap: bedData,
                bedId: bedData?.id,
            }),
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
        <>
            {curPlantPick ?
                <p>{curPlantPick.name}</p> : null
            }
            <div className="bed planting-bed">
                {loading ? 
                    <p>Loading garden bed details...</p> :
                    createBedGrid()
                }
            </div>
            <button type="button" onClick={updateBedData}>Save</button>
        </>
    );
};

export default BedPlantingGrid;