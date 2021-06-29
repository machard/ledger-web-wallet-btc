import { useState } from 'react';

// credit: https://usehooks.com/useLocalStorage/
function useLocalStorage(
  key: string,
  initialValue: any,
  prepare?: { onsave: (state: any) => any, onload: (data: any) => any }
) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      const value = item ? JSON.parse(item) : initialValue;
      if (prepare?.onload) {
        return prepare.onload(value);
      }
      return value;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  function setValue(value: any) {
    try {
      const valueToStore = value;
      setStoredValue(valueToStore);
      let final = valueToStore;
      if (prepare?.onsave) {
        final = prepare.onsave(valueToStore);
      }
      window.localStorage.setItem(key, JSON.stringify(final));
    } catch (error) {
      console.log(error);
    }
  }

  return [storedValue, setValue];
}

export default useLocalStorage;
