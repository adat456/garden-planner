import { plantPickDataInterface } from "../interfaces";

interface plantPicksInterface {
    plantPicks: plantPickDataInterface[],
    setPlantPicks: React.Dispatch<React.SetStateAction<plantPickDataInterface[]>>,
    setCurPlantPick: React.Dispatch<React.SetStateAction<plantPickDataInterface | null>>
};

const PlantPicks: React.FC<plantPicksInterface> = function({ plantPicks, setPlantPicks, setCurPlantPick }) {
    function generatePlantPicks() {
        console.log(plantPicks);
        const plantPicksArr = plantPicks.map(plant => 
            <li key={plant.id}>
                <p style={{color: plant.gridcolor}}>{plant.name}</p>
                <button type="button" onClick={() => setCurPlantPick(plant)}>Plant in bed</button>
                <button type="button" onClick={() => removePlantPick(plant.id)}>Remove from basket</button>
            </li>
        );
        return plantPicksArr;
    };

    function removePlantPick(id: number) {
        setPlantPicks(plantPicks.filter(plant => plant.id !== id));
    };

    return (
        <section>
            <h2>Seed Basket</h2>
            <ul>
                {generatePlantPicks()}
            </ul>
        </section>
    );
};

export default PlantPicks;