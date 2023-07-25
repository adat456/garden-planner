import { useState, useRef } from "react";
import { nanoid } from "@reduxjs/toolkit";
import { useGetBedsQuery, useUpdateRolesMutation } from "../../../app/apiSlice";
import { bedDataInterface, rolesInterface } from "../../../app/interfaces";
import { validateRequiredInputLength } from "../../../app/helpers";
import Duty from "./DutyInput";

interface AddRoleInterface {
    bedid: string | undefined,
    focusRole?: rolesInterface | null,
    setFocusRole: React.Dispatch<React.SetStateAction<rolesInterface | null>>,
    setAddEditRoleVis: React.Dispatch<React.SetStateAction<boolean>>
};

const AddEditRole: React.FC<AddRoleInterface> = function({ bedid, focusRole, setFocusRole, setAddEditRoleVis }) {
    const [ title, setTitle ] = useState(focusRole?.title || "");
    const [ titleErrMsg, setTitleErrMsg ] = useState("");
    const [ counter, setCounter ] = useState(focusRole?.duties.length || 2);
    const [ duties, setDuties ] = useState<{
        value: string,
        id: number,
    }[]>(focusRole?.duties ? 
        JSON.parse(JSON.stringify(focusRole?.duties)) : 
        [
            { value: "", id: 0 },
            { value: "", id: 1 }
        ]
    );
    const [ dutiesErrMsgArr, setDutiesErrMsgArr ] = useState<string[]>([]);
    // when incremented (during submission), will trigger validation function in each duty child component
    const [ submitTrigger, setSubmitTrigger ] = useState(0);

    const titleInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const bed = bedObject.bed as bedDataInterface;
    const existingRoles = bed?.roles;

    const [ updateRoles, { isLoading }] = useUpdateRolesMutation();

    function generateDutiesInputs() {
        const dutiesInputs = duties.map(duty => (
            <div key={`duty-${duty.id}`}>
                <button type="button" onClick={() => removeDuties(duty.id)}>X</button>
                <Duty key={duty.id} currentDuty={duty} duties={duties} setDuties={setDuties} submitTrigger={submitTrigger} />
            </div>
        ));
        return dutiesInputs;
    };
    function addDuties() {
        setDuties([
            ...duties,
            { value: "", id: counter }
        ]);
        setCounter(counter + 1);
    };
    function removeDuties(dutyId: number) {
        setDuties(duties.filter(duty => duty.id !== dutyId));
    };

    async function handleAddRole(e: React.FormEvent) {
        e.preventDefault();

        if (!isLoading && existingRoles) {
            setSubmitTrigger(submitTrigger + 1);
            validateRequiredInputLength(titleInputRef?.current, 25, setTitleErrMsg);
            if (!formRef?.current?.checkValidity()) return;

            try {
                await updateRoles({
                    // necessary to generate a string id here (rather than allowing postgresql to generate a serial number id) because it will be added as JSON object to a single column
                    roles: [...existingRoles, { id: nanoid(), title, duties }],
                    bedid 
                }).unwrap();

                handleCloseForm();
            } catch(err) {
                console.error("Unable to add role: ", err.data);
                if (err.data instanceof Array) displayExpressValidatorErrMsgs(err.data);
            };
        };
    };

    async function handleEditRole(e: React.FormEvent) {
        e.preventDefault();

        if (!isLoading && existingRoles) {
            setSubmitTrigger(submitTrigger + 1);
            validateRequiredInputLength(titleInputRef?.current, 25, setTitleErrMsg);
            if (!formRef?.current?.checkValidity()) return;

            try {
                let updatedRoles = existingRoles.filter(existingRole => existingRole.id !== focusRole?.id);
                updatedRoles.push({ id: focusRole?.id, title, duties });

                await updateRoles({
                    roles: updatedRoles,
                    bedid 
                }).unwrap();

                setSubmitStatus(false);
                handleCloseForm();
            } catch(err) {
                console.error("Unable to edit role: ", err.data);
                if (err.data instanceof Array) displayExpressValidatorErrMsgs(err.data);
            };
        };
    };

    function displayExpressValidatorErrMsgs(errorArr: {field: string, msg: string}[]) {
        let serverDutiesErrMsgArr: string[] = [];
        errorArr.forEach(error => {
            if (error.field === "[0].title") {
                setTitleErrMsg(error.msg);
                titleInputRef.current?.setCustomValidity(error.msg);
            };
            if (error.field.includes("duties")) {
                const dutyId = error.field.slice(-8, -7);
                serverDutiesErrMsgArr.push(`Duty ${dutyId + 1}: ${error.msg}`);
                const dutyInput: HTMLInputElement | null = document.getElementById(`data-${dutyId}`);
                dutyInput?.setCustomValidity(error.msg);
            };
        });
        setDutiesErrMsgArr(serverDutiesErrMsgArr);
    };

    function generateDutiesErrMessages() {
        const errMsgs = dutiesErrMsgArr.map((errMsg, index) => (
            <li key={index} className="error-msg">
                <p>{errMsg}</p>
            </li>
        ));
        return errMsgs;
    };

    function handleCloseForm() {
        const addEditRoleForm: HTMLDialogElement | null = document.querySelector(".add-edit-role-form");
        addEditRoleForm?.close();

        setAddEditRoleVis(false);
        setFocusRole(null);
    };

    return (
        <dialog className="add-edit-role-form">
            <form method="POST" ref={formRef} onSubmit={focusRole ? handleEditRole : handleAddRole} noValidate>
                <div>
                    <label htmlFor="title">Title*</label>
                    {titleErrMsg ? 
                        <div className="error-msg">
                            <p>{titleErrMsg}</p> 
                        </div>
                        : null
                    }
                    <input type="text" id="title" ref={titleInputRef} maxLength={25} onChange={(e) => {setTitle(e.target.value.trim()); validateRequiredInputLength(titleInputRef?.current, 25, setTitleErrMsg);}} required />
                </div>
                <fieldset>
                    <legend>Duties</legend>
                    {dutiesErrMsgArr ? 
                        <ul>
                            {generateDutiesErrMessages()}
                        </ul>
                        : null
                    }
                    {generateDutiesInputs()}
                    <button type="button" onClick={addDuties}>Add duty</button>
                </fieldset>
                <button type="submit">{focusRole ? "Submit edits" : "Create new role"}</button>
                <button type="button" onClick={handleCloseForm}>Close</button>
            </form>
        </dialog>
    );
};

export default AddEditRole;
