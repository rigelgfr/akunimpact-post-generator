import { useState, useEffect, useCallback } from 'react';

/**
 * A custom hook that creates a debounced version of a value.
 * @param value The value to be debounced
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set debouncedValue to value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes or component unmounts
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * A custom hook that creates a debounced function.
 * @param fn The function to debounce
 * @param delay The delay in milliseconds
 * @returns A debounced version of the function
 */
export function useDebounceFunction<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      const handler = setTimeout(() => {
        fn(...args);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    },
    [fn, delay]
  );

  return useCallback(
    (...args: Parameters<T>) => {
      const cleanup = debouncedFn(...args);
      return cleanup;
    },
    [debouncedFn]
  );
}