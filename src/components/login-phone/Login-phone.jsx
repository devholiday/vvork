import {useEffect} from "react";
import {getAuth, RecaptchaVerifier, signInWithPhoneNumber} from "firebase/auth";

const LoginPhone = ({setStep}) => {
    useEffect(() => {
        const auth = getAuth();
        auth.languageCode = 'ru';

        window.recaptchaVerifier = new RecaptchaVerifier('sign-in-button', {
            'size': 'invisible',
            'callback': (response) => {
                onSignInSubmit();
            }
        }, auth);
        window.recaptchaVerifier.render().then((widgetId) => {
            window.recaptchaWidgetId = widgetId;
        });

        function onSignInSubmit() {
            const phoneNumber = getPhoneNumberFromUserInput();
            if (!phoneNumber) {
                return;
            }
            const appVerifier = window.recaptchaVerifier;

            signInWithPhoneNumber(auth, phoneNumber, appVerifier)
                .then((confirmationResult) => {
                    // SMS sent. Prompt user to type the code from the message, then sign the
                    // user in with confirmationResult.confirm(code).
                    window.confirmationResult = confirmationResult;
                    setStep(2);
                }).catch((error) => {
                // Error; SMS not sent
            });
        }

        function getPhoneNumberFromUserInput() {
            let phone = document.querySelector('.login-phone').value;
            phone = '+972' + phone.match(/\d/g).join('');
            return phone;
        }
    }, []);
  return (
      <form method='post'>
          <div className="form-block">
              <label>Номер телефона</label>
              <div className="input-box">
                  <span className="prefix">+972</span>
                  <input type="tel" className="login-phone" />
              </div>
          </div>
          <button id='sign-in-button'>Войти</button>
      </form>
  )
};

export default LoginPhone;