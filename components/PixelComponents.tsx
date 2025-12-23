import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const PixelCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`bg-pixel-light border-4 border-pixel-dark shadow-pixel p-4 relative ${className}`}>
      {children}
    </div>
  );
};

export const PixelButton: React.FC<{ 
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void; 
  disabled?: boolean; 
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'accent';
  className?: string
}> = ({ onClick, disabled, children, variant = 'primary', className = '' }) => {
  
  let bgClass = 'bg-pixel-green';
  let textClass = 'text-pixel-dark';
  
  if (variant === 'danger') {
    bgClass = 'bg-red-500';
    textClass = 'text-white';
  } else if (variant === 'accent') {
    bgClass = 'bg-pixel-sand';
  }

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${bgClass} ${textClass} 
        font-pixel text-xs sm:text-sm uppercase tracking-wider
        border-b-4 border-r-4 border-pixel-dark
        px-4 py-2 
        active:border-b-0 active:border-r-0 active:translate-y-1 active:translate-x-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};

export const ProgressBar: React.FC<{ value: number; max: number; label?: string }> = ({ value, max, label }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="w-full">
      {label && <div className="text-xs font-pixel mb-1 text-pixel-dark">{label}</div>}
      <div className="h-4 border-2 border-pixel-dark bg-gray-300 relative">
        <div 
          className="h-full bg-pixel-green transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const PixelModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-pixel-light border-4 border-pixel-dark shadow-pixel w-full max-w-lg max-h-[80vh] flex flex-col"
      >
        <div className="bg-pixel-dark text-pixel-light p-3 flex justify-between items-center select-none">
          <h2 className="font-pixel text-lg">{title}</h2>
          <button onClick={onClose} className="hover:text-red-400"><X /></button>
        </div>
        <div className="p-4 overflow-y-auto custom-scrollbar font-mono-pixel text-lg leading-relaxed">
          {children}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export const PixelToast: React.FC<{ message: string; icon?: React.ReactNode; onClose: () => void }> = ({ message, icon, onClose }) => {
  // Use a ref to keep track of the latest onClose callback
  // This allows the effect to have an empty dependency array, preventing reset on parent re-renders
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // 5 seconds timeout
    const timer = setTimeout(() => {
      if (onCloseRef.current) {
        onCloseRef.current();
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures timer starts once on mount and isn't reset

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className="bg-pixel-sand border-2 border-pixel-dark text-pixel-dark p-3 shadow-lg flex items-center gap-3 w-64 pointer-events-auto"
    >
      <div className="p-2 bg-white/30 border border-pixel-dark rounded-sm">
        {icon || <div className="w-6 h-6 bg-pixel-green" />}
      </div>
      <div className="flex-1">
        <div className="text-[10px] uppercase font-pixel text-pixel-brown mb-1">Unlocked!</div>
        <div className="text-lg leading-tight font-mono-pixel">{message}</div>
      </div>
    </motion.div>
  );
};