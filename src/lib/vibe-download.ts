import React from 'react';
import { toPng, toJpeg } from 'html-to-image';
import type { Vibe } from './types';
import type { AspectRatio } from '@/components/DownloadDialog';

export interface DownloadOptions {
  fileName?: string;
  quality?: 'standard' | 'high' | 'ultra';
  format?: 'png' | 'jpeg';
}

const QUALITY_SETTINGS = {
  standard: { scale: 2, jpegQuality: 0.9 },
  high: { scale: 3, jpegQuality: 0.95 },
  ultra: { scale: 4, jpegQuality: 1.0 },
};

export async function downloadVibeCard(
  elementId: string,
  options: DownloadOptions = {}
): Promise<void> {
  const {
    fileName = `vibee-card-${Date.now()}`,
    quality = 'high',
    format = 'png',
  } = options;

  let tempContainer: HTMLElement | null = null;

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const { scale, jpegQuality } = QUALITY_SETTINGS[quality];

    const watermarkContainer = document.createElement('div');
    watermarkContainer.id = 'vibee-watermark-temp';
    watermarkContainer.style.cssText = `
      position: absolute;
      bottom: 16px;
      right: 16px;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(236, 72, 153, 0.95));
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.5px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      gap: 6px;
      z-index: 9999;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    
    watermarkContainer.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Made with Vibee</span>
    `;

    const clonedElement = element.cloneNode(true) as HTMLElement;
    clonedElement.style.position = 'relative';
    clonedElement.appendChild(watermarkContainer);

    tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    document.body.appendChild(tempContainer);
    tempContainer.appendChild(clonedElement);

    await new Promise(resolve => setTimeout(resolve, 100));

    const downloadFunction = format === 'png' ? toPng : toJpeg;
    const fileExtension = format === 'png' ? 'png' : 'jpg';
    
    const dataUrl = await downloadFunction(clonedElement, {
      quality: jpegQuality,
      pixelRatio: scale,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });

    const link = document.createElement('a');
    link.download = `${fileName}.${fileExtension}`;
    link.href = dataUrl;
    link.click();

  } catch (error) {
    console.error('Error downloading vibe card:', error);
    throw error;
  } finally {
    if (tempContainer && document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
  }
}

export async function downloadVibeCardWithCustomWatermark(
  elementId: string,
  watermarkText: string,
  options: DownloadOptions = {}
): Promise<void> {
  const {
    fileName = `vibee-card-${Date.now()}`,
    quality = 'high',
    format = 'png',
  } = options;

  let tempContainer: HTMLElement | null = null;

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const { scale, jpegQuality } = QUALITY_SETTINGS[quality];

    const watermarkContainer = document.createElement('div');
    watermarkContainer.style.cssText = `
      position: absolute;
      bottom: 16px;
      right: 16px;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(236, 72, 153, 0.95));
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.5px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.3);
      z-index: 9999;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    watermarkContainer.textContent = watermarkText;

    const clonedElement = element.cloneNode(true) as HTMLElement;
    clonedElement.style.position = 'relative';
    clonedElement.appendChild(watermarkContainer);

    tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    document.body.appendChild(tempContainer);
    tempContainer.appendChild(clonedElement);

    await new Promise(resolve => setTimeout(resolve, 100));

    const downloadFunction = format === 'png' ? toPng : toJpeg;
    const fileExtension = format === 'png' ? 'png' : 'jpg';
    
    const dataUrl = await downloadFunction(clonedElement, {
      quality: jpegQuality,
      pixelRatio: scale,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });

    const link = document.createElement('a');
    link.download = `${fileName}.${fileExtension}`;
    link.href = dataUrl;
    link.click();

  } catch (error) {
    console.error('Error downloading vibe card:', error);
    throw error;
  } finally {
    if (tempContainer && document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
  }
}

export async function downloadVibeCardWithRatio(
  vibe: Vibe,
  ratio: AspectRatio,
  options: Omit<DownloadOptions, 'fileName'> = {}
): Promise<void> {
  const {
    quality = 'high',
    format = 'png',
  } = options;

  let tempContainer: HTMLElement | null = null;

  try {
    const { createRoot } = await import('react-dom/client');
    const { VibeDownloadTemplate } = await import('@/components/VibeDownloadTemplate');

    tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    document.body.appendChild(tempContainer);

    const root = createRoot(tempContainer);
    
    root.render(
      React.createElement(VibeDownloadTemplate, { vibe, ratio })
    );
    
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 300);
    });

    const templateElement = document.getElementById(`vibe-download-template-${vibe.id}`);
    if (!templateElement) {
      throw new Error('Download template not found');
    }

    const { scale, jpegQuality } = QUALITY_SETTINGS[quality];
    const downloadFunction = format === 'png' ? toPng : toJpeg;
    const fileExtension = format === 'png' ? 'png' : 'jpg';
    
    const dataUrl = await downloadFunction(templateElement, {
      quality: jpegQuality,
      pixelRatio: scale,
      cacheBust: true,
    });

    const link = document.createElement('a');
    const fileName = `vibee-${ratio}-${vibe.emotion.toLowerCase()}-${Date.now()}`;
    link.download = `${fileName}.${fileExtension}`;
    link.href = dataUrl;
    link.click();

    root.unmount();

  } catch (error) {
    console.error('Error downloading vibe card with ratio:', error);
    throw error;
  } finally {
    if (tempContainer && document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
  }
}
