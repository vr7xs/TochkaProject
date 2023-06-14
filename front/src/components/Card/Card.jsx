import styles from './Card.module.css';
import {useNavigate} from "react-router-dom";
import getBody from "../body";
import axios from "axios";
import {ReactComponent as Trash} from "../../images/trash.svg";

const url = process.env.REACT_APP_API_URL;

const Card = ({id, preview, username, name, isProfile}) => {
    const navigate = useNavigate();
    const deleteVideo = (event) => {
        event.stopPropagation();
        const body = getBody('delete_video', {video_id: id});
        axios.post(`${url}/api/v1/video`, body, {withCredentials: true})
            .then(response => {
                const data = response.data;
                if ('error' in data)
                    throw new Error();
                if (data.result.status === 'deleted'){
                    window.location.reload();
                }
            })
    };

    return (
        <div id={id} className={styles.card} onClick={() => navigate(`/video/${id}`)}>
            <img className={styles.preview} src={preview} alt={preview}/>
            <div className={styles.info}>
                <div>
                    <h3 className={styles.name}>{name}</h3>
                    <p className={styles.owner}>{username}</p>
                </div>
                {isProfile ? <div onClick={deleteVideo} className={styles.trashcan}><Trash/></div> : null}
            </div>
        </div>
    )
};

export default Card


