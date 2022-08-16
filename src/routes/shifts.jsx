import {useContext} from "react";

import UserContext from '../context/UserContext';
import {WithRole} from "../hoc/WithRole";
import ShiftsAgent from "../components/shifts-agent/ShiftsAgent";
import ShiftsWorker from "../components/shifts-worker/ShiftsWorker";

export default function Shifts() {
    const user = useContext(UserContext);

    const ShiftsWithRole = WithRole(user.role, {
        ComponentForAgent: ShiftsAgent,
        ComponentForWorker: ShiftsWorker
    });

    return <ShiftsWithRole />;
}