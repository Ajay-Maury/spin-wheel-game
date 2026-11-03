import { useCallback, useEffect, useRef, useState } from 'react';
import tickingSound from "../assets/audio/spin-wheel-sound.mp3"
import { ISpinWheelProps } from './SpinWheel.interface';

const SpinWheel: React.FC<ISpinWheelProps> = ({
  segments,
  onFinished,
  primaryColor = 'black',
  contrastColor = 'white',
  buttonText = 'Spin',
  isOnlyOnce = false,
  size = 290,
  upDuration = 100,
  downDuration = 600,
  fontFamily = 'Arial',
  arrowLocation = 'center',
  showTextOnSpin = true,
  isSpinSound = true
}: ISpinWheelProps) => {
  // Separate arrays without nullish values
  const segmentTextArray = segments.map((segment) => segment.segmentText).filter(Boolean);
  const segColorArray = segments.map((segment) => segment.segColor).filter(Boolean);

  const [isFinished, setFinished] = useState<boolean>(false);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [needleText, setNeedleText] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ticTicSoundRef = useRef<HTMLAudioElement | null>(null);
  const timerHandleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const angleCurrentRef = useRef(0);
  const spinStartRef = useRef(0);

  const timerDelay = segmentTextArray.length;
  const upTime = segmentTextArray.length * upDuration;
  const downTime = segmentTextArray.length * downDuration;
  const maxSpeed = Math.PI / segmentTextArray.length;
  const centerX = size;
  const centerY = size;

  const drawSegment = (ctx: CanvasRenderingContext2D, key: number, lastAngle: number, angle: number) => {
    const value = segmentTextArray[key]
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, size, lastAngle, angle, false)
    ctx.lineTo(centerX, centerY)
    ctx.closePath()
    ctx.fillStyle = segColorArray[key] as string
    ctx.fill()
    ctx.stroke()
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((lastAngle + angle) / 2)
    ctx.fillStyle = contrastColor
    ctx.font = 'bold 1em ' + fontFamily
    ctx.fillText(value.substring(0, 21), size / 2 + 20, 0)
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
    ctx.font = '1em ' + fontFamily
    for (let i = 1; i <= len; i++) {
      const angle = PI2 * (i / len) + angleCurrentRef.current
      drawSegment(ctx, i - 1, lastAngle, angle)
      lastAngle = angle
    }

    // Draw a center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 30, 0, PI2, false)
    ctx.closePath()
    ctx.fillStyle = primaryColor
    ctx.lineWidth = 2
    ctx.strokeStyle = contrastColor
    ctx.fill()
    ctx.font = 'bold 1em ' + fontFamily
    ctx.fillStyle = contrastColor
    ctx.textAlign = 'center'
    ctx.fillText(buttonText, centerX, centerY + 3)
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
      ctx.moveTo(centerX + 20, centerY / 15)
      ctx.lineTo(centerX - 20, centerY / 15)
      ctx.lineTo(centerX, centerY - (centerY / 1.35))
    } else {
      ctx.moveTo(centerX + 20, centerY - 30)
      ctx.lineTo(centerX - 20, centerY - 30)
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
    if (!ctx) return ''
    ctx.clearRect(0, 0, size * 2, size * 2)
    drawWheel(ctx)
    return drawNeedle(ctx)
  }

  // The interval and the click handler outlive the render that created them,
  // so they always call the latest draw function and callback through refs.
  const wheelDrawRef = useRef(wheelDraw);
  wheelDrawRef.current = wheelDraw;
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  const stopTimer = useCallback(() => {
    if (timerHandleRef.current !== null) {
      clearInterval(timerHandleRef.current);
      timerHandleRef.current = null;
    }
  }, []);

  const stopSound = useCallback(() => {
    const sound = ticTicSoundRef.current;
    if (sound) {
      sound.pause(); // Pause tic-tic sound when the wheel stops spinning
      sound.currentTime = 0; // Reset the tic-tic sound to the beginning
    }
  }, []);

  const onTimerTick = () => {
    const currentSegment = wheelDrawRef.current();
    setNeedleText(currentSegment);

    const duration = new Date().getTime() - spinStartRef.current;
    let progress = 0;
    let angleDelta = 0;
    let finished = false;

    if (duration < upTime) {
      progress = duration / upTime;
      angleDelta = maxSpeed * Math.sin((progress * Math.PI) / 2);
    }
    else {
      progress = duration / downTime;
      angleDelta =
        maxSpeed * Math.sin((progress * Math.PI) / 2 + Math.PI / 2);
      if (progress >= 1) finished = true;
    }

    angleCurrentRef.current += angleDelta;
    while (angleCurrentRef.current >= Math.PI * 2) angleCurrentRef.current -= Math.PI * 2;
    if (finished) {
      stopTimer();
      stopSound();
      setFinished(true);
      onFinishedRef.current(currentSegment);
    }
  };

  const spin = () => {
    setIsStarted(true);
    if (timerHandleRef.current === null) {
      setFinished(false);
      spinStartRef.current = new Date().getTime();
      timerHandleRef.current = setInterval(onTimerTick, timerDelay * 5);
    }
  };

  useEffect(() => {
    ticTicSoundRef.current = new Audio(tickingSound);
    window.scrollTo(0, 1);
    return () => {
      stopTimer();
      stopSound();
      ticTicSoundRef.current = null;
    };
  }, [stopTimer, stopSound]);

  // Redraw whenever the wheel's appearance changes (props, or a new spin position)
  const segmentsKey = JSON.stringify(segments);
  useEffect(() => {
    setNeedleText(wheelDraw());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentsKey, primaryColor, contrastColor, buttonText, size, fontFamily, arrowLocation]);

  useEffect(() => {
    const sound = ticTicSoundRef.current;
    if (!sound) return;
    sound.currentTime = 0;
    if (needleText && isSpinSound && isStarted && !isFinished) {
      sound.play().catch(() => { /* autoplay may be blocked */ });
    } else {
      sound.pause();
    }
  }, [needleText, isSpinSound, isStarted, isFinished]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={size * 2}
        height={size * 2}
        onClick={spin}
        style={{
          borderRadius: '50%', // Circular shape
          pointerEvents: isFinished && isOnlyOnce ? 'none' : 'auto',
        }}
      />
      {showTextOnSpin && isStarted &&
        <div style={{ textAlign: "center", padding: "20px", fontWeight: "bold", fontSize: "1.5em", fontFamily: fontFamily }}>
          {needleText}
        </div>}
    </div>
  );
};

export default SpinWheel
