import { useState } from 'react';
import "./App.css"
import { ISegments, ISpinWheelProps, SpinWheel } from '.';

function App() {
  const [spinResult, setSpinResult] = useState<string>("")

  const segments: ISegments[] = [
    { segmentText: "better luck next time", segColor: "#EE4040" },
    { segmentText: "won 70", segColor: "#F0CF50" },
    { segmentText: "won 10", segColor: "#815CD1" },
    { segmentText: "better luck next time", segColor: "#3DA5E0" },
    { segmentText: "won 6", segColor: "#34A24F" },
    { segmentText: "won uber pass", segColor: "#34A246" },
  ];

  const handleSpinFinish = (value: string) => {
    console.log('value:', value)
    setSpinResult(value)
  }

  const spinWheelProps: ISpinWheelProps = {
    segments,
    onFinished: handleSpinFinish,
    primaryColor: 'black',
    contrastColor: 'white',
    buttonText: 'Spin',
    isOnlyOnce: false,
    size: 290,
    upDuration: 100,
    downDuration: 600,
    fontFamily: 'Arial',
    arrowLocation: 'top',
    showTextOnSpin: true,
    isSpinSound: true,
  };

  return (
    <>
      <h1 className='textBox'>Spin Wheel Game</h1>
      <div className='spinWheelBox'>
        <SpinWheel {...spinWheelProps}
        />
      </div>
      {spinResult && <h1 className='textBox'> Spin Result:- {spinResult}</h1>}
    </>
  )
}

export default App
