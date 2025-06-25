import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import classes from "./InputField.module.css";
export default function InputField(props) {
    return (
        <div className={classes["input-box"]}>
            <input
                type={props.type}
                name={props.name}
                id={props.id}
                placeholder={props.placeholder}
                onChange={props.onChange}
                value={props.value}
                required={props.required ? props.required : false}
            />
            {props.icon === "FaUser" ? (
                <FaUser className={classes.icon}></FaUser>
            ) : null}
            {props.icon === "FaLock" ? (
                <FaLock className={classes.icon}></FaLock>
            ) : null}
        </div>
    );
}
