# Modern Chat Room

A modern, real-time chat application built with React, Socket.IO, and styled with Tailwind CSS. Features a Vercel-inspired design with dark mode support, responsive layout, and smooth animations.

## Features

- 🚀 **Real-time messaging** with Socket.IO
- 🎨 **Modern Vercel-style design** with Tailwind CSS
- 🌙 **Dark mode support** with persistent theme
- 📱 **Fully responsive** for mobile and desktop
- ✨ **Smooth animations** with Framer Motion
- 🔒 **Private and public rooms** with password protection
- 👥 **User management** with admin controls
- 💬 **Typing indicators** with animated dots
- 🎯 **Toast notifications** for better UX
- ⚡ **Performance optimized** with memoization

## Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React (icons)
- React Hot Toast
- Socket.IO Client

### Backend

- Node.js
- Express
- Socket.IO
- Nanoid (for room IDs)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd chat-room
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the server**

   ```bash
   cd server
   npm run dev
   ```

   The server will run on `http://localhost:3000`

2. **Start the client** (in a new terminal)

   ```bash
   cd client
   npm run dev
   ```

   The client will run on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

## Usage

### Creating a Room

1. Enter your name
2. Choose between Public or Private room
3. For private rooms, set a password
4. Click "Create Room"
5. Share the Room ID with others

### Joining a Room

1. Enter your name
2. Enter the Room ID
3. For private rooms, enter the password
4. Click "Join Room"

### Features

- **Real-time messaging**: Messages appear instantly
- **Typing indicators**: See when others are typing
- **User management**: Admins can kick users
- **Dark mode**: Toggle between light and dark themes
- **Responsive design**: Works on all screen sizes
- **Copy Room ID**: Easy sharing with one click

## Project Structure

```
chat-room/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main app component
│   │   └── index.css       # Global styles
│   ├── tailwind.config.js  # Tailwind configuration
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js           # Server entry point
│   └── package.json
└── README.md
```

## Customization

### Styling

The app uses Tailwind CSS with custom Vercel-inspired colors defined in `tailwind.config.js`. You can customize:

- Colors in the `theme.extend.colors` section
- Animations in the `theme.extend.animation` section
- Component styles in `src/index.css`

### Features

- Add new message types
- Implement file sharing
- Add emoji reactions
- Create user profiles
- Add message search

## Performance Optimizations

- **Message virtualization**: Only renders last 50 messages
- **Memoized components**: Prevents unnecessary re-renders
- **Optimized animations**: Smooth 60fps animations
- **Efficient state management**: Minimal re-renders

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Design inspired by Vercel's modern aesthetic
- Icons by Lucide React
- Animations by Framer Motion
- Real-time functionality by Socket.IO
