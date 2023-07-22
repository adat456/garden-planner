import { useState } from "react";
import { useParams } from "react-router-dom";
import { bedDataInterface, plantDataInterface } from "../app/interfaces";
import { useUpdateSeedBasketMutation, useGetBedsQuery } from "../app/apiSlice";
import randomColor from "random-color";

interface CreateVegInterface {
    setCreateVegVis: React.Dispatch<React.SetStateAction<boolean>>,
    focusVeg?: plantDataInterface | undefined,
    setFocusVeg?: React.Dispatch<React.SetStateAction<plantDataInterface | undefined>>
    setSeedContributions?: React.Dispatch<React.SetStateAction<plantDataInterface[]>>
};

const CreateVeg: React.FC<CreateVegInterface> = function({ setCreateVegVis, focusVeg, setFocusVeg, setSeedContributions }) {
    const [name, setName] = useState(focusVeg?.name || "");
    const [description, setDescription] = useState(focusVeg?.description || "");
    const [lifecycle, setLifecycle] = useState(focusVeg?.lifecycle || "");
    const [plantingSzn, setPlantingSzn] = useState<string[]>(focusVeg?.plantingseason || []);
    const [fruitSize, setFruitSize] = useState(focusVeg?.fruitsize || "");
    const [growthHabit, setGrowthHabit] = useState(focusVeg?.growthhabit?.join(", ") || "");
    const [growthConditions, setGrowthConditions] = useState(focusVeg?.growconditions?.join(", ") || "");
    const [sowingMethod, setSowingMethod] = useState(focusVeg?.sowingmethod?.join(", ") || "");
    const [light, setLight] = useState<string[]>(focusVeg?.light || []);
    const [depth, setDepth] = useState(focusVeg?.depth || "");
    const [heightLower, setHeightLower] = useState<number | undefined>(focusVeg?.heightin?.[0] || undefined);
    const [heightUpper, setHeightUpper] = useState<number | undefined>(focusVeg?.heightin?.[1] || undefined);
    const [spacingInLower, setSpacingInLower] = useState<number | undefined>(focusVeg?.spacingin?.[0] || undefined);
    const [spacingInUpper, setSpacingInUpper] = useState<number | undefined>(focusVeg?.spacingin?.[1] || undefined);
    const [water, setWater] = useState(focusVeg?.water || "");
    const [hardiness, setHardiness] = useState<number[]>(focusVeg?.hardiness || []);
    const [dtmLower, setDTMLower] = useState<number | undefined>(focusVeg?.daystomaturity?.[0] || undefined);
    const [dtmUpper, setDTMUpper] = useState<number | undefined>(focusVeg?.daystomaturity?.[1] || undefined);
    const [privateData, setPrivateData] = useState(focusVeg?.privatedata || false);

    function generateHardinessButtons() {
        let hardinessButtonsArr = [];
        for (let i = 1; i <= 12; i++) {
            if (focusVeg?.hardiness.includes(i)) {
                hardinessButtonsArr.push(
                    <button type="button" key={i} className="hardiness-button active-button" id={`hardiness-button-${i}`} onClick={() => toggleHardiness(i)}>{i}</button>
                );
            } else {
                hardinessButtonsArr.push(
                    <button type="button" key={i} className="hardiness-button" id={`hardiness-button-${i}`} onClick={() => toggleHardiness(i)}>{i}</button>
                );
            };
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
        if (!isLoading && bedid) {
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

    function prepareDataForSubmission() {
        // let growthConditionsArr: string[] = [];
        // let sowingMethodArr: string[] = [];
        // let growthHabitArr: string[] = [];
        // if (typeof growthConditions === "string") growthConditionsArr = growthConditions.split(",");
        // if (typeof sowingMethod === "string") sowingMethodArr = sowingMethod.split(",");
        // if (typeof growthHabit === "string") growthHabitArr = growthHabit.split(",");

        let spacingArr = [];
        if (spacingInLower) spacingArr.push(spacingInLower);
        if (spacingInUpper) spacingArr.push(spacingInUpper);
        let dtmArr = [];
        if (dtmLower) dtmArr.push(dtmLower);
        if (dtmUpper) dtmArr.push(dtmUpper);
        let heightArr = [];
        if (heightLower) heightArr.push(heightLower);
        if (heightUpper) heightArr.push(heightUpper); 

        // return  { growthConditionsArr, sowingMethodArr, growthHabitArr, spacingArr, dtmArr, heightArr };
        return  { spacingArr, dtmArr, heightArr };
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const { spacingArr, dtmArr, heightArr } = prepareDataForSubmission();

        const reqOptions: RequestInit = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ name, description, hardiness, water, light, growthConditions, lifecycle, plantingSzn, sowingMethod, depth, spacingArr, growthHabit, dtmArr, heightArr, fruitSize, privateData }),
            credentials: "include"
        };
        
        try {
            // parameter changes depending on whether the created vegetable or all of the vegetables should be returned
            const req = await fetch(`http://localhost:3000/save-veg-data/${bedid && !setSeedContributions ? "single" : "all"}`, reqOptions);
            const res = await req.json();
            if (req.ok) {
                if (bedid) {
                    // if vegetable is added from a garden bed, add the newly created veg to the seedbasket
                    addPlantPick(res);
                } else if (setSeedContributions) {
                    // if vegetable is added from the profile, update state with all the user's vegetables
                    setSeedContributions(res);
                };
                
                handleClose();
            } else {
                throw new Error(res);
            };
        } catch(err) {
            console.log(err.message);
        };
    };

    async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const { spacingArr, dtmArr, heightArr } = prepareDataForSubmission();

        const reqOptions: RequestInit = {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ name, description, hardiness, water, light, growthConditions, lifecycle, plantingSzn, sowingMethod, depth, spacingArr, growthHabit, dtmArr, heightArr, fruitSize, privateData }),
            credentials: "include"
        };

        console.log(reqOptions.body);
        
        try {
            const req = await fetch(`http://localhost:3000/update-veg-data/${focusVeg?.id}`, reqOptions);
            const res = await req.json();
            if (req.ok) {
                if (setSeedContributions) setSeedContributions(res);
                
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
        if (setFocusVeg) setFocusVeg(undefined);
    };
 
    return (
        <dialog className="create-veg-form">
            <form method="POST" onSubmit={focusVeg ? handleEdit : handleSubmit}>
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
                            <input type="radio" name="water" id="low" value="Low" onChange={(e) => setWater(e.target.value)} checked={water === "Low"} />
                            <label htmlFor="low">Low</label>
                        </div>
                        <div>
                            <input type="radio" name="water" id="average" value="Average" onChange={(e) => setWater(e.target.value)} checked={water === "Average"} />
                            <label htmlFor="average">Average</label>
                        </div>
                        <div>
                            <input type="radio" name="water" id="high" value="High" onChange={(e) => setWater(e.target.value)} checked={water === "High"} />
                            <label htmlFor="high">High</label>
                        </div>
                    </fieldset>
                    <fieldset className="light-container">
                        <legend>Light needs</legend>
                        <div>
                            <input type="checkbox" name="light" id="full-shade" value="Full Shade" onChange={(e) => toggleCheckboxStringState(light, setLight, e.target.value)} checked={light.includes("Full Shade")} />
                            <label htmlFor="full-shade">Full shade</label>
                        </div>
                        <div>
                            <input type="checkbox" name="light" id="partial-shade" value="Partial Shade" onChange={(e) => toggleCheckboxStringState(light, setLight, e.target.value)} checked={light.includes("Partial Shade")} />
                            <label htmlFor="partial-shade">Partial shade</label>
                        </div>
                        <div>
                            <input type="checkbox" name="light" id="full-sun" value="Full Sun" onChange={(e) => toggleCheckboxStringState(light, setLight, e.target.value)} checked={light.includes("Full Sun")} />
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
                            <input type="radio" name="lifecycle" id="annual" value="Annual" onChange={(e) => setLifecycle(e.target.value)} checked={lifecycle === "Annual"} />
                            <label htmlFor="annual">Annual</label>
                        </div>
                        <div>
                            <input type="radio" name="lifecycle" id="biennial" value="Biennial" onChange={(e) => setLifecycle(e.target.value)} checked={lifecycle === "Biennial"}  />
                            <label htmlFor="biennial">Biennial</label>
                        </div>
                        <div>
                            <input type="radio" name="lifecycle" id="perennial" value="Perennial" onChange={(e) => setLifecycle(e.target.value)} checked={lifecycle === "Perennial"}  />
                            <label htmlFor="perennial">Perennial</label>
                        </div>
                    </fieldset>
                    <fieldset className="planting-szn-container">
                        <legend>Planting season</legend>
                        <div>
                            <input type="checkbox" name="plantingSzn" id="spring" value="Spring" onChange={(e) => toggleCheckboxStringState(plantingSzn, setPlantingSzn, e.target.value)} checked={plantingSzn.includes("Spring")} />
                            <label htmlFor="spring">Spring</label>
                        </div>
                        <div>
                            <input type="checkbox" name="plantingSzn" id="summer" value="Summer" onChange={(e) => toggleCheckboxStringState(plantingSzn, setPlantingSzn, e.target.value)} checked={plantingSzn.includes("Summer")} />
                            <label htmlFor="summer">Summer</label>
                        </div>
                        <div>
                            <input type="checkbox" name="plantingSzn" id="fall" value="Fall" onChange={(e) => toggleCheckboxStringState(plantingSzn, setPlantingSzn, e.target.value)} checked={plantingSzn.includes("Fall")} />
                            <label htmlFor="fall">Fall</label>
                        </div>
                        <div>
                            <input type="checkbox" name="plantingSzn" id="warm-season" value="Warm Season" onChange={(e) => toggleCheckboxStringState(plantingSzn, setPlantingSzn, e.target.value)} checked={plantingSzn.includes("Warm Season")} />
                            <label htmlFor="warm-season">Warm Season</label>
                        </div>
                        <div>
                            <input type="checkbox" name="plantingSzn" id="cool-season" value="Cool Season" onChange={(e) => toggleCheckboxStringState(plantingSzn, setPlantingSzn, e.target.value)} checked={plantingSzn.includes("Cool Season")} />
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
                            <input type="number" id="spacingInLower" min={0} value={spacingInLower} onChange={(e) => setSpacingInLower(Number(e.target.value))} placeholder="18"/>
                            <label htmlFor="spacingInUpper">-</label>
                            <input type="number" id="spacingInUpper" min={0} value={spacingInUpper} onChange={(e) => setSpacingInUpper(Number(e.target.value))} placeholder="24"/>
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
                            <input type="number" id="dtmLower" min={0} value={dtmLower} onChange={(e) => setDTMLower(Number(e.target.value))} placeholder="30"/>
                            <label htmlFor="dtmUpper">-</label>
                            <input type="number" id="dtmUpper" min={0} value={dtmUpper} onChange={(e) => setDTMUpper(Number(e.target.value))} placeholder="45"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="heightLower">Height (in inches)</label>
                        <div>
                            <input type="number" id="heightLower" min={0} value={heightLower} onChange={(e) => setHeightLower(Number(e.target.value))} placeholder="8"/>
                            <label htmlFor="heightUpper">-</label>
                            <input type="number" id="heightUpper" min={0} value={heightUpper} onChange={(e) => setHeightUpper(Number(e.target.value))} placeholder="12"/>
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
                {focusVeg ?
                    <button type="submit">Update database entry</button> :
                    <button type="submit">Add to database</button>
                }
            </form>
        </dialog>
    );
};

export default CreateVeg;