import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetUserQuery, useAddTaskMutation, useAddNotificationMutation } from "../../app/apiSlice";
import { useWrapRTKMutation, useWrapRTKQuery, useGetBedData } from "../../app/customHooks";
import { nanoid } from "@reduxjs/toolkit";
import { bedDataInterface, userInterface } from "../../app/interfaces";

const AddEditTask: React.FC = function() {
    const [ name, setName ] = useState("");
    const [ description, setDescription ] = useState("");
    const [ duedate, setDuedate ] = useState("");
    const [ startdate, setStartdate ] = useState("");
    const [ enddate, setEnddate ] = useState("");
    const [ repeatsevery, setRepeatsevery ] = useState("");

    const [ assignedtosearch, setAssignedtosearch ] = useState("");
    const [ assignedtoresults, setAssignedtoresults ] = useState<{id: number, name: string}[]>([]);
    const [ assignedto, setAssignedto ] = useState<string[]>([]);

    const { bedid } = useParams();

    const bed = useGetBedData(Number(bedid)) as bedDataInterface;
    const { data: userData } = useWrapRTKQuery(useGetUserQuery, undefined);
    const user = userData as userInterface;

    const { mutation: addTask, isLoading: addTaskIsLoading } = useWrapRTKMutation(useAddTaskMutation);
    const { mutation: addNotification, isLoading: addNotificationIsLoading } = useWrapRTKMutation(useAddNotificationMutation);

    function handleSearchTermChange(e: React.ChangeEvent<HTMLInputElement>) {
        const input = e.target as HTMLInputElement;
        setAssignedtosearch(input.value);
        const preppedSearchTerm = input.value.toLowerCase().trim();

        if (preppedSearchTerm.length === 0) {
            setAssignedtoresults([]);
        } else {
            let updatedSearchResults: {id: number, name: string}[] = [];

            bed?.members.forEach(member => {
                if (member.name.toLowerCase().includes(preppedSearchTerm) || member.username.toLowerCase().includes(preppedSearchTerm)) updatedSearchResults.push({id: member.id, name: member.name});
            });
            bed?.roles.forEach(role => {
                if (role.title.toLowerCase().includes(preppedSearchTerm)) updatedSearchResults.push({id: role.id, name: role.title});
            });

            setAssignedtoresults(updatedSearchResults);
        };
    };

    function generateSearchResults() {
        const searchResults = assignedtoresults?.map(result => (
            <li key={result.id}>
                <button>{result.name}</button>
            </li>
        ));
        return searchResults;
    };

    async function handleAddTask() {
        if (!addTaskIsLoading && !addNotificationIsLoading) {
            try {
                const taskid = nanoid();

                await addTask({
                    bedid,
                    task: {
                        id: taskid,
                        name, description, duedate, startdate, enddate, repeatsevery, assignedto,
                        assignedby: user?.id,
                        datecreated: new Date().toISOString().slice(0, 10),
                    },
                }).unwrap();
            } catch(err) {
                console.error("Unable to create task: ", err.message, err.data);
            };
        };
    };

    return (
        <dialog>
            <form>
                <div>
                    <label htmlFor="name">Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="description">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="duedate">Due Date</label>
                    <input type="date" value={duedate} onChange={(e) => setDuedate(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="startdate">Start Date</label>
                    <input type="date" value={startdate} onChange={(e) => setStartdate(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="enddate">End Date</label>
                    <input type="date" value={enddate} onChange={(e) => setEnddate(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="assignedtosearch">Assign to</label>
                    <input type="text" value={assignedtosearch} onChange={handleSearchTermChange} />
                    {generateSearchResults()}
                </div>
            </form>
        </dialog>
    );
};