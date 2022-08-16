import style from "./Notification.module.css";

const Notification = ({buttons, payload}) => {
    const {title, text, link, senderPhone, createdAt} = payload;

    return (
        <div className={style.notification}>
            <span className={style.title}>{senderPhone} | {title}</span>
            <div className={style.text}>{text}</div>
            <div className={style.bottom}>
                <div className={style.text2}>{link}</div>
                <div className={style.text}>{createdAt}</div>
            </div>

            <div className="form-buttons">
                {buttons?.map((button, i) => <button key={i} className={button.style} onClick={button.action}>
                    {button.name}</button>)}
            </div>
        </div>
    );
};

export default Notification;