import styles from './VideoPage.module.css';
import {Player, LoadingSpinner, ReplayControl, ForwardControl, CurrentTimeDisplay, VolumeMenuButton, ControlBar, BigPlayButton, PlayToggle
} from "video-react";
import '../../../node_modules/video-react/dist/video-react.css';
import Header from "../Header/Header";
import Card from "../Card/Card";
import {ReactComponent as Like} from "../../images/like.svg";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import getBody from "../body";
import axios from "axios";
import {ReactComponent as Trash} from "../../images/trash.svg";

const url = process.env.REACT_APP_API_URL;

const VideoPage = () => {
    const [video, setVideo] = useState({});
    const [comments, setComments] = useState([]);
    const [likes, setLikes] = useState(0);
    const [extra, setExtra] = useState([]);
    const [comment, setComment] = useState('');
    const {id} = useParams();
    const [currentUser, setCurrentUser] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        const body = getBody('get_video_by_id', {id: id});
        axios.post(`${url}/api/v1/video`, body, {withCredentials: true})
            .then(response => {
                const data = response.data;
                if ('error' in data) {
                    throw new Error();
                }
                setVideo(data.result.video);
                setComments(data.result.comments);
                setExtra(data.result.extra);
                setLikes(data.result.video.likes);
            })
            .catch(() => {
                navigate('/');
            })
    }, [id]);

    useEffect(() => {
        const body = getBody('current_user');
        axios.post(`${url}/api/v1/auth`, body, {withCredentials: true})
            .then(response => {
                const data = response.data;
                if ('error' in data){
                    setCurrentUser({});
                } else {
                    setCurrentUser(data.result);
                }
            })
    }, []);

    const uploadComment = (event) => {
        event.preventDefault();
        if (!comment){
            return;
        }
        const body = getBody('upload_comment', {text: comment, video_id: id});
        axios.post(`${url}/api/v1/video`, body, {withCredentials: true})
            .then(response => {
                const data = response.data;
                if ('error' in data)
                    return;
                if (data.result.status === 'uploaded'){
                    const newComment = data.result.comment;
                    setComments([...comments, newComment]);
                }
            })
    }

    const handleLike = () => {
        const body = getBody('like', {video_id: id});
        axios.post(`${url}/api/v1/video`, body, {withCredentials: true})
            .then(response => {
                if ('error' in response.data)
                    return;
                const data = response.data;
                const status = data.result.status;
                if (status === 'removed'){
                    if (likes === 0){
                        return;
                    }
                    setLikes(likes - 1);
                } else {
                  setLikes(likes + 1);
                }
            })
    };

    const deleteComment = (commentId) => {
        const body = getBody('delete_comment', {comment_id: commentId});
        axios.post(`${url}/api/v1/video`, body, {withCredentials: true})
            .then(response => {
                const data = response.data;
                if ('error' in data) {
                    throw new Error();
                }
                if (data.result.status === 'deleted'){
                    window.location.reload();
                }
            })
            .catch()
    };

    return (
        <div>
            <Header/>
            <div className={styles.main}>
                <div className={styles.left}>
                    <div>
                        <Player src={video.videoUrl} poster={video.preview} fluid={false} height={600} width={"100%"}>
                            <BigPlayButton position="center"/>
                            <ControlBar autoHide={true}>
                                <PlayToggle/>
                                <LoadingSpinner/>
                                <ReplayControl seconds={10} order={1.1}/>
                                <ForwardControl seconds={10} order={1.2}/>
                                <CurrentTimeDisplay order={1.3}/>
                                <VolumeMenuButton horizontal/>
                            </ControlBar>
                    </Player>
                    </div>
                    <div className={styles.video_info__outer}>
                        <div className={styles.video_info}>
                            <h2 className={styles.username} onClick={() => navigate(`/user/${video.user_id}`)}>{video.user}</h2>
                            <p className={styles.video_name}>{video.name}</p>
                            <p className={styles.video_description}>Описание: {video.description}</p>
                            <p className={styles.video_description}>Просмотров: {video.views}</p>
                        </div>
                        <div className={styles.like} onClick={handleLike}><Like/><p className={styles.amount}>{likes}</p></div>
                    </div>
                    <div className={styles.comment_block}>
                        <h3>Комментарии</h3>
                        <form className={styles.comment_form} onSubmit={uploadComment}>
                            <h4 className={styles.comment_form__header}>Загрузить комментарий</h4>
                            <textarea className={styles.comment_textarea} placeholder={'Введите комментарий'} onChange={(e) => setComment(e.target.value)}></textarea>
                            <button type={'submit'} className={styles.upload_comment_btn}>Опубликовать</button>
                        </form>
                        {
                            comments.map(comment => (
                                <div id={comment.id} className={styles.comment}>
                                    <div>
                                        <p className={styles.user}>{comment.user}</p>
                                        <p className={styles.comment_text}>{comment.text}</p>
                                    </div>
                                    <div className={styles.right__container}>
                                        {currentUser.username === comment.user ? <p className={styles.trash} onClick={() => deleteComment(comment.id)}><Trash/></p>: null}
                                        <p>{comment.created_at}</p>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className={styles.right}>
                    { extra.map(video => <Card id={video.id} name={video.name} preview={video.preview} username={video.user}/>)}
                </div>
            </div>

        </div>
    )
}


export default VideoPage;
