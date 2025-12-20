# OpenCode Mobile - SSE Events App

A React Native mobile application that connects to a Server-Sent Events (SSE) server and displays real-time events.

## Features

- Connect to SSE endpoints
- Display real-time events in a scrollable list
- Connection status monitoring
- Error handling and display

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

### Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/opencode-mobile.git
   cd opencode-mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Run on iOS:
   ```bash
   npm run ios
   # or
   yarn ios
   ```

5. Run on Android:
   ```bash
   npm run android
   # or
   yarn android
   ```

## Configuration

To connect to your SSE endpoint, modify the URL in `src/screens/EventScreen.js`:

```javascript
const eventSource = new EventSource('https://your-sse-endpoint.com/events');
```

## Project Structure

```
/
├── App.js                  # Main application entry point
├── package.json            # Project dependencies and scripts
├── src/
│   ├── screens/
│   │   └── EventScreen.js  # Main screen with SSE functionality
│   └── components/         # Reusable components
└── assets/                # Static assets (images, fonts, etc.)
```

## Dependencies

- `expo`: React Native framework
- `event-source-polyfill`: Polyfill for Server-Sent Events in React Native
- `react-native`: Core React Native library

## Running the App

### Development Mode

```bash
npm start
```

This will start the Expo development server and open the Metro bundler.

### Production Build

For iOS:
```bash
npx expo prebuild -p ios
easy build:ios
```

For Android:
```bash
npx expo prebuild -p android
easy build:android
```

## Testing

You can test the SSE connection by running a local SSE server or using a public test endpoint like:

```javascript
const eventSource = new EventSource('https://sse.example.com/stream');
```

## Troubleshooting

### Common Issues

1. **Connection errors**: Ensure your SSE endpoint is accessible and CORS is properly configured.

2. **EventSource not working**: Make sure you're using the polyfill and the endpoint supports SSE.

3. **App not updating**: Press `r` in the terminal to reload the app or `R` to force a full reload.

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
