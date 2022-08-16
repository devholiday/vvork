export const WithRole = (
    role,
    {ComponentForAgent, ComponentForWorker}
) => {
    const WrappedComponentWithRole = (props) => {
        switch (role) {
            case 'agent':
                return <ComponentForAgent {...props} />;
            case 'worker':
                return <ComponentForWorker {...props} />;
            default:
                return <></>;
        }
    };

    return WrappedComponentWithRole;
};