import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Routes, Route,} from "react-router-dom";
import UtilsFirebase from "./utils/firebase";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import Works from "./routes/works";
import Notifications from "./routes/notifications";
import Shifts from "./routes/shifts";
import Account from "./routes/account";
import Login from "./routes/login";
import WorkNew from "./routes/work-new";
import WorkEdit from "./routes/work-edit";
import WorkDetail from "./routes/work-detail";
import WorkWorkerNew from "./routes/work-worker-new";
import WorkWorkerEdit from "./routes/work-worker-edit";
import ShiftsWorkerWOAgent from "./components/shifts-worker-wo-agent/ShiftsWorkerWOAgent";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />}>
                <Route index element={<Notifications />} />
                <Route path="works" element={<Works />} />
                <Route path="works/new" element={<WorkNew />} />
                <Route path="works/edit/:workId" element={<WorkEdit />} />
                <Route path="works/:workId" element={<WorkDetail />} />
                <Route path="works/worker/new" element={<WorkWorkerNew />} />
                <Route path="works/worker/edit/:workId" element={<WorkWorkerEdit />} />
                <Route path="shifts" element={<Shifts />} />
                <Route path="shifts/worker" element={<ShiftsWorkerWOAgent />} />
                <Route path="account" element={<Account />} />
            </Route>

            <Route path="login" element={<Login />} />
        </Routes>
    </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
