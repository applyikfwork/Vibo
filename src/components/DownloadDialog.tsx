'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { Vibe } from '@/lib/types';
import { downloadVibeCardWithRatio } from '@/lib/vibe-download';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DownloadDialogProps {
  vibe: Vibe;
  trigger?: React.ReactNode;
  className?: string;
}

export type AspectRatio = 'square' | 'post' | 'story' | 'landscape';

const ASPECT_RATIOS: Record<AspectRatio, { label: string; description: string; icon: string; ratio: string }> = {
  square: {
    label: 'Square',
    description: 'Perfect for Instagram posts & profile',
    icon: '⬜',
    ratio: '1:1',
  },
  post: {
    label: 'Instagram Post',
    description: 'Optimized vertical post format',
    icon: '📱',
    ratio: '4:5',
  },
  story: {
    label: 'Story / Reels',
    description: 'Full-screen vertical format',
    icon: '📲',
    ratio: '9:16',
  },
  landscape: {
    label: 'Landscape',
    description: 'Wide format for Twitter/Facebook',
    icon: '🖼️',
    ratio: '16:9',
  },
};

export function DownloadDialog({ vibe, trigger, className }: DownloadDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('square');
  const [quality, setQuality] = useState<'high' | 'ultra'>('high');
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      await downloadVibeCardWithRatio(vibe, selectedRatio, {
        quality,
        format: 'png',
      });

      toast({
        title: '✨ Download Successful!',
        description: `Your ${ASPECT_RATIOS[selectedRatio].label} vibe card has been saved!`,
      });

      setOpen(false);
    } catch (error) {
      console.error('Error downloading vibe card:', error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Unable to download the vibe card. Please try again.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'text-white bg-gradient-to-r from-purple-500/30 to-pink-500/30 hover:from-purple-500/50 hover:to-pink-500/50 backdrop-blur-md',
              'border-2 border-purple-400/60 hover:border-pink-400/80',
              'rounded-full font-bold',
              'px-3 h-8 sm:px-4 sm:h-9',
              'text-xs sm:text-sm',
              'transition-all duration-300 hover:scale-110',
              'shadow-[0_4px_20px_rgba(168,85,247,0.4)] hover:shadow-[0_6px_30px_rgba(236,72,153,0.6)]',
              className
            )}
          >
            <Download className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Download
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-purple-50 via-white to-pink-50 border-2 border-purple-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Download Your Vibe Card
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Choose your preferred format and quality for sharing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">Format</Label>
            <RadioGroup value={selectedRatio} onValueChange={(value) => setSelectedRatio(value as AspectRatio)}>
              <div className="grid gap-3">
                {(Object.keys(ASPECT_RATIOS) as AspectRatio[]).map((ratio) => {
                  const config = ASPECT_RATIOS[ratio];
                  return (
                    <div
                      key={ratio}
                      className={cn(
                        'flex items-center space-x-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200',
                        selectedRatio === ratio
                          ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg shadow-purple-200/50'
                          : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                      )}
                      onClick={() => setSelectedRatio(ratio)}
                    >
                      <RadioGroupItem value={ratio} id={ratio} />
                      <div className="flex-1">
                        <Label
                          htmlFor={ratio}
                          className="flex items-center gap-2 cursor-pointer text-base font-semibold text-gray-800"
                        >
                          <span className="text-2xl">{config.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              {config.label}
                              <span className="text-xs font-mono text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                                {config.ratio}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 font-normal mt-0.5">{config.description}</p>
                          </div>
                        </Label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">Quality</Label>
            <RadioGroup value={quality} onValueChange={(value) => setQuality(value as 'high' | 'ultra')}>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={cn(
                    'flex items-center space-x-2 rounded-lg border-2 p-3 cursor-pointer transition-all',
                    quality === 'high'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  )}
                  onClick={() => setQuality('high')}
                >
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="cursor-pointer font-medium text-gray-800">
                    High (3x)
                  </Label>
                </div>
                <div
                  className={cn(
                    'flex items-center space-x-2 rounded-lg border-2 p-3 cursor-pointer transition-all',
                    quality === 'ultra'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  )}
                  onClick={() => setQuality('ultra')}
                >
                  <RadioGroupItem value="ultra" id="ultra" />
                  <Label htmlFor="ultra" className="cursor-pointer font-medium text-gray-800">
                    Ultra (4x)
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-base rounded-xl shadow-lg shadow-purple-300/50 hover:shadow-xl hover:shadow-purple-400/50 transition-all duration-300"
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Preparing Download...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Download {ASPECT_RATIOS[selectedRatio].label}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500 leading-relaxed">
            💫 Your download will include an attractive "Made with Vibee" watermark
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
