# 🚲 YOLO - Bike Sharing App

A modern, mobile-first bike sharing application with an Uber-inspired dark theme UI. Built with React and Vite for lightning-fast performance.

![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **🗺️ Interactive Map** - Find nearby bikes with Google Maps integration
- **📱 QR Code Scanner** - Unlock bikes by scanning QR codes
- **🔐 Secure Authentication** - JWT-based login and registration
- **💳 Digital Wallet** - Manage balance and view ride costs
- **📊 Ride History** - Track all your past rides
- **🌙 Dark Theme** - Premium Uber-inspired dark UI

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **Vite** | Build Tool |
| **React Router** | Navigation |
| **Context API** | State Management |
| **Google Maps API** | Map Integration |
| **CSS3** | Styling |

## 📁 Project Structure

```
yolo-UI/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── layout/        # MainLayout, Navigation
│   │   ├── map/           # MapView with bike markers
│   │   └── ui/            # Buttons, Cards, Inputs
│   ├── context/           # AppContext for global state
│   ├── pages/             # Page components
│   │   ├── LandingPage    # Welcome screen
│   │   ├── AuthPage       # Login/Signup
│   │   ├── HomePage       # Map & bike discovery
│   │   ├── RidesPage      # Ride history
│   │   └── ProfilePage    # User profile & wallet
│   ├── services/          # API service layer
│   └── types/             # App constants & types
├── public/                # Static assets
└── index.html            
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/kadamsahil2511/Yolo-Yulu-Clone.git

# Navigate to frontend directory
cd yolo-UI

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=https://your-api-url.com
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

## 📱 App Flow

```
Landing Page → Auth (Login/Signup) → Home (Map View)
                                         ↓
                              ┌──────────┴──────────┐
                              ↓                     ↓
                         Rides Page           Profile Page
```

1. **Landing Page** - Welcome screen with "Get Started" CTA
2. **Auth Page** - Toggle between Login and Signup
3. **Home Page** - Interactive map with available bikes
4. **Rides Page** - View active and past rides
5. **Profile Page** - Manage account and wallet

## 🔗 API Integration

The app connects to a Node.js/Express backend:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/users/register` | POST | Create new account |
| `/users/login` | POST | Authenticate user |
| `/users/profile` | GET | Fetch user profile |
| `/bikes` | GET | Get available bikes |
| `/bikes/nearby` | GET | Get bikes near location |
| `/rides/unlock` | POST | Start a new ride |
| `/rides/:id/end` | PUT | End active ride |

## 🎨 Design System

- **Primary Color**: `#00DC82` (Green)
- **Background**: `#000000` (True Black)
- **Surface**: `#1A1A1A` (Dark Gray)
- **Text**: `#FFFFFF` / `#888888`
- **Font**: Inter, system fonts

## 📦 Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Sahil Kadam**

- GitHub: [@kadamsahil2511](https://github.com/kadamsahil2511)

---

<p align="center">
  Made with ❤️ for the future of urban mobility
</p>
