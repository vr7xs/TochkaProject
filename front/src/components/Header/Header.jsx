import styles from './Header.module.css';
import {useNavigate} from "react-router-dom";
import {ReactComponent as LogoutSVG} from "../../images/logout.svg";
import getBody from "../body";
import axios from "axios";
import {useState} from "react";

const url = process.env.REACT_APP_API_URL;

const Header = () => {
    const navigate = useNavigate();
    const [logoutBtn, setLogoutBtn] = useState('Выйти');
    const Logout = (event) => {
        event.preventDefault();
        const body = getBody('logout');
        axios.post(`${url}/api/v1/auth`, body, {withCredentials: true})
            .then((response) => {
                const data = response.data;
                if ('error' in data){
                    return;
                }
                if (window.location.pathname === '/profile'){
                    navigate('/');
                }
                setLogoutBtn('Выход выполнен');
                setTimeout(() => setLogoutBtn('Выйти'), 1000);
            })
    }

    return (
        <div className={styles.header}>
            <a className={styles.header__link} onClick={() => navigate('/')}>Главная страница</a>
            <div className={styles.container__links}>
                <a className={styles.header__link} onClick={() => navigate('/profile')}>Профиль</a>
                <a className={styles.header__link} onClick={() => navigate('/login')}>Войти</a>
                <a className={styles.header__link} onClick={() => navigate('/register')}>Регистрация</a>
                <div className={styles.header__link} onClick={Logout}><LogoutSVG/></div>
            </div>
        </div>
    )
}

export default Header;