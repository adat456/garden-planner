import { useState } from "react";
import { useParams } from "react-router-dom";
import { bedDataInterface, plantDataInterface } from "../app/interfaces";
import { useUpdateSeedBasketMutation, useGetBedsQuery } from "../app/apiSlice";
import randomColor from "random-color";

interface CreateVegInterface {
    setCreateVegVis: React.Dispatch<React.SetStateAction<boolean>>
};

const CreateVeg: React.FC<CreateVegInterface> = function({ setCreateVegVis }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [lifecycle, setLifecycle] = useState("");
    const [plantingSzn, setPlantingSzn] = useState<string[]>([]);
    const [fruitSize, setFruitSize] = useState("");
    const [growthHabit, setGrowthHabit] = useState("");
    const [growthConditions, setGrowthConditions] = useState("");
    const [sowingMethod, setSowingMethod] = useState("");
    const [light, setLight] = useState<string[]>([]);
    const [depth, setDepth] = useState("");
    const [heightLower, setHeightLower] = useState<number | null>(null);
    const [heightUpper, setHeightUpper] = useState<number | null>(null);
    const [spacingInLower, setSpacingInLower] = useState<number | null>(null);
    const [spacingInUpper, setSpacingInUpper] = useState<number | null>(null);
    const [water, setWater] = useState("");
    const [hardiness, setHardiness] = useState<number[]>([]);
    const [dtmLower, setDTMLower] = useState<number | null>(null);
    const [dtmUpper, setDTMUpper] = useState<number | null>(null);
    const [privateData, setPrivateData] = useState(false);

    function generateHardinessButtons() {
        let hardinessButtonsArr = [];
        for (let i = 1; i <= 12; i++) {
            hardinessButtonsArr.push(
                <button type="button" key={i} className="hardiness-button" id={`hardiness-button-${i}`} onClick={() => toggleHardiness(i)}>{i}</button>
            );
        };
        return hardinessButtonsArr;
    };
    function toggleHardiness(number: number) {
        if (hardiness.includes(number)) {
            setHardiness(hardiness.filter(filter => filter != number));
        } else {
            setHardiness([...hardiness, number]);
        };
        const hardinessButton = document.querySelector(`#hardiness-button-${number}`) as HTMLButtonElement;
        hardinessButton.classList.toggle("active-button");
    };

    function toggleCheckboxStringState(state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>, toggleValue: string) {
        if (state.includes(toggleValue)) {
            setState(state.filter(existingValue => existingValue !== toggleValue));
        } else {
            setState([...state, toggleValue]);
        };
    };

    const { bedid } = useParams();

    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const bed = bedObject.bed as bedDataInterface;
    const plantPicks = bed?.seedbasket;
    const [ updateSeedBasket, { isLoading }] = useUpdateSeedBasketMutation();

    async function addPlantPick(result: plantDataInterface) {
        if (!isLoading) {
            const updatedseedbasket = [...plantPicks, {
                ...result,
                gridcolor: randomColor().hexString()
            }];
            try {
                await updateSeedBasket(
                    {
                        seedbasket: updatedseedbasket, 
                        bedid
                    }
                ).unwrap();
            } catch(err) {
                console.error("Unable to add plant pick:", err.message);
            };
        };
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const growthConditionsArr = growthConditions.split(",");
        const sowingMethodArr = sowingMethod.split(",");
        const growthHabitArr = growthHabit.split(",");

        let spacingArr = [];
        if (spacingInLower) spacingArr.push(spacingInLower);
        if (spacingInUpper) spacingArr.push(spacingInUpper);
        let dtmArr = [];
        if (dtmLower) dtmArr.push(dtmLower);
        if (dtmUpper) dtmArr.push(dtmUpper);
        let heightArr = [];
        if (heightLower) heightArr.push(heightLower);
        if (heightUpper) heightArr.push(heightUpper); 

        const reqOptions: RequestInit = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ name, description, hardiness, water, light, growthConditionsArr, lifecycle, plantingSzn, sowingMethodArr, depth, spacingArr, growthHabitArr, dtmArr, heightArr, fruitSize, privateData }),
            credentials: "include"
        };
        
        try {
            const req = await fetch("http://localhost:3000/save-veg-data", reqOptions);
            const res = await req.json();
            if (req.ok) {
                console.log(res);
                addPlantPick(res);
                
                handleClose();
            } else {
                throw new Error(res);
            };
        } catch(err) {
            console.log(err.message);
        };
    };

    function handleClose() {
        const createVegForm: HTMLDialogElement | null = document.querySelector(".create-veg-form");
        createVegForm?.close();
        setCreateVegVis(false);
    };
 
    return (
        <dialog className="create-veg-form">
            <form method="POST" onSubmit={handleSubmit}>
                <h2>Add a vegetable</h2>
                <div>
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required/>
                </div>
                <div>
                    <label htmlFor="description">Description</label>
                    <input type="textarea" id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <fieldset>
                    <legend>Requirements</legend>
                    <fieldset className="hardiness-container">
                        <legend>Hardiness zones</legend>
                        {generateHardinessButtons()}
                    </fieldset>
                    <fieldset className="water-container">
                        <legend>Water needs</legend>
                        <div>
                            <input type="radio" name="water" id="low" value="Low" onChange={(e) => setWater(e.target.value)} />
                            <label htmlFor="low">Low</label>
                        </div>
                        <div>
                            <input type="radio" name="water" id="average" value="Average" onChange={(e) => setWater(e.target.value)} />
                            <label htmlFor="average">Average</label>
                        </div>
                        <div>
                            <input type="radio" name="water" id="high" value="High" onChange={(e) => setWater(e.target.value)} />
                            <label htmlFor="high">High</label>
                        </div>
                    </fieldset>
                    <fieldset className="light-container">
                        <legend>Light needs</legend>
                        <div>
                            <input type="checkbox" name="light" id="full-shade" value="Full Shade" onChange={(e) => toggleCheckboxStringState(light, setLight, e.target.value)} />
                            <label htmlFor="full-shade">Full shade</label>
                        </div>
                        <div>
                            <input type="checkbox" name="light" id="partial-shade" value="Partial Shade" onChange={(e) => toggleCheckboxStringState(light, setLight, e.target.value)} />
                            <label htmlFor="partial-shade">Partial shade</label>
                        </div>
                        <div>
                            <input type="checkbox" name="light" id="full-sun" value="Full Sun" onChange={(e) => toggleCheckboxStringState(light, setLight, e.target.value)} />
                            <label htmlFor="full-sun">Full sun</label>
                        </div>
                    </fieldset>
                    <div>
                        <label htmlFor="growthConditions">Growth conditions</label>
                        <input type="textarea" id="growthConditions" value={growthConditions} onChange={(e) => setGrowthConditions(e.target.value)} placeholder="Drought tolerant, Indoor, Outdoor" />
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Planting</legend>
                    <fieldset className="lifecycle-container">
                        <legend>Lifecycle</legend>
                        <div>
                            <input type="radio" name="lifecycle" id="annual" value="Annual" onChange={(e) => setLifecycle(e.target.value)} />
                            <label htmlFor="annual">Annual</label>
                        </div>
                        <div>
                            <input type="radio" name="lifecycle" id="biennial" value="Biennial" onChange={(e) => setLifecycle(e.target.value)} />
                            <label htmlFor="biennial">Biennial</label>
                        </div>
                        <div>
                            <input type="radio" name="lifecycle" id="perennial" value="Perennial" onChange={(e) => setLifecycle(e.target.value)} />
                            <label htmlFor="perennial">Perennial</label>
                        </div>
                    </fieldset>
                    <fieldset className="planting-szn-container">
                        <legend>Planting season</legend>
                        <div>
                            <input type="checkbox" name="plantingSzn" id="spring" value="Spring" onChange={(e) => toggleCheckboxStringState(plantingSzn, setPlantingSzn, e.target.value)} />
                            <label htmlFor="spring">Spring</label>
                        </div>
                        <div>
                            <input type="checkbox" name="plantingSzn" id="summer" value="Summer" onChange={(e) => toggleCheckboxStringState(plantingSzn, setPlantingSzn, e.target.value)} />
                            <label htmlFor="summer">Summer</label>
                        </div>
                        <div>
                            <input type="checkbox" name="plantingSzn" id="fall" value="Fall" onChange={(e) => toggleCheckboxStringState(plantingSzn, setPlantingSzn, e.target.value)} />
                            <label htmlFor="fall">Fall</label>
                        </div>
                        <div>
                            <input type="checkbox" name="plantingSzn" id="warm-season" value="Warm Season" onChange={(e) => toggleCheckboxStringState(plantingSzn, setPlantingSzn, e.target.value)} />
                            <label htmlFor="warm-season">Warm Season</label>
                        </div>
                        <div>
                            <input type="checkbox" name="plantingSzn" id="cool-season" value="Cool Season" onChange={(e) => toggleCheckboxStringState(plantingSzn, setPlantingSzn, e.target.value)} />
                            <label htmlFor="cool-season">Cool Season</label>
                        </div>
                    </fieldset>
                    <div>
                        <label htmlFor="sowingMethod">Sowing method</label>
                        <input type="textarea" id="sowingMethod" value={sowingMethod} onChange={(e) => setSowingMethod(e.target.value)} placeholder="Direct Sow, Start Indoors"/>
                    </div>
                    <div>
                        <label htmlFor="depth">Depth</label>
                        <input type="text" id="depth" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="1/2 inch"/>
                    </div>
                    <div>
                        <label htmlFor="spacingInLower">Spacing (in inches)</label>
                        <div>
                            <input type="number" id="spacingInLower" value={spacingInLower} onChange={(e) => setSpacingInLower(Number(e.target.value))} placeholder="18"/>
                            <label htmlFor="spacingInUpper">-</label>
                            <input type="number" id="spacingInUpper" value={spacingInUpper} onChange={(e) => setSpacingInUpper(Number(e.target.value))} placeholder="24"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="growthHabit">Growth habit</label>
                        <input type="textarea" id="growthHabit" value={growthHabit} onChange={(e) => setGrowthHabit(e.target.value)} placeholder="Multi-Branching, Spreading, Upright" />
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Yield</legend>
                    <div>
                        <label htmlFor="dtmLower">Days to maturity</label>
                        <div>
                            <input type="number" id="dtmLower" value={dtmLower} onChange={(e) => setDTMLower(Number(e.target.value))} placeholder="30"/>
                            <label htmlFor="dtmUpper">-</label>
                            <input type="number" id="dtmUpper" value={dtmUpper} onChange={(e) => setDTMUpper(Number(e.target.value))} placeholder="45"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="heightLower">Height (in inches)</label>
                        <div>
                            <input type="number" id="heightLower" value={heightLower} onChange={(e) => setHeightLower(Number(e.target.value))} placeholder="8"/>
                            <label htmlFor="heightUpper">-</label>
                            <input type="number" id="heightUpper" value={heightUpper} onChange={(e) => setHeightUpper(Number(e.target.value))} placeholder="12"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="fruitSize">Fruit size</label>
                        <input type="text" id="fruitSize" value={fruitSize} onChange={(e) => setFruitSize(e.target.value)} placeholder="9-12 ounces"/>
                    </div>
                </fieldset>
                <div>
                    <input type="checkbox" name="privateData" id="privateData" checked={privateData} onChange={() => setPrivateData(!privateData)} />
                    <label htmlFor="privateData">Set to private?</label>
                </div>
                <button type="button" onClick={handleClose}>Close</button>
                <button type="submit">Add to database</button>
            </form>
        </dialog>
    );
};

export default CreateVeg;