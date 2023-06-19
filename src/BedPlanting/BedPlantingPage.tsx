import { useState } from "react";
import { plantPickDataInterface } from "../interfaces";
import BedPlantingGrid from './BedPlantingGrid';
import PlantPicks from "./PlantPicks";
import PlantSearch from './PlantSearch';

const BedPlantingPage: React.FC = function() {
    const [ plantPicks, setPlantPicks ] = useState<plantPickDataInterface[]>([]);
    const [ curPlantPick, setCurPlantPick ] = useState<plantPickDataInterface | null>(null);

    return (
        <>
            <BedPlantingGrid curPlantPick={curPlantPick} />
            <PlantPicks plantPicks={plantPicks} setPlantPicks={setPlantPicks} setCurPlantPick={setCurPlantPick} />
            <PlantSearch plantPicks={plantPicks} setPlantPicks={setPlantPicks} />
        </>
    );
};

export default BedPlantingPage;