export function GroupName(props){
    const{label = 'Group Name'} = props;
    return(
        <div className="group-name">
            {label}
        </div>
    )
}