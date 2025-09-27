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

## Getting Started

### Prerequisites

- Node.js (version 20.19.0 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Search for Poems

1. Enter a word or phrase in the search bar
2. Click "جستجو" (Search) or press Enter
3. View the results showing matching poems with poet names and verses

### Filter by Poet

1. Use the filter panel to select specific poets
2. Search results will be filtered to show only poems from selected poets
3. Clear filters using the "پاک کردن همه" (Clear All) button

### View Poet Details

1. Click on a poet's name in the search results
2. Navigate to the poet's detail page to see more information
3. Use the back button to return to search

## API Integration

The application is designed to work with a backend API. Currently, it uses mock data for development. To connect to a real backend:

1. Update the `API_BASE_URL` in `src/services/api.js`
2. Uncomment the actual API calls in the components
3. Comment out the mock data calls

### Expected API Endpoints

- `GET /api/search?query={query}&poets={poets}` - Search for poems
- `GET /api/poets` - Get list of poets
- `GET /api/poets/{id}` - Get poet details

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style

- Uses Vue 3 Composition API
- RTL (Right-to-Left) text support for Persian content
- Responsive design with mobile-first approach
- Clean, modular component structure

## Future Enhancements

- Advanced search filters (date range, poem type, etc.)
- User authentication and favorites
- Poem sharing functionality
- Advanced text analysis features
- Dark mode support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.