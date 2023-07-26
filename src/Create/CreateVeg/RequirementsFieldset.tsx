import { useState, useRef, useEffect } from "react";

interface RequirementsFieldsetInterface {
    hardiness: number[],
    setHardiness: React.Dispatch<React.SetStateAction<number[]>>,
    water: string,
    setWater: React.Dispatch<React.SetStateAction<string>>,
    light: string[],
    setLight: React.Dispatch<React.SetStateAction<string[]>>,
    growthConditions: string,
    setGrowthConditions: React.Dispatch<React.SetStateAction<string>>,
    toggleCheckboxStringState: (state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>, toggleValue: string) => void,
    setPageNum: React.Dispatch<React.SetStateAction<number>>,
    errMsgs: {field: string, msg: string}[],
};

const RequirementsFieldset: React.FC<RequirementsFieldsetInterface> = function({ hardiness, setHardiness, water, setWater, light, setLight, growthConditions, setGrowthConditions, toggleCheckboxStringState, setPageNum, errMsgs }) {
    const [ hardinessErrMsg, setHardinessErrMsg ] = useState("");
    const [ waterErrMsg, setWaterErrMsg ] = useState("");
    const [ lightErrMsg, setLightErrMsg ] = useState("");
    const [ growthConditionsErrMsg, setGrowthConditionsErrMsg ] = useState("");
    const [ msgBeforeProceeding, setMsgBeforeProceeding ] = useState("");

    const growthConditionsRef = useRef<HTMLInputElement>(null);

    function generateHardinessButtons() {
        let hardinessButtonsArr = [];
        for (let i = 1; i <= 12; i++) {
            if (hardiness.includes(i)) {
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

    // displays overall error message if any fields are invalid and prevents user from progressing to next page until all errors are fixed
    function pageChangeCheck(nextPageNum: number) {
        if (!hardinessErrMsg && !waterErrMsg && !lightErrMsg && !growthConditionsErrMsg) {
            setMsgBeforeProceeding("");
            setPageNum(nextPageNum);
        } else {
            setMsgBeforeProceeding("Please fix all errors before proceeding.");
        };
    };

    // displays any error message from server validation
    useEffect(() => {
        if (errMsgs.length > 0) {
            errMsgs.forEach(error => {
                switch (error.field) {
                    case "hardiness":
                        setHardinessErrMsg(error.msg);
                        return;
                    case "water":
                        setWaterErrMsg(error.msg);
                        return;
                    case "light":
                        setLightErrMsg(error.msg);
                        return;
                    case "growthConditions":
                        setGrowthConditionsErrMsg(error.msg);
                        growthConditionsRef.current?.setCustomValidity(error.msg);
                        return;
                };
            });
        };
    }, [errMsgs]);

    return (
        <>
            <p>{msgBeforeProceeding}</p>
            <fieldset>
                <legend>Requirements</legend>
                <fieldset className="hardiness-container">
                    <legend>Hardiness zones</legend>
                    {hardinessErrMsg ? 
                        <div className="error-msg">
                            <p>{hardinessErrMsg}</p> 
                        </div>
                        : null
                    }
                    {generateHardinessButtons()}
                </fieldset>
                <fieldset className="water-container">
                    <legend>Water needs</legend>
                    {waterErrMsg ? 
                        <div className="error-msg">
                            <p>{waterErrMsg}</p> 
                        </div>
                        : null
                    }
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
                    {lightErrMsg ? 
                        <div className="error-msg">
                            <p>{lightErrMsg}</p> 
                        </div>
                        : null
                    }
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
                    {growthConditionsErrMsg ? 
                        <div className="error-msg">
                            <p>{growthConditionsErrMsg}</p> 
                        </div>
                        : null
                    }
                    <input type="textarea" id="growthConditions" ref={growthConditionsRef} maxLength={50} value={growthConditions} onChange={(e) => setGrowthConditions(e.target.value)} placeholder="Drought tolerant, Indoor, Outdoor" />
                </div>
            </fieldset>
            <div>
                    <button type="button" onClick={() => pageChangeCheck(1)}>Previous</button>
                    <button type="button" onClick={() => pageChangeCheck(3)}>Next</button>
            </div>
        </>
    );
};

export default RequirementsFieldset;