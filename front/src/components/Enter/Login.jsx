import styles from './Enter.module.css';
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import getBody from "../body";
import axios from "axios";

const url = process.env.REACT_APP_API_URL;

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [msg, setMsg] = useState('');

    const Submit = (event) => {
        event.preventDefault();
        if (!(username && password)){
            setMsg('Заполните поля!');
            return;
        }
        const body = getBody('login', {user: {username: username, password: password}});
        axios.post(`${url}/api/v1/auth`, body, {withCredentials: true})
            .then((response) => {
                const data = response.data;
                if ('authorized' === data.result.status){
                    setMsg('Вход выполнен');
                    setTimeout(() => navigate('/'), 500);
                    return;
                }
                throw new Error();
            })
            .catch(() => {
                setMsg('Произошла ошибка при входе');
            })

    };

    return (
        <div className={styles.page}>
            <h2 className={styles.head} onClick={() => navigate('/')} style={{cursor: "pointer"}}>Главная</h2>
            <div className={styles.popup}>
                <h2 className={styles.head}>Вход</h2>
                <form className={styles.container} onSubmit={Submit}>
                    {msg && <div style={{color: 'red'}}>{msg}</div>}
                    <label className={styles.label}>
                      Username:
                      <input className={styles.input} type="text" onChange={(e) => setUsername(e.target.value)} />
                    </label><br/>
                    <label className={styles.label}>
                      Password:
                      <input className={styles.input} type="password"  onChange={(e) => setPassword(e.target.value)}/>
                    </label><br/>
                    <button type={'submit'} className={styles.btn}>Войти</button>
                    <div className={styles.link} onClick={() => navigate('/register')}>Зарегистрироваться</div>
                </form>
            </div>
        </div>
    )
};

export default Login;