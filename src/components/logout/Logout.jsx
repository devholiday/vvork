import {getAuth, signOut} from "firebase/auth";

const Logout = () => {
    const logout = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            // Sign-out successful.
        }).catch((error) => {
            // An error happened.
        });
    };

    return (
        <button className="btn-secondary" type="button" onClick={logout}>Выход</button>
    );
};

export default Logout;