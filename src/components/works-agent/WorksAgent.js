import {collection, query, where, getFirestore, getDocs} from "firebase/firestore";
import {useEffect, useState} from "react";
import {getAuth} from "firebase/auth";
import {Link} from "react-router-dom";

const WorksAgent = () => {
    const [listItems, setListItems] = useState([]);
    const db = getFirestore();
    const auth = getAuth();

    useEffect(() => {
        const worksRef = collection(db, "works");
        const q = query(worksRef, where("agentId", "==", auth.currentUser.uid), where('status', '!=', 'archived'));
        getDocs(q).then(querySnapshot => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push(<li key={doc.id}>
                    <Link to={'/works/edit/'+doc.id}>{doc.data().title}</Link>
                </li>);
            });
            setListItems(items);
        });
    }, []);

    return (
        <>
            <h2>Работы</h2>
            <Link to={'/works/new'}>Создать работу</Link>

            <ul className="list-links">{listItems}</ul>
        </>
    );
};

export default WorksAgent;