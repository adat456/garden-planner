import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { cloneDeep } from "lodash";
import { parseISO, startOfWeek, addDays, subDays, eachDayOfInterval, nextDay, getDay } from "date-fns";
import { useGetUserQuery, useGetTasksQuery } from "../../app/apiSlice";
import { useWrapRTKQuery, useGetBedData } from "../../app/customHooks";
import { bedDataInterface, taskInterface, userInterface } from "../../app/interfaces";

interface repeatingTaskTableInterface {
    filterUserTasks: boolean,
};

const RepeatingTaskTable: React.FC<repeatingTaskTableInterface> = function({ filterUserTasks }) {
    // ISO-formatted, e.g., YYYY-MM-DD, starts from Monday
    const [ weekDates, setWeekDates ] = useState<string[]>([]);

    const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    const { bedid } = useParams();

    const { data: userObj } = useWrapRTKQuery(useGetUserQuery, undefined);
    const user = userObj as userInterface;
    const bed = useGetBedData(Number(bedid)) as bedDataInterface;
    const matchingMember = bed?.members.find(member => member.id === user?.id);
    const usersRoleID = matchingMember?.role;
    const { data: taskObj } = useWrapRTKQuery(useGetTasksQuery, bedid);
    const tasks = taskObj as taskInterface[];

    function pullWeekDates(mondayDate: Date, sundayDate: Date) {
        let datesFromMondayToSunday = eachDayOfInterval({
            start: mondayDate,
            end: sundayDate
        });
        const ISOdatesFromMondayToSunday = datesFromMondayToSunday.map(date => date.toISOString().slice(0, 10));
        setWeekDates(ISOdatesFromMondayToSunday);
    };
    useEffect(() => { 
        if (weekDates.length === 0) {
            const currentMondayDate = startOfWeek(new Date(), { weekStartsOn: 1 });
            const currentSundayDate = addDays(cloneDeep(currentMondayDate), 6);
        
            pullWeekDates(currentMondayDate, currentSundayDate);
        };        
    }, []);
    function pullPreviousWeekDates() {
        const previousMondayDate = subDays(parseISO(weekDates[0]), 7);
        const previousSundayDate = subDays(parseISO(weekDates[6]), 7);
        console.log(previousMondayDate, previousSundayDate);
        
        pullWeekDates(previousMondayDate, previousSundayDate);
    };
    function pullNextWeekDates() {
        const nextMondayDate = addDays(parseISO(weekDates[0]), 7);
        const nextSundayDate = addDays(parseISO(weekDates[6]), 7);

        pullWeekDates(nextMondayDate, nextSundayDate);
    };
    function generateTableHeader() {
        if (weekDates.length > 0) {
            const tableHeader = weekDates.map((date, index) => (
                <th key={date}>{`${weekdays[index]}, ${date.slice(5, 10)}`}</th>
            ));
            return tableHeader;
        };
    };

    function filterTasks() {
        const filteredTasks = tasks?.filter(task => {
            if (task.assignedtomembers.includes(user?.id) || task.assignedtoroles.includes(usersRoleID)) return task;
        });
        return filteredTasks;
    };

    function taskRequiresCompletionOnThisDate(task: taskInterface, index: number) {
        // only requires completion if due date (non-repeating) matches the current date or if the due dates (repeating) include the current date
        if (task.duedate === weekDates[index] || task.repeatingduedates.includes(weekDates[index])) {
            return true;
        } else {
            return false;
        };
    };

    function generateRepeatingTasks() {
        if (tasks) {
            let tasksCopy: taskInterface[] = [...tasks];
            if (filterUserTasks && tasks) tasksCopy = filterTasks();
            const repeatingTasks = tasksCopy.filter(task => task.repeatsevery.length >= 2);
            
            const repeatingTasksRows = repeatingTasks.map(task => (
                <tr key={task.id}>
                    <td>{task.name}</td>
                    {weekdays.map((weekday, index) => (
                        <td key={weekday}>
                            {taskRequiresCompletionOnThisDate(task, index) ? 
                                <>
                                    <input type="checkbox" name="" id="" />
                                    <label htmlFor=""></label>
                                </> 
                                : null
                            }
                        </td>
                    ))}
                </tr>
            ));
            return repeatingTasksRows;
        };
    };

    return (
        <div>
            <div>
                <button type="button" onClick={pullPreviousWeekDates}>Previous week</button>
                <button type="button" onClick={pullNextWeekDates}>Next week</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th />
                        {generateTableHeader()}
                    </tr>
                </thead>
                <tbody>
                    {generateRepeatingTasks()}
                </tbody>
            </table>
        </div>
    );
};

export default RepeatingTaskTable;