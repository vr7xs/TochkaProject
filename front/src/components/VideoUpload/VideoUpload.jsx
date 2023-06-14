import styles from './VideoUpload.module.css';
import {ReactComponent as Cross} from "../../images/cross.svg";
import {useState} from "react";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const VideoUpload = ({active, setActive}) => {
    const [btnText, setBtnText] = useState('Загрузить видео');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [video, setVideo] = useState(null);
    const [preview, setPreview] = useState(null);
    const [msg, setMsg] = useState('');

    const sendVideo = (event) => {
        event.preventDefault();
        if (!(name && video && preview)){
            setMsg('Заполните полe с названием. Загрузите файлы');
            return;
        }
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('video', video);
        formData.append('preview', preview);
        setBtnText('Видео загружается...');
        axios.post(`${url}/api/v1/upload`, formData, {withCredentials: true})
            .then(response => {
                const data = response.data;
                if ('uploaded' === data.status){
                    setMsg('Видео загружено');
                    setTimeout(() => {
                        setActive(false);
                        setMsg('');
                        window.location.reload();
                        setBtnText('Загрузить видео');
                    }, 700);
                    return;
                }
                throw new Error();
            })
            .catch(() => {
                setMsg('Произошла ошибка при загрузке видео');
            });
    };

    return (active ?
        <div className={styles.container}>
            <form className={styles.popup} onSubmit={sendVideo}>
                <div className={styles.popup__header}>
                    <h3 className={styles.title}>Загрузить видео</h3>
                    <p className={styles.cross} onClick={() => {setActive(false);setMsg('');}}><Cross/></p>
                </div>
                {msg && <div style={{textAlign: 'center'}}>{msg}</div>}
                <div className={styles.textareas}>
                    <textarea required={true} placeholder="Введите название" onChange={e => setName(e.target.value)} className={`${styles.textarea} ${styles.textarea__name}`}/>
                    <textarea placeholder="Введите описание" onChange={e => setDescription(e.target.value)} className={`${styles.textarea} ${styles.textarea__description}`}/>
                </div>
                <div className={styles.file_inputs}>
                    <label className={styles.input_file}>
                        <input type="file" name="file[]" accept="image/*" required={true} onChange={e => setPreview(e.target.files[0])}></input>
                        <span>{'Прикрепите превью'}</span>
                    </label>
                    <label className={styles.input_file}>
                        <input className={styles.input} type="file" required={true} name="file[]" accept="video/mp4" onChange={e => setVideo(e.target.files[0])}></input>
                        <span>{'Прикрепите видео'}</span>
                    </label>
                </div>
                <div className={styles.btn__container}>
                    <button type='submit' className={styles.btn}>{btnText}</button>
                </div>

            </form>
        </div>
        : null)
};


export default VideoUpload
