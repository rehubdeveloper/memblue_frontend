import React, { useEffect } from 'react';
import { CheckCircle, Info, XCircle } from 'lucide-react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(), 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const typeStyles = {
        success: 'bg-green-600 border-green-500',
        error: 'bg-red-600 border-red-500',
        info: 'bg-blue-600 border-blue-500',
    };

    const IconMap = {
        success: <CheckCircle className="w-5 h-5 text-white mr-2" />,
        error: <XCircle className="w-5 h-5 text-white mr-2" />,
        info: <Info className="w-5 h-5 text-white mr-2" />,
    };

    return (
        <div
            className={`fixed top-8 right-8 z-50 flex items-center max-w-sm border-2 text-white text-base font-semibold px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md transition-transform transform animate-slideIn ${typeStyles[type]}`}
        >
            {IconMap[type]}
            <span className="flex-1">{message}</span>
        </div>
    );
};

export default Toast;
