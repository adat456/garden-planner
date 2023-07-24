import { useState, useRef, useEffect } from "react";

interface dutyInterface {
    value: string,
    id: number,
};

interface dutyComponentInterface {
    currentDuty: dutyInterface,
    duties: dutyInterface[],
    setDuties: React.Dispatch<React.SetStateAction<dutyInterface[]>>,
    submitTrigger: number,
};

const Duty: React.FC<dutyComponentInterface> = function({ currentDuty, duties, setDuties, submitTrigger }) {
    const [ errMsg, setErrMsg ] = useState("");

    const inputRef = useRef<HTMLInputElement>(null);
    // stores the previous submitTrigger value for comparison
    const previousTriggerValue = useRef(submitTrigger);

    function handleChange(newValue: string) {
        const dutiesCopy = [...duties];
        dutiesCopy.forEach(duty => {
            if (duty.id === currentDuty.id) duty.value = newValue;
        });
        setDuties(dutiesCopy);

        validateOptionalDutyLength(inputRef?.current, 75);
    };

    useEffect(() => {
        console.log(submitTrigger, previousTriggerValue.current);
        if (submitTrigger > previousTriggerValue.current) validateOptionalDutyLength(inputRef?.current, 75);
    }, [submitTrigger]);

    const validateOptionalDutyLength: (input: HTMLInputElement | null, length: number) => void = function(input, length) {
        if (input?.value.trim() === "") {
            input.setCustomValidity("Must be 1-75 characters without whitespace. Remove if not needed.");
            setErrMsg("Must be 1-75 characters without whitespace. Remove if not needed.");
            return;
        } else if (input?.validity.tooLong) {
            input.setCustomValidity(`Must be no longer than ${length} characters.`);
            setErrMsg(`Must be no longer than ${length} characters.`);
            return;
        } else {
            input?.setCustomValidity("");
            setErrMsg("");
            return;
        };
    };

    return (
        <div>
            <label htmlFor={`duty-${currentDuty.id}`}></label>
            {errMsg ?
                <div className="error-msg">
                    <p>{errMsg}</p>
                </div>
                : null
            }
            <input type="text" className="duty" id={`duty-${currentDuty.id}`} ref={inputRef} maxLength={75} value={currentDuty.value} onChange={(e) => handleChange(e.target.value)} required />
        </div>
    );
};

export default Duty;