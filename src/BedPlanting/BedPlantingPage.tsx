import { useState } from "react";
import { plantPickDataInterface } from "../interfaces";
import BedPlantingGrid from './BedPlantingGrid';
import PlantPick from "./PlantPick";
import PlantSearch from './PlantSearch';

const BedPlantingPage: React.FC = function() {
    const [ plantPicks, setPlantPicks ] = useState<plantPickDataInterface[]>([]);
    const [ curPlantPick, setCurPlantPick ] = useState<plantPickDataInterface | null>(null);

    function generatePlantPicks() {
        const plantPicksArr = plantPicks.map(plant => {
            return (
                <PlantPick key={`plant-pick-${plant.id}`} plant={plant} plantPicks={plantPicks} setPlantPicks={setPlantPicks} setCurPlantPick={setCurPlantPick} />
            );
        });
        return plantPicksArr;
    };

    return (
        <>
            <BedPlantingGrid curPlantPick={curPlantPick} />
            <section>
                <h2>Seed Basket</h2>
                <ul>
                    {generatePlantPicks()}
                </ul>
            </section>
            <PlantSearch plantPicks={plantPicks} setPlantPicks={setPlantPicks} />
        </>
    );
};

export default BedPlantingPage;