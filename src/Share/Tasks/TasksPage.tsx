import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetUserQuery, useGetTasksQuery } from "../../app/apiSlice";
import { useWrapRTKQuery, useGetBedData } from "../../app/customHooks";
import { bedDataInterface, taskInterface, userInterface } from "../../app/interfaces";
import RepeatingTaskTable from "./RepeatingTaskTable";
import AddEditTask from "./AddEditTaskForm/AddEditTask";

const TasksPage: React.FC = function() {
    const [ filterUserTasks, setFilterUserTasks ] = useState(true);
    const [ addEditTaskVis, setAddEditTaskVis ] = useState(false);

    const { bedid } = useParams();

    const { data: userObj } = useWrapRTKQuery(useGetUserQuery, undefined);
    const user = userObj as userInterface;
    const bed = useGetBedData(Number(bedid)) as bedDataInterface;
    const matchingMember = bed?.members.find(member => member.id === user?.id);
    const usersRoleID = matchingMember?.role;
    const { data: taskObj } = useWrapRTKQuery(useGetTasksQuery, bedid);
    const tasks = taskObj as taskInterface[];

    function filterTasks() {
        const filteredTasks = tasks?.filter(task => {
            if (task.assignedtomembers.includes(user?.id) || task.assignedtoroles.includes(usersRoleID)) return task;
        });
        return filteredTasks;
    };

    function generateNonRepeatingTasks() {
        if (tasks) {
            let tasksCopy: taskInterface[] = [...tasks];
            if (filterUserTasks && tasks) tasksCopy = filterTasks();

            const nonRepeatingTasks = tasksCopy.filter(task => task.duedate);
            const nonRepeatingTasksList = nonRepeatingTasks.map(task => (
                <li key={task.id}>
                    <p>{task.name}</p>
                </li>
            ));
            return nonRepeatingTasksList;
        };        
    };

    useEffect(() => {
        if (addEditTaskVis) {
            const addEditTaskForm = document.querySelector(".add-edit-task-form") as HTMLDialogElement;
            addEditTaskForm?.showModal();
        };
    }, [addEditTaskVis]);

    return (
        <>
            <div>
                <input type="checkbox" name="filterUserTasks" id="filterUserTasks" checked={filterUserTasks} onChange={() => setFilterUserTasks(!filterUserTasks)}/>
                <label htmlFor="filterUserTasks">Include tasks assigned to you and/or your assigned role only</label>
            </div>
            <section>
                <h2>Single Tasks</h2>
                <ul>
                    {generateNonRepeatingTasks()}
                </ul>
            </section>
            <section>
                <h2>Repeating Tasks</h2>
                <ul>
                    <RepeatingTaskTable filterUserTasks={filterUserTasks} />
                </ul>
            </section>
            <button onClick={() => setAddEditTaskVis(true)}>Create task</button>
            {addEditTaskVis ?
                <AddEditTask setAddEditTaskVis={setAddEditTaskVis} /> : null
            }
        </>
    );
};

export default TasksPage;