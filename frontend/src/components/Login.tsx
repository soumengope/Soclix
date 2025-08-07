import { useState } from "react";

const Login = ()=>{
    const [email, setEmail] = useState<String|null>(null);
    const [pass, setPass] = useState<String|null>(null);
    const inpChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
        const {name, value} = e.target;
        if(name==='email'){
            setEmail(value)
        }else if(name==='pass'){
            setPass(value)
        }
    }
    const formSubmit = (e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        console.log(email, pass);
    }
    
    return (
        <div className="login_container">
           <form onSubmit={formSubmit}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" onChange={inpChange} placeholder="enter email"/>
                </div>
                <div>
                    <label htmlFor="pass">Password</label>
                    <input id="pass" name="pass" onChange={inpChange} placeholder="enter password"/>
                </div>
                <button type="submit">Login</button>
           </form>

           <button>Login using google</button>
        </div>
    );
}

export default Login;