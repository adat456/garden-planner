import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetUserQuery, useAddTaskMutation, useAddNotificationMutation } from "../../../app/apiSlice";
import { useWrapRTKMutation, useWrapRTKQuery, useGetBedData } from "../../../app/customHooks";
import { nanoid } from "@reduxjs/toolkit";
import { bedDataInterface, userInterface } from "../../../app/interfaces";
import EditRepeatingTask from "./EditRepeatingTask";
import EditAssignees from "./EditAssignees";

interface addEditTaskInterface {
    setAddEditTaskVis: React.Dispatch<React.SetStateAction<boolean>>
};

const AddEditTask: React.FC<addEditTaskInterface> = function({ setAddEditTaskVis }) {
    const [ name, setName ] = useState("");
    const [ description, setDescription ] = useState("");
    const [ duedate, setDuedate ] = useState("");
    const [ startdate, setStartdate ] = useState("");
    const [ enddate, setEnddate ] = useState("");

    const [ repeatInterval, setRepeatInterval ] = useState("");
    const [ repeatDays, setRepeatDays ] = useState<string[]>([]);

    const [ assignedtomembers, setAssignedtomembers ] = useState<number[]>([]);
    const [ assignedtoroles, setAssignedtoroles ] = useState<string[]>([]);

    const [ privateTask, setPrivateTask ] = useState(false);

    const { bedid } = useParams();

    const bed = useGetBedData(Number(bedid)) as bedDataInterface;
    const { data: userData } = useWrapRTKQuery(useGetUserQuery, undefined);
    const user = userData as userInterface;

    const { mutation: addTask, isLoading: addTaskIsLoading } = useWrapRTKMutation(useAddTaskMutation);
    const { mutation: addNotification, isLoading: addNotificationIsLoading } = useWrapRTKMutation(useAddNotificationMutation);

    async function handleAddTask(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!addTaskIsLoading && !addNotificationIsLoading) {
            try {
                const taskid = nanoid();
                const repeatsevery = [repeatInterval, ...repeatDays];

                await addTask({
                    bedid,
                    task: {
                        id: taskid,
                        name, description, duedate, startdate, enddate, repeatsevery,
                        assignedtomembers, assignedtoroles,
                        private: privateTask
                    },
                }).unwrap();

                closeForm();
            } catch(err) {
                console.error("Unable to create task: ", err.message, err.data);
            };
        };
    };

    function closeForm() {
        setAddEditTaskVis(false);
        const addEditTaskForm = document.querySelector(".add-edit-task-form") as HTMLDialogElement;
        addEditTaskForm?.close();
    };

    return (
        <dialog className="add-edit-task-form">
            <form method="POST" onSubmit={handleAddTask} noValidate>
                <div>
                    <label htmlFor="name">Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
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
                    <input type="date" value={startdate} onChange={(e) => setStartdate(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="enddate">End Date</label>
                    <input type="date" value={enddate} onChange={(e) => setEnddate(e.target.value)} required />
                </div>

                <EditRepeatingTask repeatDays={repeatDays} setRepeatDays={setRepeatDays} setRepeatInterval={setRepeatInterval} />
                <EditAssignees setAssignedtomembers={setAssignedtomembers} assignedtomembers={assignedtomembers} setAssignedtoroles={setAssignedtoroles} assignedtoroles={assignedtoroles} />

                <div>
                    <input type="checkbox" name="private" id="private" checked={privateTask} onChange={() => setPrivateTask(!privateTask)} />
                    <label htmlFor="private">Make this task private (only assignees may view)</label>
                </div>

                <button type="submit">Create</button>
                <button type="button" onClick={closeForm}>Close</button>
            </form>
        </dialog>
    );
};

export default AddEditTask;