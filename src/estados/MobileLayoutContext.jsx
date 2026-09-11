import { createContext, useCallback, useContext, useRef, useState } from 'react';

const MobileLayoutContext = createContext(null);

export function MobileLayoutProvider({ children }) {
  const createHandlerRef = useRef(null);
  const [canCreate, setCanCreate] = useState(false);

  const registerCreateHandler = useCallback((handler) => {
    createHandlerRef.current = handler;
    setCanCreate(Boolean(handler));
    return () => {
      createHandlerRef.current = null;
      setCanCreate(false);
    };
  }, []);

  const triggerCreate = useCallback(() => {
    createHandlerRef.current?.();
  }, []);

  return (
    <MobileLayoutContext.Provider value={{ registerCreateHandler, triggerCreate, canCreate }}>
      {children}
    </MobileLayoutContext.Provider>
  );
}

export function useMobileLayout() {
  return useContext(MobileLayoutContext);
}
