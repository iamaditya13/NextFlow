import React from 'react';
import * as LucideIcons from 'lucide-react';

// Maps legacy Anima string identifiers to real Lucide layout identifiers
const MAPPED_ICONS: Record<string, string> = {
  'icon-1': 'Aperture',
  'icon-12': 'CheckCircle',
  'icon-17': 'Image',
  'icon-18': 'Sparkles',
  'icon-19': 'Video',
  'icon-20': 'ChevronLeft',
  'icon-21': 'ChevronRight',
  'icon-22': 'Box',
  'icon-23': 'Globe',
  'icon-24': 'Activity',
  'icon-25': 'PlayCircle',
  'icon-26': 'Target',
  'icon-27': 'Camera',
  'icon-28': 'Layers',
  'icon-29': 'Layers',
  'icon-30': 'Command',
  'icon-31': 'Cpu',
  'icon-32': 'Cloud',
  'icon-33': 'Code',
  'icon-34': 'Database',
  'icon-40': 'MessageSquare',
  'icon-41': 'Zap',
  'icon-42': 'Layout',
  'icon-43': 'Star',
  'icon-44': 'Wand2',
  'icon-45': 'Type',
  'icon-46': 'Crop',
  'icon-47': 'Maximize',
  'icon-48': 'Scissors',
  'icon-49': 'Edit3',
  'icon-50': 'Sliders',
  'icon-51': 'Save',
  'icon-52': 'Twitter',
  'icon-53': 'Github',
  'icon-54': 'Linkedin',
  'icon-55': 'Youtube',
};

const DEFAULT_ICONS = ['Hexagon', 'Star', 'Circle', 'Triangle', 'Square', 'Octagon'];

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt?: string;
}

export function IconRenderer({ src, className, style, alt, ...props }: Props) {
  if (typeof src === 'string' && src.includes('icon-')) {
    const match = src.match(/icon-(\d+)/);
    const key = match ? `icon-${match[1]}` : 'icon-1';
    const iconName = MAPPED_ICONS[key] || DEFAULT_ICONS[(parseInt(match?.[1] || '0')) % DEFAULT_ICONS.length];
    
    // Dynamically grab the component from Lucide React
    const IconComponent = (LucideIcons as any)[iconName] as React.ElementType;
    
    if (IconComponent) {
      return (
        <IconComponent 
          className={className || "w-6 h-6"} 
          style={{...style, color: 'currentColor'}}
          strokeWidth={1.5}
        />
      );
    }
  }

  // Fallback to standard <img> tag for real images
  return <img src={src} className={className} style={style} alt={alt || "icon"} {...props} />;
}
