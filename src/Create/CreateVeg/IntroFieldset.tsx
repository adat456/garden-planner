import { useState, useRef, useEffect } from "react";
import { validateRequiredInputLength } from "../../app/helpers";

interface IntroFieldsetInterface {
    name: string,
    setName: React.Dispatch<React.SetStateAction<string>>,
    description: string,
    setDescription: React.Dispatch<React.SetStateAction<string>>,
    privateData: boolean,
    setPrivateData: React.Dispatch<React.SetStateAction<boolean>>,
    setPageNum: React.Dispatch<React.SetStateAction<number>>,
    errMsgs: {field: string, msg: string}[],
};

const IntroFieldset: React.FC<IntroFieldsetInterface> = function({ name, setName, description, setDescription, privateData, setPrivateData, setPageNum, errMsgs }) {
    const [ nameErrMsg, setNameErrMsg ] = useState("");
    const [ descriptionErrMsg, setDescriptionErrMsg ] = useState("");
    const [ privateDataErrMsg, setPrivateDataErrMsg ] = useState("");
    const [ msgBeforeProceeding, setMsgBeforeProceeding ] = useState("");

    const nameRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLInputElement>(null);
    const privateDataRef = useRef<HTMLInputElement>(null);

    // displays overall error message if any fields are invalid and prevents user from progressing to next page until all errors are fixed
    function pageChangeCheck(nextPageNum: number) {
        if (validateRequiredInputLength(nameRef?.current, 25, setNameErrMsg) && !descriptionErrMsg && !privateDataErrMsg) {
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
                    case "name":
                        setNameErrMsg(error.msg);
                        nameRef.current?.setCustomValidity(error.msg);
                        return;
                    case "description":
                        setDescriptionErrMsg(error.msg);
                        descriptionRef.current?.setCustomValidity(error.msg);
                        return;
                    case "privateData":
                        setPrivateDataErrMsg(error.msg);
                        privateDataRef.current?.setCustomValidity(error.msg);
                        return;
                };
            });
        };
    }, [errMsgs]);

    return (
        <>
            <p>{msgBeforeProceeding}</p>
            <div>
                <label htmlFor="name">Name*</label>
                {nameErrMsg ? 
                    <div className="error-msg">
                        <p>{nameErrMsg}</p> 
                    </div>
                    : null
                }
                <input type="text" id="name" ref={nameRef} maxLength={25} value={name} onChange={(e) => {setName(e.target.value); validateRequiredInputLength(nameRef?.current, 25, setNameErrMsg);}} required />
            </div>
            <div>
                <label htmlFor="description">Description</label>
                {descriptionErrMsg ? 
                    <div className="error-msg">
                        <p>{descriptionErrMsg}</p> 
                    </div>
                    : null
                }
                <input type="textarea" id="description" ref={descriptionRef} maxLength={250} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
                {privateDataErrMsg ? 
                    <div className="error-msg">
                        <p>{privateDataErrMsg}</p> 
                    </div>
                    : null
                }
                <input type="checkbox" name="privateData" id="privateData" ref={privateDataRef} checked={privateData} onChange={() => setPrivateData(!privateData)} />
                <label htmlFor="privateData">Set to private?</label>
            </div>
            <div>
                <button type="button" onClick={() => pageChangeCheck(2)}>Next</button>
            </div>
        </>
    )
};

export default IntroFieldset;