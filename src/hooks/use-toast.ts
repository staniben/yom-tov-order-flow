
// Stub implementation to make the build pass
export const useToast = () => {
  return {
    toast: (props: any) => console.log('Toast:', props),
    toasts: [] as any[],
  };
};

// Make toast a callable function that also has properties
const toastFn = (props: any) => {
  console.log('Toast called with:', props);
  return props;
};

// Add methods to the function
toastFn.success = (message: string) => console.log('Success toast:', message);
toastFn.error = (message: string) => console.log('Error toast:', message);

// Export the function with its methods
export const toast = toastFn as ((props: any) => any) & {
  success: (message: string) => void;
  error: (message: string) => void;
};
