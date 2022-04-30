export function FileInput(props){

    const {
        label = 'File Input',
        accept = '.png',
        func = url => console.log(`url: ${url}`),
    } = props;
    

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