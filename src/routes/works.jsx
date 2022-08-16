import {useContext} from "react";

import UserContext from '../context/UserContext';
import WorksAgent from "../components/works-agent/WorksAgent";
import WorksWorker from "../components/works-worker/WorksWorker";
import {WithRole} from "../hoc/WithRole";

export default function Works() {
    const user = useContext(UserContext);

    const WorksWithRole = WithRole(user.role, {
        ComponentForAgent: WorksAgent,
        ComponentForWorker: WorksWorker
    });

    return <WorksWithRole />;
}