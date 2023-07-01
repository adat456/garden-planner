import { useState } from "react";
import { SliderPicker } from "react-color";
import { useAppDispatch } from "../app/hooks";
import { plantPickDataInterface, colorObjInterface } from "../app/interfaces";
import { updateSeedBasket } from "../app/features/bedsSlice";

interface plantPickInterface {
    bedid: string | undefined,
    plant: plantPickDataInterface,
    plantPicks: plantPickDataInterface[],
    setCurPlantPick: React.Dispatch<React.SetStateAction<plantPickDataInterface | null>>,
    abbreviated: boolean,
};

const PlantPick: React.FC<plantPickInterface> = function({ bedid, plant, plantPicks, setCurPlantPick, abbreviated }) {
    const [ colorSliderVis, setColorSliderVis ] = useState(false);
    const [ updateSeedBasketStatus, setUpdateSeedBasketStatus ] = useState("idle");

    const dispatch = useAppDispatch();

    async function changePlantPickColor(color: colorObjInterface) {
        if (updateSeedBasketStatus === "idle") {
            const updatedseedbasket = plantPicks.map(pick => {
                if (pick.id === plant.id) {
                    let plantCopy = {
                        ...plant,
                        gridcolor: color.hex
                    };
                    return plantCopy;
                } else {
                    return pick;
                };
            });
            const numericBedId = Number(bedid);

            try {
                setUpdateSeedBasketStatus("pending");
                await dispatch(updateSeedBasket(
                    {
                        seedbasket: updatedseedbasket,
                        bedid: numericBedId
                    }
                )).unwrap();
            } catch(err) {
                console.error("Unable to edit plant pick:", err.message);
            } finally {
                setUpdateSeedBasketStatus("idle");
            };
        };
    };

    async function removePlantPick(id: number) {
        if (updateSeedBasketStatus === "idle") {
            const updatedseedbasket = plantPicks?.filter(plant => plant.id !== id);
            const numericBedId = Number(bedid);

            try {
                setUpdateSeedBasketStatus("pending");
                await dispatch(updateSeedBasket(
                    {
                        seedbasket: updatedseedbasket,
                        bedid: numericBedId
                    }
                ));
            } catch(err) {
                console.error("Unable to remove plant pick:", err.message);
            } finally {
                setUpdateSeedBasketStatus("idle");
            };
        };
    };

    if (abbreviated) {
        return (
            <li>
                <button type="button" onClick={() => removePlantPick(plant.id)} className="remove-pick-button">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 8L8 16M8.00001 8L16 16" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <p>{plant.name}</p>
            </li>
        )
    } else {
        return (
            <>
                <li>
                    <button type="button" onClick={() => removePlantPick(plant.id)} className="remove-pick-button">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 8L8 16M8.00001 8L16 16" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <p>{plant.name}</p>
                    <div className="button-cluster">
                        <button type="button" onClick={() => setColorSliderVis(!colorSliderVis)} className="color-swatch" style={{backgroundColor: plant.gridcolor}} />
                        <button type="button" onClick={() => setCurPlantPick(plant)}>
                            <svg className="shovel" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1"><path d="M21.71,7.38,16.62,2.29a1,1,0,0,0-1.41,0,1,1,0,0,0,0,1.42L17,5.54,11.58,11l-1-1h0a3,3,0,0,0-4.25,0L2.88,13.42A3,3,0,0,0,2,15.55V19a3,3,0,0,0,3,3H8.45a3,3,0,0,0,2.13-.88L14,17.69a3,3,0,0,0,0-4.25l-1-1L18.46,7l1.83,1.83a1,1,0,0,0,1.42,0A1,1,0,0,0,21.71,7.38ZM12.6,16.27,9.16,19.71a1,1,0,0,1-.71.29H5a1,1,0,0,1-1-1V15.55a1,1,0,0,1,.29-.71L7.73,11.4a1,1,0,0,1,1.41,0l1,1-.89.9a1,1,0,0,0,0,1.41A1,1,0,0,0,10,15a1,1,0,0,0,.7-.29l.9-.89,1,1A1,1,0,0,1,12.6,16.27Z"/></svg>
                        </button>
                    </div>
                </li>
                {colorSliderVis ?
                    <SliderPicker color={plant.gridcolor} onChange={changePlantPickColor} /> :
                    null
                }
            </>
        );
    };
};

export default PlantPick;