
import { useToast as useToastOriginal, toast as toastOriginal } from "@/components/ui/toast";

// Re-export the hooks from shadcn/ui
export const useToast = useToastOriginal;
export const toast = toastOriginal;
