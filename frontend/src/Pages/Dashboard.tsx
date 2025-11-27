import {useState, type ChangeEvent} from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../features/store';

import { useDispatch } from "react-redux";
import type { AppDispatch } from "../features/store";
import { setPosts } from '../features/postsSlice';

import '../App.css';
import Spinner from '../components/Spinner';

const Homepage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const me = useSelector((state:RootState)=> state.user.user);
  console.log(me);
  
  const posts = useSelector((state:RootState)=> state.posts.posts);

  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [isPost, setIsPost] = useState<boolean>(false);

  const handleImageChange = (e:ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    if(images.length  + newFiles.length > 3){
      alert('max images size must be 3');
      return;
    }
    setImages((prevImages) => [...prevImages, ...newFiles]);
  };

  const handleUpload = async () => {
    if (images.length === 0 || !description) {
      alert('Please add description and at least one image.');
      return;
    }

    const formData = new FormData();
    formData.append('userId', me?._id ?? '');
    formData.append('userName', me?.username ?? '');
    formData.append('userImage',me?.image ?? '');
    formData.append('description', description);

    images.forEach((image) => {
      formData.append('images', image);
    });

    try{
      const res = await axios.post('https://soclix.onrender.com/uploadPost',formData,{
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      console.log(res.data)
      if(res.data.status === 200){
        console.log('successfully uploaded post');
        dispatch(setPosts(res.data.data))
        setIsPost(false);
      }
    }catch(err){
      console.log(err)
    } 
  };

  const handleLike = async(_id:string, username:string, isLike:boolean)=>{
    try{
      const res = await axios.post('https://soclix.onrender.com/likePost',{
      id:_id,
      username,
      isLike
    })
    dispatch(setPosts(res.data.data));
    }catch(err){
      console.log(err);
    }
  }

  return (
    (me)?
      <section className='main_section'>
        <div className={isPost?'hide':'show'}>
          <h2>Let's create a post</h2>
          <button onClick={()=>{setIsPost(true)}}>Post Now</button>
        </div>

        <div className={isPost?'section_control':'hide'}>
          <h2>Let's create a post</h2>

          <textarea
            className='post_textarea'
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            style={{ width: '100%', marginBottom: '1rem' }}
          />

          <div className="custom_file">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                style={{ marginBottom: '1rem' }}
                id='postId'
              />
              <label htmlFor='postId'>
                <img src="../upload.png"/>
              </label>
          </div>

          <div className='uploadImage_show'>
            {images.map((image, index) => (
              <img
                key={index}
                src={URL.createObjectURL(image)}
                alt={`Preview ${index}`}
                className='uploadImage_img'
                id='postId'
              />
              
            ))}
          </div>
          <button onClick={handleUpload}>Post</button>
        </div>
            
        {
          (posts.length === 0) ? <Spinner /> : 
          <div className='post_main'>
            {posts.map((elem)=>{
              return(
                <div key={elem?._id as React.Key} className='post_div'>
                    <div className='post_header'>
                      {elem?.userImage && (
                        <img
                          src={elem.userImage} 
                          className="users_img" 
                          referrerPolicy="no-referrer" 
                          alt={`${elem.userName} image`}
                        />
                      )}
                      <p className='user_name'>{elem.userName}</p>
                    </div>
                    <p className='post_description'>{elem?.description}</p>
                    <div className='postImages_main'>
                    {
                      elem?.images?.map((ele)=>{
                        return(
                            <img 
                              src={ele} 
                              className="post_images" 
                              referrerPolicy="no-referrer"
                              alt='post images'/>
                        )
                      })
                    }
                    </div>
                    <div className='bottom_contents'>
                      <div>
                        <img className={me?.username && elem.likedBy.includes(me?.username)?'fill':''} 
                          src='love.png' onClick={()=>{
                            if(!me?.username) return;
                            const alreadyLiked = elem.likedBy.includes(me?.username);
                            handleLike(elem._id, me?.username, alreadyLiked)}}/>
                        <p>{elem.likes}</p>
                      </div>
                      <div>
                        <img src='comment.png'/>
                      </div>
                      <div>
                        <img src='share.png'/>
                      </div>
                    </div>
                </div>
              )
            })}
        </div>
        }
      </section>

    : ''
  );
};

export default Homepage;