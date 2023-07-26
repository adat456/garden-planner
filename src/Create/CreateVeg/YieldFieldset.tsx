import { useState, useRef, useEffect } from "react";
import { plantDataInterface } from "../../app/interfaces";

interface YieldFieldsetInterface {
    fruitSize: string,
    setFruitSize: React.Dispatch<React.SetStateAction<string>>,
    heightLower: number,
    setHeightLower: React.Dispatch<React.SetStateAction<number>>,
    heightUpper: number,
    setHeightUpper: React.Dispatch<React.SetStateAction<number>>,
    dtmLower: number,
    setDTMLower: React.Dispatch<React.SetStateAction<number>>,
    dtmUpper: number,
    setDTMUpper: React.Dispatch<React.SetStateAction<number>>,
    setPageNum: React.Dispatch<React.SetStateAction<number>>,
    errMsgs: {field: string, msg: string}[],
    submitTrigger: number,
    handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void,
    handleEdit: (e: React.MouseEvent<HTMLButtonElement>) => void,
    focusVeg?: plantDataInterface
};

const YieldFieldset: React.FC<YieldFieldsetInterface> = function({ fruitSize, setFruitSize, heightLower, setHeightLower, heightUpper, setHeightUpper, dtmLower, setDTMLower, dtmUpper, setDTMUpper, setPageNum, errMsgs, submitTrigger, handleSubmit, handleEdit, focusVeg }) {
    const [ fruitSizeErrMsg, setFruitSizeErrMsg ] = useState("");
    const [ heightLowerErrMsg, setHeightLowerErrMsg ] = useState("");
    const [ heightUpperErrMsg, setHeightUpperErrMsg ] = useState("");
    const [ dtmLowerErrMsg, setDTMLowerErrMsg ] = useState("");
    const [ dtmUpperErrMsg, setDTMUpperErrMsg ] = useState("");
    const [ msgBeforeProceeding, setMsgBeforeProceeding ] = useState("");

    const fruitSizeRef = useRef<HTMLInputElement>(null);
    const heightLowerRef = useRef<HTMLInputElement>(null);
    const heightUpperRef = useRef<HTMLInputElement>(null);
    const dtmLowerRef = useRef<HTMLInputElement>(null);
    const dtmUpperRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (dtmLower && dtmUpper && dtmUpper <= dtmLower) {
            setDTMUpperErrMsg("If provided, upper limit of days to maturity range must be greater than lower limit.");
        } else {
            setDTMUpperErrMsg("");
        };
    }, [dtmLower, dtmUpper]);
    useEffect(() => {
        if (heightLower && heightUpper && heightUpper <= heightLower) {
            setHeightUpperErrMsg("If provided, upper limit of height range must be greater than lower limit.");
        } else {
            setHeightUpperErrMsg("");
        };
    }, [heightLower, heightUpper]);

    // final check when submit button is pressed for invalid values
    function submissionCheck(e: React.MouseEvent<HTMLButtonElement>) {
        if (!fruitSizeErrMsg && !heightLowerErrMsg && !heightUpperErrMsg && !dtmLowerErrMsg && !dtmUpperErrMsg) {
            setMsgBeforeProceeding("");
            if (focusVeg) handleEdit(e);
            if (!focusVeg) handleSubmit(e);
        } else {
            setMsgBeforeProceeding("Please fix all errors before submitting.");
        };
    };

    // displaying errors from server-side validation
    useEffect(() => {
        if (errMsgs.length > 0) {
            errMsgs.forEach(error => {
                switch (error.field) {
                    case "fruitSize":
                        setFruitSizeErrMsg(error.msg);
                        fruitSizeRef.current?.setCustomValidity(error.msg);
                        return;
                    case "heightArr[0]":
                        setHeightLowerErrMsg(error.msg);
                        heightLowerRef.current?.setCustomValidity(error.msg);
                        return;
                    case "heightArr[1]":
                        setHeightUpperErrMsg(error.msg);
                        heightUpperRef.current?.setCustomValidity(error.msg);
                        return;
                    case "dtmArr[0]":
                        setDTMLowerErrMsg(error.msg);
                        dtmLowerRef.current?.setCustomValidity(error.msg);
                        return;
                    case "dtmArr[1]":
                        setDTMUpperErrMsg(error.msg);
                        dtmUpperRef.current?.setCustomValidity(error.msg);
                        return;
                };
            });
        };
    }, [errMsgs]);

    return (
        <>
            <p>{msgBeforeProceeding}</p>
            <fieldset>
                <legend>Yield</legend>
                <div>
                    <label htmlFor="dtmLower">Days to maturity</label>
                    {dtmLowerErrMsg ? 
                        <div className="error-msg">
                            <p>{dtmLowerErrMsg}</p> 
                        </div>
                        : null
                    }
                    {dtmUpperErrMsg ? 
                        <div className="error-msg">
                            <p>{dtmUpperErrMsg}</p> 
                        </div>
                        : null
                    }
                    <div>
                        <input type="number" id="dtmLower" min={0} ref={dtmLowerRef} value={dtmLower} onChange={(e) => setDTMLower(Number(e.target.value))} placeholder="30"/>
                        <label htmlFor="dtmUpper">-</label>
                        <input type="number" id="dtmUpper" min={0} ref={dtmUpperRef} value={dtmUpper} onChange={(e) => setDTMUpper(Number(e.target.value))} placeholder="45"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="heightLower">Height (in inches)</label>
                    {heightLowerErrMsg ? 
                        <div className="error-msg">
                            <p>{heightLowerErrMsg}</p> 
                        </div>
                        : null
                    }
                    {heightUpperErrMsg ? 
                        <div className="error-msg">
                            <p>{heightUpperErrMsg}</p> 
                        </div>
                        : null
                    }
                    <div>
                        <input type="number" id="heightLower" min={0} ref={heightLowerRef} value={heightLower} onChange={(e) => setHeightLower(Number(e.target.value))} placeholder="8"/>
                        <label htmlFor="heightUpper">-</label>
                        <input type="number" id="heightUpper" min={0} ref={heightUpperRef} value={heightUpper} onChange={(e) => setHeightUpper(Number(e.target.value))} placeholder="12"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="fruitSize">Fruit size</label>
                    {fruitSizeErrMsg ? 
                        <div className="error-msg">
                            <p>{fruitSizeErrMsg}</p> 
                        </div>
                        : null
                    }
                    <input type="text" id="fruitSize" ref={fruitSizeRef} value={fruitSize} onChange={(e) => setFruitSize(e.target.value)} placeholder="9-12 ounces"/>
                </div>
            </fieldset>
            <div>
                <button type="button" onClick={() => setPageNum(3)}>Previous</button>
            </div>
            
            <button type="submit" onClick={submissionCheck}>{focusVeg ? "Update database entry" : "Add to database"}</button>
        </>
    );
};

export default YieldFieldset;