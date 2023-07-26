import { useState } from "react";
import { useParams } from "react-router-dom";
import { bedDataInterface, plantDataInterface } from "../../app/interfaces";
import { useUpdateSeedBasketMutation, useGetBedsQuery } from "../../app/apiSlice";
import randomColor from "random-color";
import IntroFieldset from "./IntroFieldset";
import RequirementsFieldset from "./RequirementsFieldset";
import PlantingFieldset from "./PlantingFieldset";
import YieldFieldset from "./YieldFieldset";

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

    const [ pageNum, setPageNum ] = useState(1);
    const [ errMsgs, setErrMsgs ] = useState<{field: string, msg: string}[]>([]);
    // used to trigger err msg in final fieldset
    const [ submitTrigger, setSubmitTrigger ] = useState(0);

    const { bedid } = useParams();

    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const bed = bedObject.bed as bedDataInterface;
    const plantPicks = bed?.seedbasket;
    
    const [ updateSeedBasket, { isLoading }] = useUpdateSeedBasketMutation();

    function toggleCheckboxStringState(state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>, toggleValue: string) {
        if (state.includes(toggleValue)) {
            setState(state.filter(existingValue => existingValue !== toggleValue));
        } else {
            setState([...state, toggleValue]);
        };
    };

    function getFieldset() {
        if (pageNum === 1) return <IntroFieldset name={name} setName={setName} description={description} setDescription={setDescription} privateData={privateData} setPrivateData={setPrivateData} setPageNum={setPageNum} errMsgs={errMsgs} />;

        if (pageNum === 2) return <RequirementsFieldset hardiness={hardiness} setHardiness={setHardiness} water={water} setWater={setWater} light={light} setLight={setLight} growthConditions={growthConditions} setGrowthConditions={setGrowthConditions} toggleCheckboxStringState={toggleCheckboxStringState} setPageNum={setPageNum} errMsgs={errMsgs} />;

        if (pageNum === 3) return <PlantingFieldset lifecycle={lifecycle} setLifecycle={setLifecycle} plantingSzn={plantingSzn} setPlantingSzn={setPlantingSzn} sowingMethod={sowingMethod} setSowingMethod={setSowingMethod} depth={depth} setDepth={setDepth} spacingInLower={spacingInLower} setSpacingInLower={setSpacingInLower} spacingInUpper={spacingInUpper} setSpacingInUpper={setSpacingInUpper} growthHabit={growthHabit} setGrowthHabit={setGrowthHabit} toggleCheckboxStringState={toggleCheckboxStringState} setPageNum={setPageNum} errMsgs={errMsgs} />;

        if (pageNum === 4) return <YieldFieldset fruitSize={fruitSize} setFruitSize={setFruitSize} dtmLower={dtmLower} setDTMLower={setDTMLower} dtmUpper={dtmUpper} setDTMUpper={setDTMUpper} heightLower={heightLower} setHeightLower={setHeightLower} heightUpper={heightUpper} setHeightUpper={setHeightUpper} setPageNum={setPageNum} errMsgs={errMsgs} submitTrigger={submitTrigger} handleSubmit={handleSubmit} handleEdit={handleEdit} focusVeg={focusVeg} />;
    };

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

    // handleSubmit and handleEdit passed down to last child component
    function prepareDataForSubmission() {
        let spacingArr = [];
        if (spacingInLower) spacingArr.push(spacingInLower);
        if (spacingInUpper) spacingArr.push(spacingInUpper);
        let dtmArr = [];
        if (dtmLower) dtmArr.push(dtmLower);
        if (dtmUpper) dtmArr.push(dtmUpper);
        let heightArr = [];
        if (heightLower) heightArr.push(heightLower);
        if (heightUpper) heightArr.push(heightUpper); 

        return  { spacingArr, dtmArr, heightArr };
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const { spacingArr, dtmArr, heightArr } = prepareDataForSubmission();
        const reqOptions: RequestInit = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ name, description, hardiness, water, light, growthConditions, lifecycle, plantingSzn, sowingMethod, depth, spacingArr, growthHabit, dtmArr, heightArr, fruitSize, privateData }),
            credentials: "include"
        };
        
        try {
            setSubmitTrigger(submitTrigger + 1);

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
                if (res instanceof Array) {
                    setErrMsgs(res);
                } else {
                    throw new Error(res);
                };
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
        
        try {
            setSubmitTrigger(submitTrigger + 1);

            const req = await fetch(`http://localhost:3000/update-veg-data/${focusVeg?.id}`, reqOptions);
            const res = await req.json();
            if (req.ok) {
                if (setSeedContributions) setSeedContributions(res);
                handleClose();
            } else {
                if (res instanceof Array) {
                    setErrMsgs(res);
                } else {
                    throw new Error(res);
                };
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
            <button type="button" onClick={handleClose}>Close</button>
            <form method="POST" onSubmit={(e) => e.preventDefault()} noValidate>
                {getFieldset()}
            </form>
        </dialog>
    );
};

export default CreateVeg;