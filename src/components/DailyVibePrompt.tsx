'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VibeForm } from './VibeForm';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface DailyVibePromptProps {
  onClose: () => void;
}

export function DailyVibePrompt({ onClose }: DailyVibePromptProps) {
  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent asChild>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="p-0 border-0 rounded-2xl shadow-2xl bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 max-w-lg"
        >
          <div className="relative">
             <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full text-muted-foreground hover:bg-black/10"
             >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
            </Button>
            <DialogHeader className="p-6 sm:p-8 text-center items-center">
                <motion.div
                    animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.1, 1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                    className="text-5xl mb-4"
                >
                ✨
                </motion.div>
                <DialogTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                What's your vibe today?
                </DialogTitle>
                <DialogDescription className="text-lg text-muted-foreground mt-2">
                Share a moment, a thought, or a feeling with the world.
                </DialogDescription>
            </DialogHeader>
            <div className="p-6 sm:p-8 pt-0">
                <VibeForm onPost={onClose} />
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
