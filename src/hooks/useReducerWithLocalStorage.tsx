import { useEffect, useReducer } from 'react';
import useLocalStorage from './useLocalStorage';

function useReducerWithLocalStorage(
  key: string,
  reducer: (state: any, update: any) => any,
  initialValue: any
) {
  const [localStorageState, setLocalStorageState] = useLocalStorage(
    key,
    initialValue
  );

  const [state, dispatch] = useReducer(
    reducer,
    { ...localStorageState }
  );

  useEffect(() => {
    setLocalStorageState(state);
  }, [state])

  return [state, dispatch];
}

export default useReducerWithLocalStorage;