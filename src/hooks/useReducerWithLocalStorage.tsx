import { useEffect, useReducer } from 'react';
import useLocalStorage from './useLocalStorage';

function useReducerWithLocalStorage(
  key: string,
  reducer: (state: any, update: any) => any,
  initialValue: any,
  prepare?: { onsave: (state: any) => any, onload: (data: any) => any }
) {
  const [localStorageState, setLocalStorageState] = useLocalStorage(
    key,
    initialValue,
    prepare
  );

  const [state, dispatch] = useReducer(
    reducer,
    { ...localStorageState }
  );

  useEffect(() => {
    setLocalStorageState(state);
  }, [state, setLocalStorageState])

  return [state, dispatch];
}

export default useReducerWithLocalStorage;