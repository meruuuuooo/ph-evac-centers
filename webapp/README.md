# EvacuFinder PH 🛡️

**Find the nearest evacuation centers in the Philippines during emergencies**

A modern, mobile-first web application that helps Filipinos quickly locate evacuation centers during natural disasters and emergencies.

![EvacuFinder PH](https://img.shields.io/badge/status-active-success)
![Made with Love](https://img.shields.io/badge/made%20with-❤️-red)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- 📍 **GPS-Based Location** - Find nearest centers using your current location
- 🗺️ **Interactive Map** - View 1,500+ evacuation centers on an interactive map
- 🔍 **Smart Search & Filters** - Search by name, province, or center type
- 📱 **Mobile-First Design** - Optimized for smartphones and tablets
- 🌓 **Dark Mode** - Eye-friendly dark theme
- 🚶 **Get Directions** - Integrated with Google Maps for turn-by-turn navigation
- ⚡ **Fast & Lightweight** - Quick load times, even on slow connections
- 🔒 **Privacy-Focused** - No data collection, location stays on your device

## 🚀 Quick Start

### Option 1: Open Locally

1. **Clone or download** this repository
2. **Navigate** to the `webapp` folder
3. **Open** `index.html` in your web browser
4. **Allow location access** for the best experience

### Option 2: Using Live Server (Recommended)

```bash
# Using Python
cd webapp
python -m http.server 8000

# Using Node.js
npx serve webapp

# Using VS Code Live Server
# Right-click index.html → "Open with Live Server"
```

Then open `http://localhost:8000` in your browser.

## 📁 File Structure

```
webapp/
├── index.html          # Main HTML file
├── styles.css          # Styling and design
├── app.js              # JavaScript functionality
├── manifest.json       # PWA manifest
└── README.md           # This file
```

## 🎯 How to Use

### Finding Nearest Centers

1. Click the **"Find Nearest Centers"** button
2. Allow browser to access your location
3. View the nearest evacuation centers sorted by distance
4. Click any center for more details and directions

### Searching & Filtering

- **Search Box**: Type a name, city, or municipality
- **Province Filter**: Select a specific province
- **Type Filter**: Filter by center type (Barangay Hall, Campus, Shelter, etc.)

### Getting Directions

1. Click on any evacuation center marker on the map
2. Click **"Get Directions"** in the popup
3. Opens Google Maps with turn-by-turn directions

## 🏢 Evacuation Center Types

| Type | Description |
|------|-------------|
| **Barangay Hall** | Local government halls |
| **Campus** | Schools, colleges, universities |
| **Church** | Places of worship |
| **Field** | Open fields and grounds |
| **Hospital** | Medical facilities |
| **Shelter** | Dedicated evacuation shelters |
| **Sports Center** | Covered courts, sports complexes |

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **JavaScript** - Vanilla JS (no frameworks)
- **Leaflet.js** - Interactive maps
- **OpenStreetMap** - Map tiles and data
- **Font Awesome** - Icons
- **Google Fonts** - Inter font family

## 📊 Data Source

Evacuation center data is sourced from **OpenStreetMap** (OSM) via the Overpass Turbo API. The dataset includes over 1,500 evacuation centers across the Philippines.

> **Note**: The dataset may not be complete and some information might be outdated. Always verify with local authorities during actual emergencies.

## 🌐 Browser Support

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 PWA (Progressive Web App)

EvacuFinder PH can be installed as a mobile app:

**On Mobile:**
1. Open in Chrome/Safari
2. Tap "Add to Home Screen"
3. Launch like a native app

**On Desktop:**
1. Look for install icon in address bar
2. Click "Install" prompt
3. Use as a standalone app

## ⚠️ Disclaimer

This application is for **informational purposes only**. During actual emergencies:

- Always follow official government advisories
- Verify center availability with local authorities
- Check NDRRMC and local disaster management offices
- Call emergency hotlines (911, Red Cross 143)

## 🤝 Contributing

Contributions are welcome! To improve the app:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Emergency Hotlines (Philippines)

- **NDRRMC**: 911
- **Red Cross**: 143
- **PAGASA**: (02) 434-0294

## 📄 License

MIT License - See LICENSE file for details

## 💡 Future Enhancements

- [ ] Real-time capacity updates
- [ ] Weather alerts integration (PAGASA API)
- [ ] Multi-language support (Tagalog, Bisaya)
- [ ] Offline map caching
- [ ] Community reports and ratings
- [ ] SMS notification system
- [ ] Admin dashboard for LGUs

## 🙏 Acknowledgments

- OpenStreetMap contributors for evacuation center data
- Leaflet.js for mapping functionality
- Font Awesome for icons
- All volunteers who help during disasters

---

**Made with ❤️ for disaster preparedness in the Philippines**

Stay safe! 🛡️🇵🇭
