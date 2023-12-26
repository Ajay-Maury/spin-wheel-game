# spin-wheel-game

A React component for a customizable and interactive spinning wheel game. This npm package provides a visually appealing and interactive spin wheel game that can be easily integrated into your React applications.

## Installation

```bash
npm install spin-wheel-game
```

## Usage

```jsx
import React from 'react';
import { SpinWheel, ISpinWheelProps } from 'spin-wheel-game';

const segments = [
  { segmentText: 'Option 1', segColor: 'red' },
  { segmentText: 'Option 2', segColor: 'blue' },
  { segmentText: 'Option 3', segColor: 'green' },
  // Add more segments as needed
];

const MySpinWheel: React.FC = () => {
  const handleSpinFinish = (result: string) => {
    console.log(`Spun to: ${result}`);
    // Handle the result as needed
  };

  const spinWheelProps: ISpinWheelProps = {
    segments,
    onFinished: handleSpinFinish,
    primaryColor: 'black',
    contrastColor: 'white',
    buttonText: 'Spin',
    isOnlyOnce: true,
    size: 290,
    upDuration: 50,
    downDuration: 300,
    fontFamily: 'Arial',
    arrowLocation: 'center',
    showTextOnSpin: false,
  };

  return <SpinWheel {...spinWheelProps} />;
};

export default MySpinWheel;
```

## Props

- `segments`: An array of objects representing the segments of the wheel. Each object should have a `segmentText` property, and optionally a `segColor` property for specifying the segment color.

- `onFinished`: A callback function that will be called when the wheel stops spinning. It receives the result as a string.

- `primaryColor` (optional): The primary color of the wheel. Default is `'black'`.

- `contrastColor` (optional): The contrast color used for text and needle. Default is `'white'`.

- `buttonText` (optional): The text displayed in the center button of the wheel. Default is `'Spin'`.

- `isOnlyOnce` (optional): A boolean indicating whether the wheel can be spun only once. Default is `true`.

- `size` (optional): The size of the wheel in pixels. Default is `290`.

- `upDuration` (optional): The duration of the spin-up animation in milliseconds. Default is `50`.

- `downDuration` (optional): The duration of the spin-down animation in milliseconds. Default is `300`.

- `fontFamily` (optional): The font family used for text. Default is `'Arial'`.

- `arrowLocation` (optional): The location of the arrow on the needle, either `'center'` or `'top'`. Default is `'center'`.

- `showTextOnSpin` (optional): A boolean indicating whether to show the spun result text after spinning. Default is `false`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.