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
  tickSound: '',
  tickVolume: 1,
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
  { name: 'tickSound', type: 'string', default: "'' (built-in tick)", description: 'Address of your own tick sound file (mp3, wav, ogg), as a string: a path like /sounds/tick.mp3, an imported file, a blob: URL or a full link. See Custom tick sound below. Played on every segment, capped at 150 ms. If it cannot be loaded, the built-in tick is used.' },
  { name: 'tickVolume', type: 'number', default: '1', description: 'Tick volume from 0 to 1. Applies to the built-in and the custom tick.' },
  { name: 'responsive', type: 'boolean', default: 'true', description: 'Shrink to fit the container. The wheel never grows past size. Use false for a fixed pixel size.' },
  { name: 'clickToSpin', type: "'wheel' | 'button' | 'none'", default: "'wheel'", description: 'What starts a spin when clicked: the whole wheel, only the center button, or nothing (use the spin() method on a ref). The wheel is also keyboard accessible (Enter or Space) unless this is none.' },
];

export const tickSoundCode = `// 1. A file in your public folder (same site, no extra setup)
<SpinWheel tickSound="/sounds/tick.mp3" ... />

// 2. A file imported through your bundler (Vite, webpack, CRA give you a URL string)
import tick from './tick.mp3';
<SpinWheel tickSound={tick} ... />

// 3. A file the user picked, turned into a temporary URL
const url = URL.createObjectURL(file); // file from <input type="file">
<SpinWheel tickSound={url} ... />

// 4. A link on another site (that server must allow CORS)
<SpinWheel tickSound="https://cdn.example.com/tick.mp3" ... />`;
