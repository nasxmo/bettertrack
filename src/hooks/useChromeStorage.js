// src/hooks/useChromeStorage.js
import { useState, useEffect, useCallback } from "react";

const useChromeStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        console.error(
          `Error getting ${key} from storage:`,
          chrome.runtime.lastError
        );
        setStoredValue(initialValue);
      } else {
        setStoredValue(result[key] === undefined ? initialValue : result[key]);
      }
    });

    const handleChange = (changes, areaName) => {
      if (areaName === "local" && changes[key]) {
        setStoredValue(
          changes[key].newValue === undefined
            ? initialValue
            : changes[key].newValue
        );
      }
    };

    chrome.storage.onChanged.addListener(handleChange);

    // Cleanup listener on unmount
    return () => {
      chrome.storage.onChanged.removeListener(handleChange);
    };
  }, [key, initialValue]); // Rerun effect if key or initialValue changes

  const setValue = useCallback(
    (value) => {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      chrome.storage.local.set({ [key]: valueToStore }, () => {
        if (chrome.runtime.lastError) {
          console.error(
            `Error setting ${key} in storage:`,
            chrome.runtime.lastError
          );
        } else {
          // The listener above will update the state, no need to setStoredValue here
          // setStoredValue(valueToStore); // Avoid potential race conditions
        }
      });
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
};

export default useChromeStorage;
