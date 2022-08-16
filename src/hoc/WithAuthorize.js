export const WithAuthorize = (
    isAuthorized,
    {ComponentForAuthorized, ComponentForUnauthorized}
) => {
    const WrappedComponentWithAuthorization = (props) => {
        if (isAuthorized === true) {
            return <ComponentForAuthorized {...props} />;
        }
        if (isAuthorized === false) {
            return <ComponentForUnauthorized {...props} />;
        }

        return <></>;
    };

    return WrappedComponentWithAuthorization;
};