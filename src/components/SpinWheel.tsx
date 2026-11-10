import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ISpinWheelHandle, ISpinWheelProps } from './SpinWheel.interface';

// Invalid numeric props (NaN, negative, zero where it makes no sense) would turn the
// wheel angle into NaN and break it for good, so fall back to the defaults.
const positiveOr = (value: number, fallback: number) =>
  Number.isFinite(value) && value > 0 ? value : fallback;

const MAX_DPR = 3;
const getDpr = () =>
  typeof window === 'undefined' ? 1 : Math.min(Math.max(window.devicePixelRatio || 1, 1), MAX_DPR);

// Shortens text with an ellipsis until it fits in maxWidth (the font must already be set)
const fitText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let shortened = text;
  while (shortened.length > 1 && ctx.measureText(shortened + '…').width > maxWidth) {
    shortened = shortened.slice(0, -1);
  }
  return shortened.trimEnd() + '…';
};

// Screen readers should hear the result, but it has no place on screen (the canvas shows it)
const visuallyHidden: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

type AudioContextCtor = typeof AudioContext;
const getAudioContextCtor = (): AudioContextCtor | undefined =>
  typeof window === 'undefined'
    ? undefined
    : window.AudioContext ??
      (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;

const SpinWheel = forwardRef<ISpinWheelHandle, ISpinWheelProps>(({
  segments = [],
  onFinished,
  primaryColor = 'black',
  contrastColor = 'white',
  buttonText = 'Spin',
  isOnlyOnce = false,
  size: sizeProp = 290,
  upDuration: upDurationProp = 100,
  downDuration: downDurationProp = 600,
  fontFamily = 'Arial',
  arrowLocation = 'center',
  showTextOnSpin = true,
  isSpinSound = true,
  responsive = true,
  clickToSpin = 'wheel'
}, ref) => {
  const size = positiveOr(sizeProp, 290);
  const upDuration = Number.isFinite(upDurationProp) && upDurationProp >= 0 ? upDurationProp : 100;
  const downDuration = positiveOr(downDurationProp, 600);

  // Drop segments without text first, so text and color stay aligned per segment
  const validSegments = segments.filter((segment) => segment?.segmentText);
  const segmentTextArray = validSegments.map((segment) => segment.segmentText);
  const segColorArray = validSegments.map((segment) => segment.segColor ?? primaryColor);
  const canSpin = segmentTextArray.length >= 2;

  const [isFinished, setFinished] = useState<boolean>(false);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [needleText, setNeedleText] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [dpr, setDpr] = useState<number>(getDpr);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const timerHandleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const angleCurrentRef = useRef(0);
  const spinStartRef = useRef(0);
  const speedScaleRef = useRef(1);

  const timerDelay = segmentTextArray.length;
  const upTime = segmentTextArray.length * upDuration;
  const downTime = segmentTextArray.length * downDuration;
  const maxSpeed = Math.PI / segmentTextArray.length;
  const centerX = size;
  const centerY = size;
  // Everything is laid out for the default size (290) and scaled from there
  const scale = size / 290;
  const fontPx = Math.max(9, 16 * scale);
  const buttonRadius = 30 * scale;
  // Needle pointing in from the top rim: labels must stop before its tip
  const topNeedleTip = size * 0.86;
  const labelInner = buttonRadius + 10 * scale;
  const labelOuter = arrowLocation === 'top' ? topNeedleTip - 6 * scale : size - 10 * scale;

  const drawSegment = (ctx: CanvasRenderingContext2D, key: number, lastAngle: number, angle: number) => {
    const value = segmentTextArray[key]
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, size, lastAngle, angle, false)
    ctx.lineTo(centerX, centerY)
    ctx.closePath()
    ctx.fillStyle = segColorArray[key]
    ctx.fill()
    ctx.stroke()
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((lastAngle + angle) / 2)
    ctx.fillStyle = contrastColor
    ctx.font = `bold ${fontPx}px ${fontFamily}`
    ctx.fillText(
      fitText(ctx, value, labelOuter - labelInner),
      (labelInner + labelOuter) / 2,
      0
    )
    ctx.restore()
  }

  const drawWheel = (ctx: CanvasRenderingContext2D) => {
    let lastAngle = angleCurrentRef.current
    const len = segmentTextArray.length
    const PI2 = Math.PI * 2
    ctx.lineWidth = 1
    ctx.strokeStyle = primaryColor
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.font = `${fontPx}px ${fontFamily}`
    for (let i = 1; i <= len; i++) {
      const angle = PI2 * (i / len) + angleCurrentRef.current
      drawSegment(ctx, i - 1, lastAngle, angle)
      lastAngle = angle
    }

    // Draw a center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, buttonRadius, 0, PI2, false)
    ctx.closePath()
    ctx.fillStyle = primaryColor
    ctx.lineWidth = 2
    ctx.strokeStyle = contrastColor
    ctx.fill()
    ctx.font = `bold ${fontPx}px ${fontFamily}`
    ctx.fillStyle = contrastColor
    ctx.textAlign = 'center'
    ctx.fillText(fitText(ctx, buttonText, buttonRadius * 2 - 6 * scale), centerX, centerY + 3 * scale)
    ctx.stroke()

    // Draw outer circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, size, 0, PI2, false)
    ctx.closePath()

    ctx.lineWidth = 4
    ctx.strokeStyle = primaryColor
    ctx.stroke()
  }

  // Draws the needle and returns the text of the segment it points at
  const drawNeedle = (ctx: CanvasRenderingContext2D): string => {
    ctx.lineWidth = 1
    ctx.strokeStyle = contrastColor
    ctx.fillStyle = contrastColor
    ctx.beginPath()

    if (arrowLocation === "top") {
      ctx.moveTo(centerX + 20 * scale, 4 * scale)
      ctx.lineTo(centerX - 20 * scale, 4 * scale)
      ctx.lineTo(centerX, centerY - topNeedleTip)
    } else {
      ctx.moveTo(centerX + 20 * scale, centerY - buttonRadius)
      ctx.lineTo(centerX - 20 * scale, centerY - buttonRadius)
      ctx.lineTo(centerX, centerY - (centerY / 2.5))
    }

    ctx.closePath()
    ctx.fill()
    const change = angleCurrentRef.current + Math.PI / 2
    let i =
      segmentTextArray.length -
      Math.floor((change / (Math.PI * 2)) * segmentTextArray.length) -
      1
    if (i < 0) i = i + segmentTextArray.length
    else if (i >= segmentTextArray.length) i = i - segmentTextArray.length
    return segmentTextArray[i]
  }

  // Redraws the whole wheel and returns the segment currently under the needle
  const wheelDraw = (): string => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx || !canSpin) return ''
    // Draw in CSS-pixel units; the backing store is dpr times larger for sharpness
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size * 2, size * 2)
    drawWheel(ctx)
    return drawNeedle(ctx)
  }

  // The interval and the click handler outlive the render that created them,
  // so they always call the latest draw function and callback through refs.
  const wheelDrawRef = useRef(wheelDraw);
  const onFinishedRef = useRef(onFinished);
  const spinRef = useRef(() => {});
  useEffect(() => {
    wheelDrawRef.current = wheelDraw;
    onFinishedRef.current = onFinished;
    spinRef.current = spin;
  });
  useImperativeHandle(ref, () => ({ spin: () => spinRef.current() }), []);

  const stopTimer = useCallback(() => {
    if (timerHandleRef.current !== null) {
      clearInterval(timerHandleRef.current);
      timerHandleRef.current = null;
    }
  }, []);

  // The tick is synthesized (a short noise burst plus a low tone, like a dry wooden
  // click), so the package ships no audio file and every tick is its own
  // sound instead of one clip being restarted. The pitch varies a little per tick.
  const playTick = useCallback(() => {
    const audio = audioContextRef.current;
    if (!audio || audio.state !== 'running') return;
    const now = audio.currentTime;
    const between = (min: number, max: number) => min + Math.random() * (max - min);

    if (!noiseBufferRef.current) {
      const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * 0.05), audio.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noiseBufferRef.current = buffer;
    }

    const noise = audio.createBufferSource();
    noise.buffer = noiseBufferRef.current;
    const filter = audio.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = between(1500, 1900);
    filter.Q.value = 9;
    const noiseGain = audio.createGain();
    noiseGain.gain.setValueAtTime(1.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
    noise.connect(filter).connect(noiseGain).connect(audio.destination);
    noise.start(now);
    noise.stop(now + 0.035);

    const oscillator = audio.createOscillator();
    const toneGain = audio.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(between(520, 600), now);
    oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.05);
    toneGain.gain.setValueAtTime(0.5, now);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    oscillator.connect(toneGain).connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.06);
  }, []);

  // Browsers only allow audio after a user gesture, so it is set up when a spin starts
  const unlockAudio = () => {
    if (!isSpinSound) return;
    if (!audioContextRef.current) {
      const Ctor = getAudioContextCtor();
      if (!Ctor) return;
      audioContextRef.current = new Ctor();
    }
    audioContextRef.current.resume().catch(() => { /* blocked until a gesture */ });
  };

  // Total angle a spin travels at speed scale 1. Every spin of a given wheel
  // covers (almost) this same distance, so without a random scale it would
  // always land on the same segment.
  const nominalRotation = () => {
    let total = 0;
    // Bounded so absurdly long durations can't freeze the page; the estimate only
    // has to be close, the spin itself is not affected.
    for (let t = timerDelay * 5, ticks = 0; ticks < 100000; t += timerDelay * 5, ticks++) {
      if (t < upTime) {
        total += maxSpeed * Math.sin((t / upTime) * Math.PI / 2);
      } else {
        const progress = t / downTime;
        total += maxSpeed * Math.sin((progress * Math.PI) / 2 + Math.PI / 2);
        if (progress >= 1) break;
      }
    }
    return total;
  };

  const onTimerTick = () => {
    const currentSegment = wheelDrawRef.current();
    if (!currentSegment) {
      // Nothing to draw any more (segments were emptied or the canvas is gone)
      stopTimer();
      return;
    }
    setNeedleText(currentSegment);

    const duration = new Date().getTime() - spinStartRef.current;
    let angleDelta: number;
    let finished = false;

    if (duration < upTime) {
      const progress = duration / upTime;
      angleDelta = maxSpeed * speedScaleRef.current * Math.sin((progress * Math.PI) / 2);
    }
    else {
      const progress = duration / downTime;
      angleDelta =
        maxSpeed * speedScaleRef.current * Math.sin((progress * Math.PI) / 2 + Math.PI / 2);
      if (progress >= 1) finished = true;
    }

    angleCurrentRef.current += angleDelta;
    angleCurrentRef.current = Number.isFinite(angleCurrentRef.current)
      ? ((angleCurrentRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      : 0;
    if (finished) {
      stopTimer();
      setFinished(true);
      setResult(currentSegment);
      onFinishedRef.current(currentSegment);
    }
  };

  const spin = () => {
    if (!canSpin || (isOnlyOnce && isFinished)) return;
    setIsStarted(true);
    unlockAudio();
    if (timerHandleRef.current === null) {
      setFinished(false);
      setResult("");
      // Vary the travelled distance by two full turns (rotation is linear in speed),
      // which makes the landing segment uniformly random. The scale never drops
      // below 1, so the wheel never slows down or turns backwards.
      speedScaleRef.current = 1 + Math.random() * ((4 * Math.PI) / (nominalRotation() || 1));
      spinStartRef.current = new Date().getTime();
      timerHandleRef.current = setInterval(onTimerTick, timerDelay * 5);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 1);
    return () => {
      stopTimer();
      audioContextRef.current?.close().catch(() => { /* already closed */ });
      audioContextRef.current = null;
      noiseBufferRef.current = null;
    };
  }, [stopTimer]);

  // Re-render when the page moves to a screen with a different pixel ratio
  useEffect(() => {
    const query = window.matchMedia?.(`(resolution: ${dpr}dppx)`);
    const update = () => setDpr(getDpr());
    query?.addEventListener('change', update);
    return () => query?.removeEventListener('change', update);
  }, [dpr]);

  // Redraw whenever the wheel's appearance changes (props, or a new spin position)
  const segmentsKey = JSON.stringify(segments);
  useEffect(() => {
    // The canvas is an external system; the needle text mirrors what it just drew
    setNeedleText(wheelDraw());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentsKey, primaryColor, contrastColor, buttonText, size, fontFamily, arrowLocation, dpr]);

  // One tick each time the needle moves onto a new segment
  useEffect(() => {
    if (needleText && isSpinSound && isStarted && !isFinished) playTick();
  }, [needleText, isSpinSound, isStarted, isFinished, playTick]);

  // The canvas backing store is size * 2 * dpr pixels while its displayed size scales down, so the wheel shrinks to fit narrow containers but never grows past `size`.
  const wrapperStyle: React.CSSProperties | undefined = responsive
    ? { width: '100%', maxWidth: size * 2, minWidth: 0 }
    : undefined;

  const interactive = clickToSpin !== 'none';
  const locked = isOnlyOnce && isFinished;

  // True when a pointer event is over the center button (canvas units are size * 2 wide)
  const isOverButton = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) return false;
    const toCanvas = (size * 2) / rect.width;
    const dx = (event.clientX - rect.left) * toCanvas - centerX;
    const dy = (event.clientY - rect.top) * toCanvas - centerY;
    return Math.hypot(dx, dy) <= buttonRadius;
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (clickToSpin === 'wheel' || (clickToSpin === 'button' && isOverButton(event))) spin();
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (clickToSpin !== 'button') return;
    event.currentTarget.style.cursor = isOverButton(event) && !locked ? 'pointer' : 'default';
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      spin();
    }
  };

  if (!canSpin) {
    console.warn('SpinWheel: at least 2 segments with segmentText are required.');
    return null;
  }

  return (
    <div style={wrapperStyle}>
      <canvas
        ref={canvasRef}
        role={interactive ? 'button' : 'img'}
        aria-label={`${interactive ? `${buttonText}: ` : ''}Wheel with ${segmentTextArray.length} segments: ${segmentTextArray.join(', ')}`}
        aria-disabled={interactive && locked ? true : undefined}
        tabIndex={interactive && !locked ? 0 : undefined}
        onKeyDown={interactive ? handleKeyDown : undefined}
        onMouseMove={handleMouseMove}
        width={Math.round(size * 2 * dpr)}
        height={Math.round(size * 2 * dpr)}
        onClick={handleClick}
        style={{
          borderRadius: '50%', // Circular shape
          ...(responsive
            ? { display: 'block', width: '100%', height: 'auto' }
            : { width: size * 2, height: size * 2 }),
          cursor: clickToSpin === 'wheel' && !locked ? 'pointer' : 'default',
          pointerEvents: locked ? 'none' : 'auto',
        }}
      />
      <div role="status" aria-live="polite" style={visuallyHidden}>
        {result && `Result: ${result}`}
      </div>
      {showTextOnSpin && isStarted &&
        <div style={{ textAlign: "center", padding: "20px", fontWeight: "bold", fontSize: "1.5em", fontFamily: fontFamily }}>
          {needleText}
        </div>}
    </div>
  );
});
SpinWheel.displayName = 'SpinWheel';

export default SpinWheel
