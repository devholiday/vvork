import {useEffect, useState} from "react";

import LoginPhone from "../components/login-phone/Login-phone";
import LoginCode from "../components/login-code/Login-code";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import {useNavigate} from "react-router-dom";

export default function Login() {
    const [step, setStep] = useState(1);

    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                navigate(`/`);
            }
        });
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <p className='logo'>vvork</p>
            </header>
            <div className="content">
                {step === 1 && <LoginPhone setStep={setStep}/>}
                {step === 2 && <LoginCode />}
            </div>
        </div>
    );
}