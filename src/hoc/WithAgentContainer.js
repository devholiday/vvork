import AgentContainerNotifications from "../components/agent-container-notifications/AgentContainerNotifications";
import AgentContainerWorks from "../components/agent-container-works/AgentContainerWorks";
import AgentContainerAccount from "../components/agent-container-account/AgentContainerAccount";
import AgentContainerShifts from "../components/agent-container-shifts/AgentContainerShifts";

export const WithAgentContainer = container => {
    const WrappedComponentWithContainer = (props) => {
        switch (container) {
            case 'notifications':
                return <AgentContainerNotifications {...props} />;
            case 'works':
                return <AgentContainerWorks {...props} />;
            case 'shifts':
                return <AgentContainerShifts {...props} />;
            case 'account':
                return <AgentContainerAccount {...props} />;
            default:
                return <></>;
        }
    }

    return WrappedComponentWithContainer;
};