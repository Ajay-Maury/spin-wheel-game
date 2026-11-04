import { useState } from 'react';
import "./App.css"
import { ISegments, ISpinWheelProps, SpinWheel } from '.';
import Changelog from './Changelog';
import { defaults, propDocs } from './docs';

const REPO = 'https://github.com/Ajay-Maury/spin-wheel-game';

const starterSegments: ISegments[] = [
  { segmentText: "better luck next time", segColor: "#EE4040" },
  { segmentText: "won 70", segColor: "#F0CF50" },
  { segmentText: "won 10", segColor: "#815CD1" },
  { segmentText: "better luck next time", segColor: "#3DA5E0" },
  { segmentText: "won 6", segColor: "#34A24F" },
  { segmentText: "won uber pass", segColor: "#34A246" },
];

const installCode = `npm install spin-wheel-game`;

const usageCode = `import { SpinWheel } from 'spin-wheel-game';

const segments = [
  { segmentText: 'Option 1', segColor: 'red' },
  { segmentText: 'Option 2', segColor: 'blue' },
  { segmentText: 'Option 3', segColor: 'green' },
];

export default function MyWheel() {
  return (
    <SpinWheel
      segments={segments}
      onFinished={(result) => console.log(\`Spun to: \${result}\`)}
    />
  );
}`;

type Settings = Required<Omit<ISpinWheelProps, 'segments' | 'onFinished'>>;

const toCode = (segments: ISegments[], settings: Settings) => {
  const changed = (Object.keys(settings) as (keyof Settings)[]).filter((key) => settings[key] !== defaults[key]);
  const lines = changed.map((key) => {
    const value = settings[key];
    return typeof value === 'string' ? `  ${key}="${value}"` : `  ${key}={${value}}`;
  });
  const segmentLines = segments.map((s) => `  { segmentText: ${JSON.stringify(s.segmentText)}, segColor: ${JSON.stringify(s.segColor)} },`);
  return `const segments = [\n${segmentLines.join('\n')}\n];\n\n<SpinWheel\n  segments={segments}\n  onFinished={(result) => console.log(result)}${lines.length ? '\n' + lines.join('\n') : ''}\n/>`;
};

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => { /* clipboard may be unavailable */ });
  };
  return (
    <div className="code">
      <button type="button" onClick={copy} className="copy">{copied ? 'Copied' : 'Copy'}</button>
      <pre><code>{code}</code></pre>
    </div>
  );
}

function Playground() {
  const [segments, setSegments] = useState<ISegments[]>(starterSegments);
  const [settings, setSettings] = useState<Settings>({ ...defaults, size: 200, arrowLocation: 'top' });
  const [result, setResult] = useState('');
  const [round, setRound] = useState(0); // changing the key resets a wheel locked by isOnlyOnce

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings((s) => ({ ...s, [key]: value }));
  const updateSegment = (i: number, patch: Partial<ISegments>) =>
    setSegments((list) => list.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const number = (key: 'size' | 'upDuration' | 'downDuration') => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(key, Number(e.target.value));

  return (
    <div className="playground">
      <div className="stage">
        <SpinWheel
          key={round}
          segments={segments}
          onFinished={setResult}
          {...settings}
        />
        <p className="result" aria-live="polite">{result ? <>Result: <strong>{result}</strong></> : 'Click the wheel to spin'}</p>
        {settings.isOnlyOnce && <button type="button" onClick={() => { setRound((r) => r + 1); setResult(''); }}>Reset wheel</button>}
      </div>

      <div className="controls">
        <fieldset>
          <legend>Segments</legend>
          {segments.map((segment, i) => (
            <div className="segment-row" key={i}>
              <input aria-label={`Segment ${i + 1} text`} value={segment.segmentText} onChange={(e) => updateSegment(i, { segmentText: e.target.value })} />
              <input aria-label={`Segment ${i + 1} color`} type="color" value={segment.segColor} onChange={(e) => updateSegment(i, { segColor: e.target.value })} />
              <button type="button" aria-label={`Remove segment ${i + 1}`} disabled={segments.length <= 2} onClick={() => setSegments((list) => list.filter((_, idx) => idx !== i))}>×</button>
            </div>
          ))}
          <button type="button" disabled={segments.length >= 12} onClick={() => setSegments((list) => [...list, { segmentText: `option ${list.length + 1}`, segColor: '#888888' }])}>Add segment</button>
        </fieldset>

        <fieldset>
          <legend>Look</legend>
          <label>Wheel color <input type="color" value={settings.primaryColor.startsWith('#') ? settings.primaryColor : '#000000'} onChange={(e) => set('primaryColor', e.target.value)} /></label>
          <label>Text color <input type="color" value={settings.contrastColor.startsWith('#') ? settings.contrastColor : '#ffffff'} onChange={(e) => set('contrastColor', e.target.value)} /></label>
          <label>Button text <input value={settings.buttonText} onChange={(e) => set('buttonText', e.target.value)} /></label>
          <label>Size <input type="range" min={100} max={290} value={settings.size} onChange={number('size')} /> <span>{settings.size}</span></label>
          <label>Needle
            <select value={settings.arrowLocation} onChange={(e) => set('arrowLocation', e.target.value as Settings['arrowLocation'])}>
              <option value="center">center</option>
              <option value="top">top</option>
            </select>
          </label>
        </fieldset>

        <fieldset>
          <legend>Behavior</legend>
          <label>Spin up (ms per segment) <input type="range" min={0} max={400} step={10} value={settings.upDuration} onChange={number('upDuration')} /> <span>{settings.upDuration}</span></label>
          <label>Spin down (ms per segment) <input type="range" min={100} max={1500} step={50} value={settings.downDuration} onChange={number('downDuration')} /> <span>{settings.downDuration}</span></label>
          <label className="check"><input type="checkbox" checked={settings.isOnlyOnce} onChange={(e) => set('isOnlyOnce', e.target.checked)} /> isOnlyOnce</label>
          <label className="check"><input type="checkbox" checked={settings.showTextOnSpin} onChange={(e) => set('showTextOnSpin', e.target.checked)} /> showTextOnSpin</label>
          <label className="check"><input type="checkbox" checked={settings.isSpinSound} onChange={(e) => set('isSpinSound', e.target.checked)} /> isSpinSound</label>
          <label className="check"><input type="checkbox" checked={settings.responsive} onChange={(e) => set('responsive', e.target.checked)} /> responsive</label>
        </fieldset>
      </div>

      <div className="snippet">
        <h3>Your code</h3>
        <CodeBlock code={toCode(segments, settings)} />
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <header className="top">
        <a className="brand" href="#top">spin-wheel-game</a>
        <nav aria-label="Sections">
          <a href="#playground">Playground</a>
          <a href="#install">Install</a>
          <a href="#props">Props</a>
          <a href="#releases">Releases</a>
          <a href={REPO}>GitHub</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <h1>spin-wheel-game</h1>
          <p>A customizable prize wheel for React. Click it and it spins, ticks, slows down and tells you which segment it landed on.</p>
          <p className="badges">
            <a href="https://www.npmjs.com/package/spin-wheel-game"><img alt="npm version" src="https://img.shields.io/npm/v/spin-wheel-game.svg" /></a>
            <a href={`${REPO}/blob/main/LICENSE`}><img alt="license" src="https://img.shields.io/npm/l/spin-wheel-game.svg" /></a>
          </p>
          <ul className="features">
            <li>Random result on every spin</li>
            <li>2 or more segments, each with its own text and color</li>
            <li>Shrinks to fit its container, so it works on phones</li>
            <li>Optional tick sound</li>
            <li>TypeScript typings included</li>
            <li>React 18 and newer; several wheels can share a page</li>
          </ul>
        </section>

        <section id="playground">
          <h2>Playground</h2>
          <p>Change the props and spin. The code below the wheel is what you would paste into your app.</p>
          <Playground />
        </section>

        <section id="install">
          <h2>Install</h2>
          <CodeBlock code={installCode} />
          <p>Requires React 18 or newer, which is a peer dependency.</p>
          <h2>Usage</h2>
          <CodeBlock code={usageCode} />
        </section>

        <section id="props">
          <h2>Props</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                {propDocs.map((prop) => (
                  <tr key={prop.name}>
                    <td><code>{prop.name}</code></td>
                    <td><code>{prop.type}</code></td>
                    <td><code>{prop.default}</code></td>
                    <td>{prop.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Invalid values for <code>size</code>, <code>upDuration</code> and <code>downDuration</code> (<code>NaN</code>, negative, or zero where that makes no sense) fall back to the defaults.
            With fewer than 2 segments the component renders nothing and logs a warning.
          </p>
        </section>

        <section id="releases">
          <h2>Releases</h2>
          <p>What changed in each version, newest first. The same notes live in <a href={`${REPO}/blob/main/CHANGELOG.md`}>CHANGELOG.md</a>.</p>
          <Changelog />
        </section>
      </main>

      <footer>
        <p>MIT licensed. <a href={REPO}>Source on GitHub</a> · <a href="https://www.npmjs.com/package/spin-wheel-game">npm</a> · <a href={`${REPO}/issues`}>Report an issue</a></p>
      </footer>
    </>
  )
}

export default App
