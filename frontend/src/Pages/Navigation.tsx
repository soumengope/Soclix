import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from "../features/store";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './navigation.css';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRoomId = /^\/chatroom\/[^/]+$/.test(location.pathname);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [expandProf, setExpandProf] = useState<boolean>(false);
  const data = useSelector((state:RootState)=>state.user.user);

  useEffect(() => {
    setLoading(false);
  }, [loading]);

  if (loading) return <p className='loading'>Checking login status...</p>;

  return (
    <section className='navbar_main'>
      <div className='navbar_left'>
        <nav className={data ? 'show_navbar' : 'blur_navbar'}>
          <div className={`hpnav_lists ${location.pathname === '/dashboard'?'active':''}`} onClick={()=>{navigate('/dashboard')} }>
            <img src="home.png"/>
          </div>
          <div className={`hpnav_lists ${location.pathname === '/sentReq'?'active':''}`} onClick={()=>{navigate('/sentReq')}}>
            <img src="add-friend.png" />
          </div>
          <div className={`hpnav_lists ${location.pathname === '/chatroom' || hasRoomId ?'active':''}`} 
            onClick={()=>{navigate('/chatroom')}}>
            <img src="chat.png" />
          </div>
          <div className={`hpnav_lists ${location.pathname === '/stories'?'active':''}`} onClick={()=>{navigate('/stories')}}>
            <img src="stories.png" />
          </div>
        </nav>
      </div>

      <div className='navbar_right'>
        {data ? (
          <div className='profile_container'>
            {data?.image && (
            <img 
            src={data.image}
            referrerPolicy="no-referrer"
            alt="image"
            className='profile_image'
            onClick={
              ()=>{setExpandProf(!expandProf)}}
            />
            )}
            <div className={expandProf?'profile_expand':'profile_hide'}>
              <p>{data.username}</p>
              <button 
              onClick={() => window.location.href = 'https://soclix.onrender.com/logout'}
              className = 'logout_btn'
              >Logout</button>
            </div>
          </div>
        ) : (
          <></>
        )}
        <br/><br/>
      </div>

    </section>
  );
};

export default Navigation;
