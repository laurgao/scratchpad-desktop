import { Dispatch, SetStateAction } from "react";

type InputProps = React.HTMLProps<HTMLInputElement>
    & { setValue?: Dispatch<SetStateAction<string>>, type?: "text" | "textarea" | "date", noMargin?: boolean };

const Input = (props: InputProps) => {
    const newProps = { ...props }
    delete newProps.setValue
    delete newProps.className
    delete newProps.type
    delete newProps.noMargin
    const setValue = props.setValue || (() => { });
    return (
        <div className={props.className}>
            {props.type !== "textarea" ? (
                <input
                    {...newProps}
                    type={props.type}
                    className={`border-b w-full bg-transparent focus-visible:outline-blue-300 focus-visible:outline-2 ${props.noMargin ? "" : "my-2 py-2"}`}
                    onChange={props.onChange ? props.onChange : e => setValue(e.target.value)}
                />
            ) : (
                <textarea
                    {...newProps}
                    className={`border-b w-full text-gray-500 bg-transparent focus-visible:outline-blue-300 focus-visible:outline-2  ${props.noMargin ? "" : "my-2 py-2"}`}
                    rows={7}
                    // @ts-ignore
                    onChange={props.onChange ? props.onChange : e => props.setValue(e.target.value)}
                />
            )}
        </div>
    )
}

export default Input