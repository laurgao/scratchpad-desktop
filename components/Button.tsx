export type ButtonProps = (React.HTMLProps<HTMLButtonElement>)
    & { isLoading?: boolean, childClassName?: string }

export default function Button(props: ButtonProps) {
    const classNames = (
        props.className
        + " p-2 relative"
        + (props.disabled ? " cursor-not-allowed " : "")
        + (props.isLoading ? " cursor-wait" : "")
    );
    const childClassNames = props.childClassName + (props.isLoading ? " invisible" : "")

    const newProps = { ...props }
    delete newProps.isLoading
    delete newProps.children
    delete newProps.childClassName

    return (
        // @ts-ignore
        <button {...newProps} className={classNames} disabled={props.disabled || props.isLoading}>
            <div className={childClassNames}>{props.children}</div>
            {props.isLoading && <div className="loading-spinner" />}
        </button>
    );
}