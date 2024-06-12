# spin-wheel-game

A React component for a customizable and interactive spinning wheel game. This npm package provides a visually appealing and interactive spin wheel game that can be easily integrated into your React applications.

## Demo

Check out the [live demo](https://spin-wheel-game-git-main-ajay-maury.vercel.app/) to see the spin wheel game in action!

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
    isOnlyOnce: false,
    size: 290,
    upDuration: 100,
    downDuration: 600,
    fontFamily: 'Arial',
    arrowLocation: 'top',
    showTextOnSpin: true,
    isSpinSound: true,
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

- `isOnlyOnce` (optional): A boolean indicating whether the wheel can be spun only once. Default is `false`.

- `size` (optional): The size of the wheel in pixels. Default is `290`.

- `upDuration` (optional): The duration of the spin-up animation in milliseconds. Default is `100`.

- `downDuration` (optional): The duration of the spin-down animation in milliseconds. Default is `600`.

- `fontFamily` (optional): The font family used for text. Default is `'Arial'`.

- `arrowLocation` (optional): The location of the arrow on the needle, either `'center'` or `'top'`. Default is `'top'`.

- `showTextOnSpin` (optional): A boolean indicating whether to show the spun result text after spinning. Default is `true`.

- `isSpinSound` (optional): A boolean indicating whether to play the spinning audio or not. Default is `true`.

## Contributing

We welcome contributions to improve this project! Please check out our [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to get started.

If you have any questions or need help, feel free to open an issue or reach out to the maintainers.

Thank you for your contributions!


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
