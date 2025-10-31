export default function Logo() {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
                </radialGradient>
            </defs>
            <circle cx="12" cy="12" r="10" fill="url(#grad1)" />
            <circle cx="12" cy="12" r="11.5" stroke="hsl(var(--primary))" strokeOpacity="0.3" strokeWidth="1" />
        </svg>
    )
}
