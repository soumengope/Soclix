import { useSelector } from 'react-redux';
import type { RootState } from "../features/store";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './homepage.css';
function Homepage() {
    const navigate = useNavigate();
    const data = useSelector((state:RootState)=>state.user.user);
    const handleGoogleLogin = () => {
        window.open('https://soclix.onrender.com/auth/google', '_self');
    };
    useEffect(()=>{
        if(!data) return;
        navigate('/dashboard');
    },[data])
    
    return (
        <div className="homepage_main">
            <div className='left_section'>
                <img className='main_image' src="soclix.png" />
            </div>
            <div className='right_section'>
                <p className='description'>Soclicx is a social media platform to connect, share, and chat with friends in one click.</p>
                <h3>Begining of a new journey</h3>
                <div className='join_here' onClick={handleGoogleLogin}>
                    <p>Let's join</p>
                    <img className='google_image' src="google.png"/>
                </div>
            </div>
        </div>
    );
}

export default Homepage;