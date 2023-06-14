import './App.css';
import {Route, Routes} from 'react-router-dom'
import Main from "./components/Main/Main";
import Profile from "./components/Profile/Profile";
import VideoPage from "./components/VideoPage/VideoPage";
import Login from "./components/Enter/Login";
import Register from "./components/Enter/Register";
import UserPage from "./components/UserPage/UserPage";

function App() {
  return (
    <div className="App">
      <Routes>
          <Route path='/' element={<Main/>}/>
          <Route path='/profile' element={<Profile/>}/>
          <Route path={'/video/:id'} element={<VideoPage/>}/>
          <Route path={'/login'} element={<Login/>}/>
          <Route path={'/register'} element={<Register/>}/>
          <Route path={'/user/:id'} element={<UserPage/>}/>
      </Routes>
    </div>
  );
}

export default App;
