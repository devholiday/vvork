import {doc, setDoc, getFirestore} from "firebase/firestore";

const LoginCode = () => {
    function getCodeFromUserInput() {
        return document.querySelector('.login-code').value;
    }

    const confirmCode = () => {
        const code = getCodeFromUserInput();

        window.confirmationResult.confirm(code).then(async (result) => {
            const user = result.user;

            const db = getFirestore();
            await setDoc(doc(db, "users", user.uid),
                {id: user.uid, phoneNumber: user.phoneNumber});
        }).catch((error) => {
            // User couldn't sign in (bad verification code?)
        });
    };

    return (
        <form method='post'>
            <div className="form-block">
                <input type='input' className='login-code' placeholder="Код подтверждения" />
            </div>
            <button type='button' onClick={confirmCode}>Подтвердить код</button>
        </form>
    );
};

export default LoginCode;