import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Edit, Trash, Copy, Archive } from 'lucide-react';
import ConfirmationModal from '../ui/ConfirmationModal';
import { cn } from '@/lib/utils';

type MenuAction = {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  isEnabled?: boolean;
  confirmationTitle?: string;
  confirmationMessage?: string;
};

type CustomMenuProps = {
  buttonLabel?: string | React.ReactNode;
  actions: MenuAction[];
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
};

const CustomMenu: React.FC<CustomMenuProps> = ({ 
  buttonLabel = <ChevronDown className="h-4 w-4 text-muted-foreground dark:text-gray-400" />, 
  actions, 
  className = '', 
  buttonClassName = '',
  menuClassName = ''
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<MenuAction | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleActionClick = (action: MenuAction) => {
    if (action.variant === 'destructive' && action.confirmationTitle && action.confirmationMessage) {
      setConfirmationAction(action);
    } else {
      action.onClick();
      setIsMenuOpen(false);
    }
  };

  const handleConfirmAction = () => {
    if (confirmationAction) {
      confirmationAction.onClick();
      setConfirmationAction(null);
      setIsMenuOpen(false);
    }
  };

  const handleCancelConfirmation = () => {
    setConfirmationAction(null);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={cn(
          'flex items-center justify-center hover:bg-accent hover:text-accent-foreground',
          'rounded-md p-1 transition-colors',
          buttonClassName
        )}
      >
        {buttonLabel}
      </button>

      {isMenuOpen && (
        <div 
          ref={menuRef}
          className={cn(
            'absolute right-0 z-50 mt-1 w-48 rounded-md border',
            'bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5',
            'divide-y divide-gray-100 dark:divide-gray-700',
            menuClassName
          )}
        >
          <div className="py-1">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleActionClick(action)}
                disabled={action.isEnabled === false}
                className={cn(
                  'flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700',
                  action.variant === 'destructive' 
                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
                    : 'text-gray-700 dark:text-gray-200',
                  action.isEnabled === false && 'opacity-50 cursor-not-allowed'
                )}
              >
                <action.icon className="mr-2 h-4 w-4" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {confirmationAction && (
        <ConfirmationModal
          isOpen={!!confirmationAction}
          onClose={handleCancelConfirmation}
          title={confirmationAction.confirmationTitle || 'Confirm Action'}
          message={confirmationAction.confirmationMessage || 'Are you sure you want to proceed?'}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
};

export default CustomMenu;