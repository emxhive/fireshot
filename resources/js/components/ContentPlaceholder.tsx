export function ContentPlaceholder() {
    return (
        <div className="relative h-full overflow-hidden rounded bg-gray-50 dark:bg-dark-tremor-background-subtle">
            <svg
                className="absolute inset-0 h-full w-full stroke-gray-200 dark:stroke-gray-700"
                fill="none"
            >
                <defs>
                    <pattern
                        id="pattern-1"
                        x="0"
                        y="0"
                        width="10"
                        height="10"
                        patternUnits="userSpaceOnUse"
                    >
                        <path d="M-3 13 15-5M-5 5l18-18M-1 21 17 3"></path>
                    </pattern>
                </defs>
                <rect
                    stroke="none"
                    fill="url(#pattern-1)"
                    width="100%"
                    height="100%"
                ></rect>
            </svg>
        </div>
    );
}
