import styles from './UserPage.module.css';
import Header from "../Header/Header";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import getBody from "../body";
import axios from "axios";
import Card from "../Card/Card";

const url = process.env.REACT_APP_API_URL;

const UserPage = () => {
    const [user, setUser] = useState({});
    const [videos, setVideos] = useState([]);

    const {id} = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const body = getBody('get_user_page', {user_id: id});
        axios.post(`${url}/api/v1/video`, body, {withCredentials: true})
            .then(response => {
                const data = response.data;
                if ('error' in data){
                    navigate('/');
                }
                setUser(data.result.user);
                setVideos(data.result.videos);
            })
    }, [])

    return (
        <div>
            <Header/>
            <div className={styles.main}>
                <h3 className={styles.header}>Страница пользователя {user.username}</h3>
                <div className={styles.videos}>
                    {videos.map(video => <Card id={video.id} username={user.username} name={video.name} preview={video.preview}/>)}
                </div>
            </div>
        </div>
    )
}

export default UserPage;