import { Link, useParams } from "react-router-dom";

const TasksGroup: React.FC = function() {
    const { bedid } = useParams();

    return (
        <section>
            <h2>Tasks</h2>
            <Link to={`/share/${bedid}/tasks`}>See all tasks</Link>
        </section>
    );
};

export default TasksGroup;