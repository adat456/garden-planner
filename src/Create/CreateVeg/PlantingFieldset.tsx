import { useState, useRef, useEffect } from "react";

interface PlantingFieldsetInterface {
    lifecycle: string,
    setLifecycle: React.Dispatch<React.SetStateAction<string>>,
    plantingSzn: string[],
    setPlantingSzn: React.Dispatch<React.SetStateAction<string[]>>,
    sowingMethod: string,
    setSowingMethod: React.Dispatch<React.SetStateAction<string>>,
    depth: string,
    setDepth: React.Dispatch<React.SetStateAction<string>>,
    spacingInLower: number,
    setSpacingInLower: React.Dispatch<React.SetStateAction<number>>,
    spacingInUpper: number,
    setSpacingInUpper: React.Dispatch<React.SetStateAction<number>>,
    growthHabit: string,
    setGrowthHabit: React.Dispatch<React.SetStateAction<string>>,
    toggleCheckboxStringState: (state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>, toggleValue: string) => void,
    setPageNum: React.Dispatch<React.SetStateAction<number>>,
    errMsgs: {field: string, msg: string}[],
};

const PlantingFieldset: React.FC<PlantingFieldsetInterface> = function({ lifecycle, setLifecycle, plantingSzn, setPlantingSzn, sowingMethod, setSowingMethod, depth, setDepth, spacingInLower, setSpacingInLower, spacingInUpper, setSpacingInUpper, growthHabit, setGrowthHabit, toggleCheckboxStringState, setPageNum, errMsgs }) {
    const [ lifecycleErrMsg, setLifecycleErrMsg ] = useState("");
    const [ plantingSznErrMsg, setPlantingSznErrMsg ] = useState("");
    const [ sowingMethodErrMsg, setSowingMethodErrMsg ] = useState("");
    const [ depthErrMsg, setDepthErrMsg ] = useState("");
    const [ spacingInLowerErrMsg, setSpacingInLowerErrMsg ] = useState("");
    const [ spacingInUpperErrMsg, setSpacingInUpperErrMsg ] = useState(""); 
    const [ growthHabitErrMsg, setGrowthHabitErrMsg ] = useState("");
    const [ msgBeforeProceeding, setMsgBeforeProceeding ] = useState("");
    
    const sowingMethodRef = useRef<HTMLInputElement>(null);
    const depthRef = useRef<HTMLInputElement>(null);
    const spacingInLowerRef = useRef<HTMLInputElement>(null);
    const spacingInUpperRef = useRef<HTMLInputElement>(null);
    const growthHabitRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (spacingInLower && spacingInUpper && spacingInUpper <= spacingInLower) {
            setSpacingInUpperErrMsg("If provided, upper limit of spacing range must be greater than lower limit.");
        } else {
            setSpacingInUpperErrMsg("");
        };
    }, [spacingInLower, spacingInUpper]);

    // displays overall error message if any fields are invalid and prevents user from progressing to next page until all errors are fixed
    function pageChangeCheck(nextPageNum: number) {
        if (!lifecycleErrMsg && !plantingSznErrMsg && !sowingMethodErrMsg && !depthErrMsg && !spacingInLowerErrMsg && !spacingInUpperErrMsg && !growthHabitErrMsg) {
            setMsgBeforeProceeding("");
            setPageNum(nextPageNum);
        } else {
            setMsgBeforeProceeding("Please fix all errors before proceeding.");
        };
    };

    // displays any error messages from server validation
    useEffect(() => {
        if (errMsgs.length > 0) {
            errMsgs.forEach(error => {
                switch (error.field) {
                    case "lifecycle":
                        setLifecycleErrMsg(error.msg);
                        return;
                    case "plantingSzn":
                        setPlantingSznErrMsg(error.msg);
                        return;
                    case "sowingMethod":
                        setSowingMethodErrMsg(error.msg);
                        sowingMethodRef.current?.setCustomValidity(error.msg);
                        return;
                    case "depth":
                        setDepthErrMsg(error.msg);
                        depthRef.current?.setCustomValidity(error.msg);
                        return;
                    case "spacingArr[0]":
                        setSpacingInLowerErrMsg(error.msg);
                        spacingInLowerRef.current?.setCustomValidity(error.msg);
                        return;
                    case "spacingArr[1]":
                        setSpacingInUpperErrMsg(error.msg);
                        spacingInUpperRef.current?.setCustomValidity(error.msg);
                        return;
                    case "growthHabit":
                        setGrowthHabitErrMsg(error.msg);
                        growthHabitRef.current?.setCustomValidity(error.msg);
                        return;
                };
            });
        };
    }, [errMsgs]);

    return (
        <>
            <p>{msgBeforeProceeding}</p>
            <fieldset>
                <legend>Planting</legend>
                <fieldset className="lifecycle-container">
                    <legend>Lifecycle</legend>
                    {lifecycleErrMsg ? 
                        <div className="error-msg">
                            <p>{lifecycleErrMsg}</p> 
                        </div>
                        : null
                    }
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
                    {plantingSznErrMsg ? 
                        <div className="error-msg">
                            <p>{plantingSznErrMsg}</p> 
                        </div>
                        : null
                    }
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
                    {sowingMethodErrMsg ? 
                        <div className="error-msg">
                            <p>{sowingMethodErrMsg}</p> 
                        </div>
                        : null
                    }
                    <input type="textarea" id="sowingMethod" ref={sowingMethodRef} maxLength={50} value={sowingMethod} onChange={(e) => setSowingMethod(e.target.value)} placeholder="Direct Sow, Start Indoors"/>
                </div>
                <div>
                    <label htmlFor="depth">Depth</label>
                    {depthErrMsg ? 
                        <div className="error-msg">
                            <p>{depthErrMsg}</p> 
                        </div>
                        : null
                    }
                    <input type="text" id="depth" ref={depthRef} maxLength={25} value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="1/2 inch"/>
                </div>
                <div>
                    <label htmlFor="spacingInLower">Spacing (in inches)</label>
                    {spacingInLowerErrMsg ? 
                        <div className="error-msg">
                            <p>{spacingInLowerErrMsg}</p> 
                        </div>
                        : null
                    }
                    {spacingInUpperErrMsg ? 
                        <div className="error-msg">
                            <p>{spacingInUpperErrMsg}</p> 
                        </div>
                        : null
                    }
                    <div>
                        <input type="number" id="spacingInLower" min={0} ref={spacingInLowerRef} value={spacingInLower} onChange={(e) => setSpacingInLower(Number(e.target.value))} placeholder="18"/>
                        <label htmlFor="spacingInUpper">-</label>
                        <input type="number" id="spacingInUpper" min={0} ref={spacingInUpperRef} value={spacingInUpper} onChange={(e) => setSpacingInUpper(Number(e.target.value))} placeholder="24"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="growthHabit">Growth habit</label>
                    {growthHabitErrMsg ? 
                        <div className="error-msg">
                            <p>{growthHabitErrMsg}</p> 
                        </div>
                        : null
                    }
                    <input type="textarea" id="growthHabit" ref={growthHabitRef} maxLength={50} value={growthHabit} onChange={(e) => setGrowthHabit(e.target.value)} placeholder="Multi-Branching, Spreading, Upright" />
                </div>
            </fieldset>
            <div>
                <button type="button" onClick={() => pageChangeCheck(2)}>Previous</button>
                <button type="button" onClick={() => pageChangeCheck(4)}>Next</button>
            </div>
        </>
    );
};

export default PlantingFieldset;