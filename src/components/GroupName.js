export function GroupName(props){
    const{label = 'Group Name'} = props;
    return(
        <div className="group-name">            
            <div className="group-name-label">
            {label}
            </div>
        </div>
    )
}