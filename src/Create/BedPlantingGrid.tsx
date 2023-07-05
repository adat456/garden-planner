import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import cloneDeep from "lodash/fp/cloneDeep";
import { useGetBedsQuery, useUpdateGridMapMutation } from "../app/apiSlice";
import { bedDataInterface, plantPickDataInterface, gridMapInterface } from "../app/interfaces";

interface bedPlantingGridInterface {
    curPlantPick: plantPickDataInterface | null,
};

const BedPlantingGrid: React.FC<bedPlantingGridInterface> = function({ curPlantPick }) {
    const { bedid } = useParams();

    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const bed = bedObject.bed;

    const [ updateGridMap, { isLoading } ] = useUpdateGridMapMutation();

    const [ lastTen, setLastTen ] = useState<gridMapInterface[]>([]);
    const [ counter, setCounter ] = useState(0);

    function createBedGrid() {
        let bedInnards = [];
        let counter = 1;
        if (bed) {
            for (let j = 0; j < bed.length; j++) {
                let row = []
                for (let i = 0; i < bed.width; i++) {
                    let classes = "grid-cell ";
                    const gridData = bed?.gridmap[counter - 1];
                    if (gridData.selected) classes += "selected ";
                    if (gridData.walkway) classes += "walkway ";
                    if (!gridData.selected && !gridData.walkway) classes += "away";
                    if (gridData.plantId) classes += "planted";
                    
                    row.push(<div key={`${j}${i}`} className={classes} id={`cell-${counter}`} data-plant-id={gridData.plantId} data-plant-name={gridData.plantName} style={{backgroundColor: gridData.gridColor}} onClick={togglePlant} />);       
                    counter++;
                };
                bedInnards.push(
                    <div key={`row-${j}`} className="row">
                        {row}
                    </div>
                );
            };
        };
        return bedInnards;
    };

    function updateLastTen() {
        if (lastTen.length < 10) {
            setLastTen([cloneDeep(bed?.gridmap), ...lastTen]);
        } else if (lastTen.length >= 10) {
            let lastTenCopy = cloneDeep(lastTen);
            lastTenCopy.splice(-1, 1);
            setLastTen([cloneDeep(bed?.gridmap), ...lastTenCopy])
        };
        
        setCounter(-1);
    };

    function togglePlant(e: React.MouseEvent) {
        const cell = e.target as HTMLDivElement;

        // if a cell is NOT a walkway cell
        if (cell.classList.contains("selected")) {
            const cellNum = Number(cell.getAttribute("id")?.slice(5));
            // if it has already been planted, determine whether the cell's plant ID matches the current plant pick's ID
            if (cell.classList.contains("planted")) {
                // if they do match, remove the planted class and replace the corresponding cell data with scrubbed cell data
                if (cell.getAttribute("data-plant-id") === curPlantPick?.id.toString()) {
                    cell.classList.remove("planted");
                    updateLastTen();

                    let gridMapCopy = cloneDeep(bed?.gridmap);
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
                        if (gridMapCopy && bed?.id) {
                            updateBedData(gridMapCopy, bed.id, true)
                        }; 
                    };
                } else {
                    // if they don't match, keep the planted class but replace the cell data with updated plant ID and name
                    updateLastTen();

                    let gridMapCopy = cloneDeep(bed?.gridmap);
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
                        if (gridMapCopy && bed?.id) {
                            updateBedData(gridMapCopy, bed.id, true)
                        }; 
                    };
                };
            } else {
                // if the cell has not yet been planted, just replace the cell with plant ID and name data included
                cell.classList.add("planted");
                updateLastTen();

                let gridMapCopy = cloneDeep(bed?.gridmap);
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
                    if (gridMapCopy && bed?.id) {
                        updateBedData(gridMapCopy, bed.id, true)
                    }; 
                };
            };
        };
    };

    function handleUndo() {
        if (counter < lastTen.length - 1) {
            if (bed?.id) {
                updateBedData(lastTen[counter + 1], bed.id);
            }; 
            setCounter(counter + 1);
        };
    };

    function handleRedo() {
        if (counter > 0) {
            if (bed?.id) {
                updateBedData(lastTen[counter - 1], bed.id);
            }; 
            setCounter(counter - 1); 
        };
    };

    function clearAll() {
        updateLastTen();

        const clearedGridMap = bed?.gridmap.map(grid => {
            return ({
                num: grid.num,
                selected: grid.selected,
                walkway: grid.walkway,
                plantId: 0,
                plantName: "",
                gridColor: ""
            });
        });
        if (clearedGridMap && bed?.id) {
            updateBedData(clearedGridMap, bed.id, true)
        };    
    };

    async function updateBedData(gridmap: gridMapInterface[], bedid: number) {
        if (!isLoading) {
            try {
                await updateGridMap({
                    gridmap,
                    bedid
                }).unwrap();
            } catch(err) {
                console.error("Unable to update gridmap: ", err.message);
            };
        };
    };

    return (
        <div className="bed-planting-grid">
            <div className="bed planting-bed">
                {createBedGrid()}
            </div>
            <div className="button-cluster">
                <button type="button" onClick={handleUndo}>Undo</button>
                <button type="button" onClick={handleRedo}>Redo</button>
                <button type="button" onClick={clearAll}>Clear</button>
            </div>
        </div>
    ); 
};

export default BedPlantingGrid;