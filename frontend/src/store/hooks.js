import { useDispatch, useSelector } from 'react-redux';

// Export typed hooks for better TypeScript support in the future
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
