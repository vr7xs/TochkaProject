import styles from './Main.module.css'
import Header from "../Header/Header";
import Card from "../Card/Card";
import {useEffect, useState} from "react";
import getBody from "../body";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const Main = () => {

    const [videos, setVideos] = useState([]);

    useEffect(() => {
        const body = getBody('get_videos_for_main_page');
        axios.post(`${url}/api/v1/video`, body, {withCredentials: true})
            .then((response) => {
                const data = response.data;
                setVideos(data.result);
            })
    }, []);

    return (
        <div>
            <Header/>
            <div className={styles.main}>
                {videos.map(video => <Card id={video.id} username={video.user} name={video.name} preview={video.preview}/>)}
            </div>
        </div>
    )
};

export default Main
