import {collection, query, where, getFirestore, getDocs, doc, getDoc} from "firebase/firestore";
import {useEffect, useState} from "react";
import {getAuth} from "firebase/auth";
import {Link} from "react-router-dom";

const WorksWorker = () => {
    const [listItems, setListItems] = useState([]);
    const db = getFirestore();
    const auth = getAuth();

    useEffect(() => {
        const jobInvitationsRef = collection(db, "jobInvitations");
        const q = query(jobInvitationsRef,
            where("workerId", "==", auth.currentUser.uid),
            where('status', '==', 'confirmed'));
        getDocs(q).then(async querySnapshot => {
            const workIds = [];
            querySnapshot.forEach((doc) => {
                workIds.push(doc.data().workId);
            });

            const works = [];

            for (const workId of workIds) {
                const docRef = doc(db, "works", workId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    works.push(<li key={docSnap.id}>
                        <Link to={'/works/'+docSnap.id}>{docSnap.data().title}</Link>
                    </li>);
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            }

            setListItems(works);
        });
    }, []);

    return (
        <div>
            <h2>Мои работы</h2>
            <ul className="list-links">{listItems}</ul>
        </div>
    );
};

export default WorksWorker;