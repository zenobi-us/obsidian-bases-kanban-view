import classNames from "classnames";
import React from "react";
import styles from "./FilterButtonFIeld.module.css";

export function FilterButtonField(props: {
    onFilterChange?: (filter: string) => void;
}) {
    const [isFiltering, setIsFiltering] = React.useState(false);
    const [filter, setFilter] = React.useState("");

    const onFilterChangeDebounced = useDebounce((newFilter: string) => {
        props.onFilterChange?.(newFilter);
    }, 300);

    return (
        <div className={classNames(styles.filterbuttonfield, "filterbuttonfield")} data-testid="column-filter-button">
            {isFiltering && (
                <span>
                <input
                    type="text"
                    className={classNames(styles.filterbuttonfield_input, "filterbuttonfield_input")}
                    placeholder="Filter cards..."
                    autoFocus
                    value={filter}
                    onChange={(e) => {
                        setFilter(e.target.value);
                        onFilterChangeDebounced(e.target.value);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            setIsFiltering(false);
                            return
                        }

                        if (e.key === "Enter") {
                            e.currentTarget.blur();
                        }
                    }}
                    onBlur={() => setIsFiltering(false)}
                />
                <button onClick={() => {
                    setIsFiltering(false);
                    setFilter("");
                    props.onFilterChange?.("");
                }}>x</button>
                </span>
            )}
            {!isFiltering && (
                <button 
                    data-testid="column-filter-icon"
                    className={classNames(
                        styles.filterbuttonfield_button,
                        "filterbuttonfield_button"
                    )}
                    onClick={() => setIsFiltering(true)}
                >
                    🔍
                    {filter && (
                        <span
                            data-testid="column-filter-dot"
                            className={classNames(
                                styles.filterbuttonfield_indicator,
                                "filterbuttonfield_indicator"
                            )}
                        >•</span>
                    )}
                </button>
            )}
        </div>
    )
}

/**
 * A hook that takes a callback,
 * it usesa generic param which becomes the inferred type of the func args 
 * 
 * tis hook makes no assumptions about the function itself so it needs
 * to use the generic to infer the types
 **/
function useDebounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
    const timeoutRef = React.useRef<number | null>(null);

    const debouncedFunction = React.useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
            func(...args);
        }, delay);
    }, [func, delay]);
    
    return debouncedFunction as T;
}