
// Stub implementation to make the build pass
export const useToast = () => {
  return {
    toast: (props: any) => console.log('Toast:', props),
    toasts: [] as any[],
  };
};

export const toast = {
  success: (message: string) => console.log('Success toast:', message),
  error: (message: string) => console.log('Error toast:', message),
};
