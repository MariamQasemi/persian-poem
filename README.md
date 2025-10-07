# Persian Poetry Search Frontend

A Vue 3 application for searching Persian literature, similar to Ganjoor. This frontend provides a clean and responsive interface for searching through a collection of Persian poems.

## Features

- **Search Functionality**: Search for poems by entering words or phrases
- **Poet Filtering**: Filter results by specific poets
- **Responsive Design**: Clean, modern UI that works on all devices
- **Poet Details**: View detailed information about individual poets
- **State Management**: Centralized state management with Pinia
- **Routing**: Client-side routing with Vue Router

## Technology Stack

- **Vue 3** with Composition API
- **Vite** for build tooling
- **Vue Router 4** for routing
- **Pinia** for state management
- **CSS3** for styling with RTL support

## Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── SearchBar.vue   # Search input component
│   ├── FilterPanel.vue # Poet filtering component
│   └── ResultList.vue  # Search results display
├── views/              # Page components
│   ├── HomePage.vue    # Main search page
│   └── PoetDetailPage.vue # Individual poet page
├── stores/             # Pinia stores
│   └── search.js       # Search state management
├── services/           # API services
│   └── api.js          # Backend communication
├── router/             # Vue Router configuration
│   └── index.js        # Route definitions
└── assets/             # Static assets
```


### Prerequisites

- Node.js (version 20.19.0 or higher)
- npm or yarn





