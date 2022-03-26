// Props can be anything in React.HTMLProps<HTMLAnchorElement> except for className, which will be overwritten
const A = (props: React.HTMLProps<HTMLAnchorElement>) => <a {...props} className="underline hover:text-blue-400 transition" />

export default A