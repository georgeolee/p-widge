import { useEffect, useRef } from "react";

export function FileInput(props){

    const label = props.label ?? 'File Input';
    const accept = props.accept ?? '.png';
    const func = props.func ?? (url => console.log(`url: ${url}`));
    

    const onChange = e => {
        if(!e.target.files[0]) return;
        const url = URL.createObjectURL(e.target.files[0]);
        func(url)
    }

    return(
        <div className="file-input">
            <div className="file-input-label">{label}</div>
            <input type="file" accept={accept} className='file-input-button' onChange={onChange}/>
        </div>
    );
}