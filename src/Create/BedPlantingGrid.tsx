import { useState } from "react";
import { useParams } from "react-router-dom";
import cloneDeep from "lodash/fp/cloneDeep";
import { useGetBedsQuery, useUpdateGridMapMutation } from "../app/apiSlice";
import { useWrapRTKMutation, useWrapRTKQuery } from "../app/customHooks";
import { plantPickDataInterface, gridMapInterface, bedDataInterface } from "../app/interfaces";
import Grid from "../Base/Grid";

interface bedPlantingGridInterface {
    curPlantPick: plantPickDataInterface | null,
};

const BedPlantingGrid: React.FC<bedPlantingGridInterface> = function({ curPlantPick }) {
    const { bedid } = useParams();

    const { data: bedObject } = useWrapRTKQuery(useGetBedsQuery);
    const bed = bedObject?.find(bed => bed.id === Number(bedid)) as bedDataInterface;
    const seedbasket = bed?.seedbasket as plantPickDataInterface[];

    const { mutation: updateGridMap, isLoading } = useWrapRTKMutation(useUpdateGridMapMutation);

    const [ lastTen, setLastTen ] = useState<gridMapInterface[]>([]);
    const [ counter, setCounter ] = useState(0);

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
                        });
                        if (gridMapCopy && bed?.id) {
                            updateBedData(gridMapCopy, bed.id)
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
                        });
                        if (gridMapCopy && bed?.id) {
                            updateBedData(gridMapCopy, bed.id)
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
                    });
                    if (gridMapCopy && bed?.id) {
                        updateBedData(gridMapCopy, bed.id)
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
                horizontalwalkway: grid.horizontalwalkway,
                verticalwalkway: grid.verticalwalkway,
                customwalkway: grid.customwalkway,
                plantId: 0,
            });
        });
        if (clearedGridMap && bed?.id) {
            updateBedData(clearedGridMap, bed.id)
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
                <Grid bedData={bed} interactive="active" handleCellClick={togglePlant} />
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