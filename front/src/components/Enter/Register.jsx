import styles from "./Enter.module.css";
import {useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import getBody from "../body";

const url = process.env.REACT_APP_API_URL;

const Register = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [msg, setMsg] = useState('');

    const validateEmail = (email) => {
        const emailRegex = /^\S+@\S+\.\S+$/;
        return emailRegex.test(email);
    };

    const Submit = (event) => {
        event.preventDefault();
        if (!(email && username && password)){
            setMsg('Заполните поля');
            return;
        }
        if (!validateEmail(email)){
            setMsg('Неверный формат почты');
            return;
        }
        if (username.length < 8){
            setMsg('Имя пользователя состоит минимум из 8 символов');
            return;
        }
        if (password.length < 8){
            setMsg('Пароль состоит минимум из 8 символов');
            return;
        }
        const body = getBody('register', {user_info: {username: username, email: email, password: password}});
        axios.post(`${url}/api/v1/auth`, body, {withCredentials: true})
            .then(response => {
                const data = response.data;
                if ('created' === data.result.status){
                    setMsg('Аккаунт создан');
                    setTimeout(() => navigate('/'), 500);
                    return;
                }
                throw new Error();
            })
            .catch(() => {
                setMsg('Ошибка при создании пользователя');
            })
    }

    return (
        <div className={styles.page}>
            <h2 className={styles.head} onClick={() => navigate('/')} style={{cursor: "pointer"}}>Главная</h2>
            <div className={styles.popup}>
                <h2 className={styles.head}>Регистрация</h2>
                <form className={styles.container} onSubmit={Submit}>
                    {msg && <div style={{color: 'red'}}>{msg}</div>}
                    <label className={styles.label}>
                      Email:
                      <input className={styles.input} type="text" onChange={(e) => setEmail(e.target.value)}/>
                    </label><br/>
                    <label className={styles.label}>
                      Username:
                      <input className={styles.input} type="text" onChange={(e) => setUsername(e.target.value)} />
                    </label><br/>
                    <label className={styles.label}>
                      Password:
                      <input className={styles.input} type="password" onChange={(e) => setPassword(e.target.value)} />
                    </label><br/>
                    <button type={'submit'} className={styles.btn}>Создать аккаунт</button>
                    <div className={styles.link} onClick={() => navigate('/login')}>Или войдите в аккаунт</div>
                </form>
            </div>
        </div>
    )
};

export default Register