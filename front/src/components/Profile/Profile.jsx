import Header from "../Header/Header";
import styles from './Profile.module.css';
import VideoUpload from "../VideoUpload/VideoUpload";
import {useEffect, useState} from "react";
import getBody from "../body";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import Card from "../Card/Card";

const url = process.env.REACT_APP_API_URL;

const Profile = () => {
    const [modalActive, setModalActive] = useState(false);
    const [user, setUser] = useState({});
    const [userVideos, setUserVideos] = useState([]);
    const [viewedVideos, setViewedVideos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const body = getBody('get_user_info');
        axios.post(`${url}/api/v1/video`, body, {withCredentials: true})
            .then(response => {
                const data = response.data;
                if ('error' in data){
                    throw new Error();
                }
                else {
                    setUserVideos(data.result.videos);
                    setUser(data.result.user);
                    setViewedVideos(data.result.views);
                }
            })
            .catch(() => {
                navigate('/');
            });

    }, []);

    return (
        <div className={styles.profile_container}>
            <Header/>
            <div className={styles.main}>
                <div className={styles.profile_header}>
                    <div className={styles.user__info}>
                        <p>Username: {user.username}</p>
                        <p>Email: {user.email}</p>
                    </div>
                    <p className={styles.btn__upload_video} onClick={() => setModalActive(true)}>Загрузить видео</p>
                </div>
                <p>Мои видео</p>
                <div className={styles.video__container}>
                    {userVideos.map((video) => <Card id={video.id} preview={video.preview} name={video.name} username={user.username} isProfile={true}/>)}
                </div>
                <p>Просмотренные видео</p>
                <div className={styles.video__container}>
                    {viewedVideos.map((video) => <Card id={video.id} preview={video.preview} name={video.name} username={video.user}/>)}
                </div>
            </div>
            <VideoUpload active={modalActive} setActive={setModalActive}/>
        </div>
    )
}

export default Profile
