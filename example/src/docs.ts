import type { ISpinWheelProps } from '.';

type Controlled = Omit<ISpinWheelProps, 'segments' | 'onFinished'>;

// Defaults of the library, used by the playground to print only the props you changed
export const defaults: Required<Controlled> = {
  primaryColor: 'black',
  contrastColor: 'white',
  buttonText: 'Spin',
  isOnlyOnce: false,
  size: 290,
  upDuration: 100,
  downDuration: 600,
  fontFamily: 'Arial',
  arrowLocation: 'center',
  showTextOnSpin: true,
  isSpinSound: true,
  tickSound: 'wood',
  responsive: true,
  clickToSpin: 'wheel',
};

export const propDocs: { name: string; type: string; default: string; description: string }[] = [
  { name: 'segments', type: '{ segmentText: string; segColor?: string }[]', default: 'required', description: 'The wheel segments. Needs at least 2 with text. Segments without segColor use primaryColor.' },
  { name: 'onFinished', type: '(result: string) => void', default: 'required', description: 'Called with the winning segmentText when the wheel stops.' },
  { name: 'primaryColor', type: 'string', default: "'black'", description: 'Color of the wheel outline and center button.' },
  { name: 'contrastColor', type: 'string', default: "'white'", description: 'Color of the text and the needle.' },
  { name: 'buttonText', type: 'string', default: "'Spin'", description: 'Text in the center button.' },
  { name: 'isOnlyOnce', type: 'boolean', default: 'false', description: 'Allow only one spin.' },
  { name: 'size', type: 'number', default: '290', description: 'Wheel radius in pixels. The canvas is size * 2 wide.' },
  { name: 'upDuration', type: 'number', default: '100', description: 'Spin-up time in ms per segment.' },
  { name: 'downDuration', type: 'number', default: '600', description: 'Spin-down time in ms per segment.' },
  { name: 'fontFamily', type: 'string', default: "'Arial'", description: 'Font for the segment text and result.' },
  { name: 'arrowLocation', type: "'center' | 'top'", default: "'center'", description: 'Where the needle is drawn.' },
  { name: 'showTextOnSpin', type: 'boolean', default: 'true', description: 'Show the segment under the needle below the wheel while spinning.' },
  { name: 'isSpinSound', type: 'boolean', default: 'true', description: 'Play the tick sound while spinning.' },
  { name: 'tickSound', type: "'wood' | 'coin'", default: "'wood'", description: 'Style of the tick played on each segment: a dry wood click or a metallic coin ping. Needs isSpinSound.' },
  { name: 'responsive', type: 'boolean', default: 'true', description: 'Shrink to fit the container. The wheel never grows past size. Use false for a fixed pixel size.' },
  { name: 'clickToSpin', type: "'wheel' | 'button' | 'none'", default: "'wheel'", description: 'What starts a spin when clicked: the whole wheel, only the center button, or nothing (use the spin() method on a ref). The wheel is also keyboard accessible (Enter or Space) unless this is none.' },
];
