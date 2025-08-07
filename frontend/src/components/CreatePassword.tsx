import { useState } from "react";

const CreatePasswprd = ()=>{
    const [pass, setPass] = useState<String|null>(null);
    const [cpass, setCpass] = useState<String|null>(null);
    const inpChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
        const {name, value} = e.target;
        if(name === 'pass'){
            setPass(value)
        }else if(name === 'c_pass'){
            setCpass(value)
        }
    }
    const formSubmit = (e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        if(pass === cpass){
            console.log('matched confirmed');
        }else{
            console.log('password not match');
        }
    }

    return (
        <div className="createPass_container">
           <form onSubmit={formSubmit}>
                <div>
                    <label htmlFor="pass">Password</label>
                    <input id="pass" name="pass" onChange={inpChange} placeholder="enter new password"/>
                </div>
                <div>
                    <label htmlFor="c_pass">Confirm Password</label>
                    <input id="c_pass" name="c_pass" onChange={inpChange} placeholder="enter confirm password"/>
                </div>
                <button type="submit">Set Password</button>
           </form>
        </div>
    );
}

export default CreatePasswprd;