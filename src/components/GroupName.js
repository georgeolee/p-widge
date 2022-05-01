import { HR } from "./HR";
export function GroupName(props){
    const{label = 'Group Name'} = props;
    return(
        <div className="group-name">
            <HR/>
            <div className='group-name-label'>{label}</div>
            <HR/>
        </div>
    )
}