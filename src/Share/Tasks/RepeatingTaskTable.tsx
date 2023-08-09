import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { cloneDeep } from "lodash";
import { parseISO, startOfWeek, addDays, eachDayOfInterval } from "date-fns";
import { useGetUserQuery, useGetTasksQuery } from "../../app/apiSlice";
import { useWrapRTKQuery, useGetBedData } from "../../app/customHooks";
import { bedDataInterface, taskInterface, userInterface } from "../../app/interfaces";

interface repeatingTaskTableInterface {
    filterUserTasks: boolean,
};

const RepeatingTaskTable: React.FC<repeatingTaskTableInterface> = function({ filterUserTasks }) {
    // ISO-formatted, e.g., YYYY-MM-DD
    const [ weekDates, setWeekDates ] = useState<string[]>([]);

    const { bedid } = useParams();

    const { data: userObj } = useWrapRTKQuery(useGetUserQuery, undefined);
    const user = userObj as userInterface;
    const bed = useGetBedData(Number(bedid)) as bedDataInterface;
    const matchingMember = bed?.members.find(member => member.id === user?.id);
    const usersRoleID = matchingMember?.role;
    const { data: taskObj } = useWrapRTKQuery(useGetTasksQuery, bedid);
    const tasks = taskObj as taskInterface[];

    const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    useEffect(() => {
        function pullWeekDates() {
            const mondayDate = startOfWeek(new Date(), { weekStartsOn: 1 });
            const sundayDate = addDays(cloneDeep(mondayDate), 6);
            let datesFromMondayToSunday = eachDayOfInterval({
                start: mondayDate,
                end: sundayDate
            });
            const ISOdatesFromMondayToSunday = datesFromMondayToSunday.map(date => date.toISOString().slice(0, 10));
            setWeekDates(ISOdatesFromMondayToSunday);
        };
        pullWeekDates();
    }, []);

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

    function taskRequiresCompletionOnThisDate(task: taskInterface, weekday: string, index: number) {
        // all of these are Date objects
        const currentDate = new Date(weekDates[index]);
        // start and end dates are stored in ISO formatted strings, so if you just call new Date() on them to create a date object, it may actually generate the date object of the previous day! so use parseISO from date-fns instead, with parses ISO strings into date objects
        const taskStartDate = parseISO(task.startdate);
        const taskEndDate = parseISO(task.enddate);

        {/* only generates the checkbox/requires completion IF
            (1) the task repeats on that day
            (2) the date is on or after the start date
            (3) the date is before the end date
            (4) needs to be every, every other, every first/second/third/fourth...
        */}

        let dateMatchesRepeatInterval: boolean = false;
        switch (task.repeatsevery[0]) {
            case "every":
                dateMatchesRepeatInterval = true;
                break;
            case "every other":
                const everyOtherWeekdayFromStartToEndDate = eachDayOfInterval({
                    start: taskStartDate,
                    end: taskEndDate,
                }, { step: 14 });
                const ISOeveryOtherWeekdayFromStartToEndDate = everyOtherWeekdayFromStartToEndDate.map(date => date.toISOString().slice(0, 10));
                console.log(ISOeveryOtherWeekdayFromStartToEndDate);
                if (ISOeveryOtherWeekdayFromStartToEndDate.includes(weekday[index])) {
                    dateMatchesRepeatInterval = true;
                };
                break;
            case "every first":
                break;
            case "every second":
                break;
            case "every third":
                break;
            case "every fourth":
                break;
        };

        if (
            task.repeatsevery.includes(weekday) &&
            currentDate >= taskStartDate &&
            currentDate < taskEndDate &&
            dateMatchesRepeatInterval
        ) {
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
                            {taskRequiresCompletionOnThisDate(task, weekday, index) ? 
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
    );
};

export default RepeatingTaskTable;