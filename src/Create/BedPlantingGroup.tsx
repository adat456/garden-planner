import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetBedsQuery } from "../app/apiSlice";
import { plantPickDataInterface } from "../app/interfaces";
import BedPlantingGrid from './BedPlantingGrid';
import PlantPick from "./PlantPick";
import CreateVeg from "./CreateVeg";
import PlantSearch from './PlantSearch/PlantSearch';

const BedPlantingGroup: React.FC = function() {
    const [ curPlantPick, setCurPlantPick ] = useState<plantPickDataInterface | null>(null);
    const [ abbrPlantPicksVis, setAbbrPlantPicksVis ] = useState(false);
    const [ createVegVis, setCreateVegVis ] = useState(false);

    const { bedid } = useParams();

    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const bed = bedObject.bed;
    
    const plantPicks = bed?.seedbasket as plantPickDataInterface[];

    function generatePlantPicks(abbreviated: boolean) {
        const plantPicksArr = plantPicks?.map(plant => {
            return (
                <PlantPick key={`plant-pick-${plant.id}`} bedid={bedid} plant={plant} plantPicks={plantPicks} setCurPlantPick={setCurPlantPick} abbreviated={abbreviated} />
            );
        });
        return plantPicksArr;    
    };

    useEffect(() => {
        if (createVegVis) {
            const createVegForm: HTMLDialogElement | null = document.querySelector(".create-veg-form");
            createVegForm?.showModal();
        };
    }, [createVegVis]);

    return (
        <div className="bed-planting-group">
            {bed ?
                <BedPlantingGrid curPlantPick={curPlantPick} /> : <p>Loading...</p>
            }
            <section className="seed-basket">
                <h2>SEED BASKET</h2>
                <hr />
                <ul>
                    {generatePlantPicks(false)}
                </ul>
            </section>
            <section className="abbr-seed-basket">
                {abbrPlantPicksVis ?
                    <ul>
                        {generatePlantPicks(true)}
                    </ul> : null
                }
                <div onClick={() => setAbbrPlantPicksVis(!abbrPlantPicksVis)}>
                    <h2>{`SEED BASKET (${plantPicks?.length})`}</h2>
                    {abbrPlantPicksVis ?
                        <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8.72798 15.795L3.72798 7.795C3.10356 6.79593 3.82183 5.5 4.99998 5.5L15 5.5C16.1781 5.5 16.8964 6.79593 16.272 7.795L11.272 15.795C10.6845 16.735 9.31549 16.735 8.72798 15.795Z" /></svg> :
                        <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M11.272 5.205L16.272 13.205C16.8964 14.2041 16.1782 15.5 15 15.5H5.00002C3.82186 15.5 3.1036 14.2041 3.72802 13.205L8.72802 5.205C9.31552 4.265 10.6845 4.265 11.272 5.205Z" /></svg>
                    }
                </div>
            </section>
            <button type="button" onClick={() => setCreateVegVis(true)}>Add a vegetable</button>
            {createVegVis ?
                <CreateVeg setCreateVegVis={setCreateVegVis} />
                : null
            }
            <PlantSearch plantPicks={plantPicks} bedid={bedid} />
        </div>
    );
};

export default BedPlantingGroup;