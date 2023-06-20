import { useState } from "react";
import { SliderPicker } from "react-color";
import { plantPickDataInterface } from "../interfaces";

interface plantPickInterface {
    plant: plantPickDataInterface,
    plantPicks: plantPickDataInterface[],
    setPlantPicks: React.Dispatch<React.SetStateAction<plantPickDataInterface[]>>,
    setCurPlantPick: React.Dispatch<React.SetStateAction<plantPickDataInterface | null>>
};

const PlantPick: React.FC<plantPickInterface> = function({ plant, plantPicks, setPlantPicks, setCurPlantPick }) {
    const [ colorSliderVis, setColorSliderVis ] = useState(false);

    function changePlantPickColor(color) {
        setPlantPicks(plantPicks.map((pick, index) => {
            if (pick.id === plant.id) {
                let plantCopy = plant;
                plantCopy.gridcolor = color.hex;
                return plantCopy;
            } else {
                return pick;
            };
        }));
    };

    function removePlantPick(id: number) {
        setPlantPicks(plantPicks.filter(plant => plant.id !== id));
    };

    return (
        <li>
            <p style={{color: plant.gridcolor}}>{plant.name}</p>
            <button type="button" onClick={() => setColorSliderVis(!colorSliderVis)}>{colorSliderVis ? "Hide color picker" : "Show color picker"}</button>
            {colorSliderVis ?
                <SliderPicker color={plant.gridcolor} onChangeComplete={changePlantPickColor} /> :
                null
            }
            <button type="button" onClick={() => setCurPlantPick(plant)}>Plant in bed</button>
            <button type="button" onClick={() => removePlantPick(plant.id)}>Remove from basket</button>
        </li>
    );
};

export default PlantPick;