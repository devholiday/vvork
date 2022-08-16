import WorkerContainerNotifications from "../components/worker-container-notifications/WorkerContainerNotifications";
import WorkerContainerWorks from "../components/worker-container-works/WorkerContainerWorks";
import WorkerContainerAccount from "../components/worker-container-account/WorkerContainerAccount";
import WorkerContainerShifts from "../components/worker-container-shifts/WorkerContainerShifts";

export const WithWorkerContainer = container => {
    const WrappedComponentWithContainer = (props) => {
        switch (container) {
            case 'notifications':
                return <WorkerContainerNotifications {...props} />;
            case 'works':
                return <WorkerContainerWorks {...props} />;
            case 'shifts':
                return <WorkerContainerShifts {...props} />;
            case 'account':
                return <WorkerContainerAccount {...props} />;
            default:
                return <></>;
        }
    }

    return WrappedComponentWithContainer;
};