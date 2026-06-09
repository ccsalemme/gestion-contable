import { CellFormat } from '@/api/sheets';

/**
 * Convierte un color RGB de Google Sheets (valores 0-1) a formato CSS
 */
export function rgbToCSS(color?: { red?: number; green?: number; blue?: number; alpha?: number }): string {
  if (!color) return '';
  
  const r = Math.round((color.red || 0) * 255);
  const g = Math.round((color.green || 0) * 255);
  const b = Math.round((color.blue || 0) * 255);
  const a = color.alpha !== undefined ? color.alpha : 1;
  
  if (a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Convierte el formato de alineación de Google Sheets a CSS
 */
export function alignmentToCSS(alignment?: string): string {
  if (!alignment) return '';
  
  const alignmentMap: Record<string, string> = {
    'LEFT': 'left',
    'CENTER': 'center',
    'RIGHT': 'right',
    'TOP': 'top',
    'MIDDLE': 'middle',
    'BOTTOM': 'bottom',
  };
  
  return alignmentMap[alignment] || '';
}

/**
 * Convierte el formato de borde de Google Sheets a CSS
 */
export function borderToCSS(border?: any): string {
  if (!border || !border.style || border.style === 'NONE') return '';
  
  const width = border.width || 1;
  const style = border.style === 'SOLID' ? 'solid' : 
                border.style === 'DOTTED' ? 'dotted' : 
                border.style === 'DASHED' ? 'dashed' : 'solid';
  const color = border.color ? rgbToCSS(border.color) : '#000';
  
  return `${width}px ${style} ${color}`;
}

/**
 * Convierte el formato de celda completo de Google Sheets a un objeto de estilos CSS
 */
export function cellFormatToCSS(format?: CellFormat): React.CSSProperties {
  if (!format) return {};
  
  const styles: React.CSSProperties = {};
  
  // Color de fondo
  if (format.backgroundColor) {
    const bgColor = rgbToCSS(format.backgroundColor);
    // Solo aplicar si no es blanco puro
    if (bgColor && bgColor !== 'rgb(255, 255, 255)') {
      styles.backgroundColor = bgColor;
    }
  }
  
  // Formato de texto
  if (format.textFormat) {
    const tf = format.textFormat;
    
    // Color de texto
    if (tf.foregroundColor) {
      const textColor = rgbToCSS(tf.foregroundColor);
      // Solo aplicar si no es negro puro (el color por defecto)
      if (textColor && textColor !== 'rgb(0, 0, 0)') {
        styles.color = textColor;
      }
    }
    
    // Fuente
    if (tf.fontFamily) {
      styles.fontFamily = tf.fontFamily;
    }
    
    // Tamaño de fuente
    if (tf.fontSize) {
      styles.fontSize = `${tf.fontSize}px`;
    }
    
    // Negrita
    if (tf.bold) {
      styles.fontWeight = 'bold';
    }
    
    // Cursiva
    if (tf.italic) {
      styles.fontStyle = 'italic';
    }
    
    // Tachado
    if (tf.strikethrough) {
      styles.textDecoration = 'line-through';
    }
    
    // Subrayado
    if (tf.underline) {
      styles.textDecoration = styles.textDecoration 
        ? `${styles.textDecoration} underline` 
        : 'underline';
    }
  }
  
  // Alineación horizontal
  if (format.horizontalAlignment) {
    styles.textAlign = alignmentToCSS(format.horizontalAlignment) as any;
  }
  
  // Alineación vertical
  if (format.verticalAlignment) {
    styles.verticalAlign = alignmentToCSS(format.verticalAlignment) as any;
  }
  
  // Bordes
  if (format.borders) {
    if (format.borders.top) {
      styles.borderTop = borderToCSS(format.borders.top);
    }
    if (format.borders.bottom) {
      styles.borderBottom = borderToCSS(format.borders.bottom);
    }
    if (format.borders.left) {
      styles.borderLeft = borderToCSS(format.borders.left);
    }
    if (format.borders.right) {
      styles.borderRight = borderToCSS(format.borders.right);
    }
  }
  
  return styles;
}

/**
 * Determina si una celda tiene formato personalizado (no es el formato por defecto)
 */
export function hasCustomFormat(format?: CellFormat): boolean {
  if (!format) return false;
  
  // Verificar si hay color de fondo diferente a blanco
  if (format.backgroundColor) {
    const bg = format.backgroundColor;
    const isWhite = (bg.red === 1 || bg.red === undefined) && 
                    (bg.green === 1 || bg.green === undefined) && 
                    (bg.blue === 1 || bg.blue === undefined);
    if (!isWhite) return true;
  }
  
  // Verificar formato de texto
  if (format.textFormat) {
    const tf = format.textFormat;
    if (tf.bold || tf.italic || tf.strikethrough || tf.underline) return true;
    if (tf.fontSize && tf.fontSize !== 10) return true; // 10 es el tamaño por defecto
    
    // Color de texto diferente a negro
    if (tf.foregroundColor) {
      const fg = tf.foregroundColor;
      const isBlack = (fg.red === 0 || fg.red === undefined) && 
                      (fg.green === 0 || fg.green === undefined) && 
                      (fg.blue === 0 || fg.blue === undefined);
      if (!isBlack) return true;
    }
  }
  
  // Verificar bordes
  if (format.borders) {
    const hasBorder = format.borders.top?.style !== 'NONE' ||
                     format.borders.bottom?.style !== 'NONE' ||
                     format.borders.left?.style !== 'NONE' ||
                     format.borders.right?.style !== 'NONE';
    if (hasBorder) return true;
  }
  
  return false;
}
