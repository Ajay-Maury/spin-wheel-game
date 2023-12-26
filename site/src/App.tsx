import { useState } from 'react';
import "./App.css"
import { ISegments, SpinWheel } from '.';

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

  const onFinished = (value: string) => {
    console.log('value:', value)
    setSpinResult(value)
  }
  return (
    <>
      <h1 className='textBox'>Spin Wheel Game</h1>
      <div className='spinWheelBox'>
        <SpinWheel
          segments={segments}
          onFinished={(winner: string) => onFinished(winner)}
          primaryColor='black'
          contrastColor='white'
          buttonText='Spin'
          isOnlyOnce={false}
          size={220}
          upDuration={50}
          downDuration={300}
          fontFamily='Arial'
          arrowLocation='top'
          showTextOnSpin={true}
        />
      </div>
      {spinResult && <h1 className='textBox'> Spin Result:- {spinResult}</h1>}
    </>
  )
}

export default App
