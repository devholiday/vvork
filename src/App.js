import './App.css';

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

import {useEffect, useState} from "react";
import {Outlet, Link, useNavigate, NavLink} from "react-router-dom";

import UserContext from './context/UserContext';

function App() {
    const [user, setUser] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        const db = getFirestore();

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                let role = 'worker';

                const docRef = doc(db, "agents", user.phoneNumber);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const {enabled} = docSnap.data();
                    if (enabled) role = 'agent';
                }

                setUser({
                    id: user.uid,
                    role,
                    isAuth: true,
                    phone: user.phoneNumber
                });
            } else {
                navigate(`/login`);
            }
        });
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <Link to={'/'} className='logo'>vvork</Link>
                {user?.isAuth && <span className="greeting">{user?.phone}</span>}
            </header>
            {user && (
              <>
                  <div className="links">
                      <ul>
                          <li>
                              <NavLink style={({ isActive }) => {
                                  return {
                                      color: isActive ? "#333333" : "",
                                      borderBottom: isActive ? "none" : "1px solid blue",
                                  };
                              }} to="/">Уведомления</NavLink>
                          </li>
                          <li>
                              <NavLink style={({ isActive }) => {
                                  return {
                                      color: isActive ? "#333333" : "",
                                      borderBottom: isActive ? "none" : "1px solid blue",
                                  };
                              }} to="/works">Работы</NavLink>
                          </li>
                          <li>
                              <NavLink style={({ isActive }) => {
                                  return {
                                      color: isActive ? "#333333" : "",
                                      borderBottom: isActive ? "none" : "1px solid blue",
                                  };
                              }} to="/shifts/worker">Смены</NavLink>
                          </li>
                          <li>
                              <NavLink style={({ isActive }) => {
                                  return {
                                      color: isActive ? "#333333" : "",
                                      borderBottom: isActive ? "none" : "1px solid blue",
                                  };
                              }} to="/account">Аккаунт</NavLink>
                          </li>
                      </ul>
                  </div>
                  <div className="content">
                      <UserContext.Provider value={user}>
                          <Outlet/>
                      </UserContext.Provider>
                  </div>
              </>
            )}
        </div>
    );
}

export default App;
