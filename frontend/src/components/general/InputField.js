export default function InputField(props) {
    return (
        <div className="mb-3">
            <input
                type={props.type}
                name={props.name}
                className="form-control"
                id={props.id}
                placeholder={props.placeholder}
                onChange={props.onChange}
                value={props.value}
                required={props.required ? props.required : false}
            />
        </div>
    );
}
