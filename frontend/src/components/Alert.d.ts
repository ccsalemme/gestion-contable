interface AlertProps {
    variant: 'success' | 'error' | 'warning' | 'info' | 'danger';
    message: string;
    onClose?: () => void;
    className?: string;
}
export declare function Alert({ variant, message, onClose, className }: AlertProps): import("react/jsx-runtime").JSX.Element;
export declare function ErrorAlert({ message, onClose }: {
    message: string;
    onClose?: () => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function SuccessAlert({ message, onClose }: {
    message: string;
    onClose?: () => void;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Alert.d.ts.map