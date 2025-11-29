// ===================================
// GLOBAL VARIABLES
// ===================================

let map;
let markers = [];
let markerCluster;
let evacuationCenters = [];
let filteredCenters = [];
let userLocation = null;
let userMarker = null;
// Phase 4
let favorites = [];
let activeTab = 'all';
let maxDistance = 50;
let recentSearches = [];
let selectedCenters = [];
let routePlanningMode = false;

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    try {
        // Initialize map
        initializeMap();
        
        // Load data
        await loadEvacuationData();
        
        // Setup event listeners
        setupEventListeners();
        
        // Populate filters
        populateProvinceFilter();
        
        // Load favorites
        loadFavorites();
        
        // Load recent searches
        loadRecentSearches();
        displayRecentSearches();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
        }, 1000);
        
        showToast('App loaded successfully!', 'success');
    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Error loading data. Please refresh the page.', 'error');
    }
}

// ===================================
// MAP INITIALIZATION
// ===================================

function initializeMap() {
    // Initialize map centered on Philippines
    map = L.map('map', {
        center: [12.8797, 121.7740],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true
    });
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Initialize marker cluster
    markerCluster = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true
    });
    
    map.addLayer(markerCluster);
}

// ===================================
// DATA LOADING
// ===================================

async function loadEvacuationData() {
    try {
        const response = await fetch('src/data/ph_evacs_cleaned.geojson');
        const geojson = await response.json();
        
        // Extract features
        evacuationCenters = geojson.features.map(feature => ({
            id: feature.properties.id,
            name: feature.properties.name,
            type: feature.properties.type,
            city: feature.properties.city,
            municipality: feature.properties.municipality,
            province: feature.properties.province,
            capacity: feature.properties.capacity,
            lat: feature.geometry.type === 'Point' 
                ? feature.geometry.coordinates[1] 
                : getCentroid(feature.geometry).lat,
            lon: feature.geometry.type === 'Point' 
                ? feature.geometry.coordinates[0] 
                : getCentroid(feature.geometry).lon
        }));
        
        filteredCenters = [...evacuationCenters];
        
        // Update stats
        updateStats();
        
        // Display markers
        displayMarkers(filteredCenters);
        
        // Display results
        displayResults(filteredCenters);
        
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

function getCentroid(geometry) {
    // Simple centroid calculation for polygons
    if (geometry.type === 'Polygon') {
        const coords = geometry.coordinates[0];
        let lat = 0, lon = 0;
        coords.forEach(coord => {
            lon += coord[0];
            lat += coord[1];
        });
        return {
            lat: lat / coords.length,
            lon: lon / coords.length
        };
    }
    return { lat: 0, lon: 0 };
}

// ===================================
// MARKER DISPLAY
// ===================================

function displayMarkers(centers) {
    // Clear existing markers
    markerCluster.clearLayers();
    markers = [];
    
    centers.forEach(center => {
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-pin" style="background-color: ${getMarkerColor(center.type)}">
                      <i class="fas ${getMarkerIcon(center.type)}"></i>
                   </div>`,
            iconSize: [30, 40],
            iconAnchor: [15, 40],
            popupAnchor: [0, -40]
        });
        
        const marker = L.marker([center.lat, center.lon], { icon });
        
        // Create popup
        const popup = createPopup(center);
        marker.bindPopup(popup);
        
        // Add to cluster
        markerCluster.addLayer(marker);
        markers.push({ marker, center });
    });
}

function getMarkerColor(type) {
    const colors = {
        'Barangay Hall': '#3b82f6',
        'Campus': '#10b981',
        'Church': '#a855f7',
        'Field': '#f59e0b',
        'Hospital': '#ef4444',
        'Shelter': '#1e40af',
        'Sports Center': '#84cc16'
    };
    return colors[type] || '#6b7280';
}

function getMarkerIcon(type) {
    const icons = {
        'Barangay Hall': 'fa-home',
        'Campus': 'fa-graduation-cap',
        'Church': 'fa-church',
        'Field': 'fa-tree',
        'Hospital': 'fa-hospital',
        'Shelter': 'fa-shield-alt',
        'Sports Center': 'fa-futbol'
    };
    return icons[type] || 'fa-map-marker';
}

function createPopup(center) {
    const location = [center.city, center.municipality, center.province]
        .filter(Boolean)
        .join(', ');
    
    return `
        <div class="popup-content">
            <h3>${center.name}</h3>
            <div class="popup-info">
                <div><i class="fas fa-building"></i> ${center.type}</div>
                ${location ? `<div><i class="fas fa-map-marker-alt"></i> ${location}</div>` : ''}
                ${center.capacity ? `<div><i class="fas fa-users"></i> Capacity: ${center.capacity}</div>` : ''}
            </div>
            <button class="popup-btn" onclick="getDirections(${center.lat}, ${center.lon})">
                <i class="fas fa-directions"></i> Get Directions
            </button>
        </div>
    `;
}

// ===================================
// RESULTS DISPLAY
// ===================================

function displayResults(centers) {
    const resultsList = document.getElementById('results-list');
    
    if (centers.length === 0) {
        resultsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px;"></i>
                <p>No evacuation centers found</p>
            </div>
        `;
        return;
    }
    
    resultsList.innerHTML = centers.slice(0, 50).map(center => {
        const location = [center.city, center.municipality, center.province]
            .filter(Boolean)
            .join(', ');
        
        const distanceHtml = center.distance 
            ? `<div class="result-card-distance">
                  <i class="fas fa-location-arrow"></i>
                  ${center.distance.toFixed(2)} km away
               </div>`
            : '';
        
        const favorited = isFavorite(center.id);
        const favoriteIcon = favorited ? 'fa-solid fa-star' : 'fa-regular fa-star';
        const isSelected = selectedCenters.includes(center.id);
        
        return `
            <div class="result-card ${favorited ? 'favorited' : ''} ${isSelected ? 'selected' : ''}" data-center-id="${center.id}">
                <!-- Selection Checkbox -->
                <div class="selection-checkbox ${isSelected ? 'checked' : ''}" onclick="event.stopPropagation(); toggleSelection('${center.id}')">
                    <i class="fas fa-check"></i>
                </div>
                
                <div onclick="focusOnCenter(${center.lat}, ${center.lon}, '${center.name.replace(/'/g, "\\'")}')" style="cursor: pointer;">
                    <div class="result-card-header">
                        <div>
                            <h3>${center.name}</h3>
                            <div class="result-card-badge">${center.type}</div>
                        </div>
                    </div>
                    <div class="result-card-info">
                        ${location ? `<div><i class="fas fa-map-marker-alt"></i> ${location}</div>` : ''}
                        ${center.capacity ? `<div><i class="fas fa-users"></i> Capacity: ${center.capacity}</div>` : ''}
                    </div>
                    ${distanceHtml}
                </div>
                <button onclick='event.stopPropagation(); toggleFavorite("${center.id}")' 
                        style="margin-top: 12px; width: 100%; padding: 10px; background: ${favorited ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)'}; border: 1px solid ${favorited ? 'var(--warning)' : 'var(--border)'}; border-radius: 8px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; transition: var(--transition);"
                        onmouseover="this.style.background='var(--warning)'; this.style.color='white';"
                        onmouseout="this.style.background='${favorited ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)'}'; this.style.color='var(--text-primary)';">
                    <i class="${favoriteIcon}"></i>
                    ${favorited ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
            </div>
        `;
    }).join('');
    
    if (centers.length > 50) {
        resultsList.innerHTML += `
            <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                Showing first 50 of ${centers.length} results
            </div>
        `;
    }
}

// ===================================
// FILTER FUNCTIONALITY
// ===================================

function populateProvinceFilter() {
    const provinces = [...new Set(evacuationCenters.map(c => c.province).filter(Boolean))].sort();
    const select = document.getElementById('province-filter');
    
    provinces.forEach(province => {
        const option = document.createElement('option');
        option.value = province;
        option.textContent = province;
        select.appendChild(option);
    });
}

function applyFilters() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const province = document.getElementById('province-filter').value;
    const type = document.getElementById('type-filter').value;
    
    // Track search in recent searches
    if (search && search.trim().length >= 2) {
        addRecentSearch(search);
    }
    
    filteredCenters = evacuationCenters.filter(center => {
        // Search filter
        const matchesSearch = !search || 
            center.name.toLowerCase().includes(search) ||
            (center.city && center.city.toLowerCase().includes(search)) ||
            (center.municipality && center.municipality.toLowerCase().includes(search)) ||
            (center.province && center.province.toLowerCase().includes(search));
        
        // Province filter
        const matchesProvince = !province || center.province === province;
        
        // Type filter
        const matchesType = !type || center.type === type;
        
        return matchesSearch && matchesProvince && matchesType;
    });
    
    updateStats();
    displayMarkers(filteredCenters);
    displayResults(getDisplayCenters());
}

function updateStats() {
    document.getElementById('total-centers').textContent = evacuationCenters.length;
    document.getElementById('visible-centers').textContent = filteredCenters.length;
}

// ===================================
// GEOLOCATION
// ===================================

function findNearestCenters() {
    if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser', 'error');
        return;
    }
    
    showToast('Getting your location...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        position => {
            userLocation = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };
            
            // Add user marker
            if (userMarker) {
                map.removeLayer(userMarker);
            }
            
            const userIcon = L.divIcon({
                className: 'user-marker',
                html: '<div class="user-marker-pin"><i class="fas fa-location-dot"></i></div>',
                iconSize: [40, 40],
                iconAnchor: [20, 40]
            });
            
            userMarker = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon })
                .addTo(map)
                .bindPopup('Your Location');
            
            // Calculate distances
            calculateDistances();
            
            // Sort by distance
            filteredCenters.sort((a, b) => a.distance - b.distance);
            
            // Update display
            displayMarkers(filteredCenters);
            displayResults(filteredCenters);
            
            // Zoom to user location
            map.setView([userLocation.lat, userLocation.lon], 12);
            
            // Show info
            document.getElementById('user-location-info').style.display = 'flex';
            
            showToast(`Found ${filteredCenters.length} centers near you!`, 'success');
        },
        error => {
            console.error('Geolocation error:', error);
            showToast('Unable to get your location. Please enable location services.', 'error');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function calculateDistances() {
    if (!userLocation) return;
    
    filteredCenters.forEach(center => {
        center.distance = calculateDistance(
            userLocation.lat,
            userLocation.lon,
            center.lat,
            center.lon
        );
    });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

// ===================================
// MAP INTERACTIONS
// ===================================

function focusOnCenter(lat, lon, name) {
    map.setView([lat, lon], 16);
    
    // Find and open marker popup
    markers.forEach(({ marker, center }) => {
        if (center.lat === lat && center.lon === lon) {
            marker.openPopup();
        }
    });
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
    }
}

function getDirections(lat, lon) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    window.open(url, '_blank');
}

// ===================================
// EVENT LISTENERS
// ===================================

function setupEventListeners() {
    // Locate button
    document.getElementById('locate-btn').addEventListener('click', findNearestCenters);
    
    // Search and filters
    document.getElementById('search-input').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('province-filter').addEventListener('change', applyFilters);
    document.getElementById('type-filter').addEventListener('change', applyFilters);
    
    // Sidebar toggle (mobile)
    document.getElementById('mobile-sidebar-toggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('active');
    });
    
    document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('active');
    });
    
    // Info modal
    document.getElementById('info-btn').addEventListener('click', () => {
        document.getElementById('info-modal').classList.add('active');
    });
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('active');
        });
    });
    
    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Phase 4: Tabs
    document.querySelectorAll('.results-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all tabs
            document.querySelectorAll('.results-tab').forEach(t => t.classList.remove('active'));
            // Add active to clicked tab
            tab.classList.add('active');
            // Switch tab
            activeTab = tab.dataset.tab;
            
            // Show/hide favorites management buttons
            const favoritesManagement = document.getElementById('favorites-management');
            if (activeTab === 'favorites') {
                favoritesManagement.style.display = 'flex';
            } else {
                favoritesManagement.style.display = 'none';
            }
            
            displayResults(getDisplayCenters());
        });
    });
    
    // Phase 4: Favorites management
    const clearFavoritesBtn = document.getElementById('clear-favorites-btn');
    if (clearFavoritesBtn) {
        clearFavoritesBtn.addEventListener('click', clearAllFavorites);
    }
    
    const exportFavoritesBtn = document.getElementById('export-favorites-btn');
    if (exportFavoritesBtn) {
        exportFavoritesBtn.addEventListener('click', exportFavoritesToCSV);
    }
    
    // Phase 4: Distance filter
    const distanceFilter = document.getElementById('distance-filter');
    if (distanceFilter) {
        distanceFilter.addEventListener('input', (e) => {
            maxDistance = parseInt(e.target.value);
            document.getElementById('distance-value').textContent = maxDistance;
            if (userLocation) {
                displayResults(getDisplayCenters());
            }
        });
    }
    
    // Phase 4: Clear recent searches
    const clearSearchesBtn = document.getElementById('clear-searches-btn');
    if (clearSearchesBtn) {
        clearSearchesBtn.addEventListener('click', clearRecentSearches);
    }
    
    // Phase 4: Route planning
    const routeModeToggle = document.getElementById('route-mode-toggle');
    if (routeModeToggle) {
        routeModeToggle.addEventListener('click', toggleRoutePlanningMode);
    }
    
    const planRouteBtn = document.getElementById('plan-route-btn');
    if (planRouteBtn) {
        planRouteBtn.addEventListener('click', planRoute);
    }
    
    // Load saved theme
    loadTheme();
}

// ===================================
// THEME TOGGLE
// ===================================

function toggleTheme() {
    const body = document.body;
    const icon = document.querySelector('#theme-toggle i');
    
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-theme');
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    }
}

function loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.querySelector('#theme-toggle i').classList.replace('fa-moon', 'fa-sun');
    }
}

// ===================================
// TOAST NOTIFICATIONS
// ===================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===================================
// PHASE 4: FAVORITES & ADVANCED FILTERS
// ===================================

function loadFavorites() {
    const saved = localStorage.getItem('evacufinder_favorites');
    favorites = saved ? JSON.parse(saved) : [];
    updateFavoritesCount();
}

function saveFavorites() {
    localStorage.setItem('evacufinder_favorites', JSON.stringify(favorites));
    updateFavoritesCount();
}

function toggleFavorite(centerId) {
    const index = favorites.indexOf(centerId);
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('Removed from favorites', 'info');
    } else {
        favorites.push(centerId);
        showToast('Added to favorites!', 'success');
    }
    saveFavorites();
    displayResults(getDisplayCenters());
}

function isFavorite(centerId) {
    return favorites.includes(centerId);
}

function updateFavoritesCount() {
    document.getElementById('favorites-count').textContent = favorites.length;
}

function getDisplayCenters() {
    if (activeTab === 'favorites') {
        return filteredCenters.filter(center => isFavorite(center.id));
    }
    // Apply distance filter if user location exists
    if (userLocation && maxDistance < 100) {
        return filteredCenters.filter(center => !center.distance || center.distance <= maxDistance);
    }
    return filteredCenters;
}

// ===================================
// RECENT SEARCHES
// ===================================

function loadRecentSearches() {
    const saved = localStorage.getItem('evacufinder_recent_searches');
    recentSearches = saved ? JSON.parse(saved) : [];
}

function saveRecentSearches() {
    localStorage.setItem('evacufinder_recent_searches', JSON.stringify(recentSearches));
}

function addRecentSearch(query) {
    if (!query || query.trim().length < 2) return;
    
    // Remove if already exists
    const index = recentSearches.indexOf(query);
    if (index > -1) {
        recentSearches.splice(index, 1);
    }
    
    // Add to beginning
    recentSearches.unshift(query);
    
    // Keep only last 5
    if (recentSearches.length > 5) {
        recentSearches = recentSearches.slice(0, 5);
    }
    
    saveRecentSearches();
    displayRecentSearches();
}

function displayRecentSearches() {
    const container = document.getElementById('recent-searches');
    const list = document.getElementById('recent-searches-list');
    
    if (recentSearches.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    list.innerHTML = recentSearches.map(search => `
        <div class="recent-search-item" onclick="fillSearch('${search.replace(/'/g, "\\'")}')">
            <i class="fas fa-clock-rotate-left"></i>
            <span>${search}</span>
        </div>
    `).join('');
}

function fillSearch(query) {
    document.getElementById('search-input').value = query;
    applyFilters();
}

    showToast('Recent searches cleared', 'info');
}

// ===================================
// FAVORITES MANAGEMENT
// ===================================

function clearAllFavorites() {
    if (favorites.length === 0) {
        showToast('No favorites to clear', 'info');
        return;
    }
    
    if (confirm(`Clear all ${favorites.length} favorite(s)?`)) {
        favorites = [];
        saveFavorites();
        displayResults(getDisplayCenters());
        showToast('All favorites cleared', 'success');
    }
}

function exportFavoritesToCSV() {
    if (favorites.length === 0) {
        showToast('No favorites to export', 'info');
        return;
    }
    
    // Get favorite centers
    const favoriteCenters = evacuationCenters.filter(center => isFavorite(center.id));
    
    // CSV headers
    let csv = 'Name,Type,Province,Municipality,City,Capacity,Latitude,Longitude\n';
    
    // Add data rows
    favoriteCenters.forEach(center => {
        csv += `"${center.name}","${center.type}","${center.province || ''}","${center.municipality || ''}","${center.city || ''}","${center.capacity || ''}",${center.lat},${center.lon}\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evacufinder-favorites-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast(`Exported ${favoriteCenters.length} favorite(s) to CSV`, 'success');
}

// ===================================
// MULTI-SELECT & ROUTE PLANNING
// ===================================

function toggleSelection(centerId) {
    const index = selectedCenters.indexOf(centerId);
    if (index > -1) {
        selectedCenters.splice(index, 1);
    } else {
        selectedCenters.push(centerId);
    }
    
    updateSelectedCount();
    displayResults(getDisplayCenters());
}

function updateSelectedCount() {
    const count = selectedCenters.length;
    document.getElementById('selected-count').textContent = count;
    
    const planRouteBtn = document.getElementById('plan-route-btn');
    if (count >= 2) {
        planRouteBtn.disabled = false;
    } else {
        planRouteBtn.disabled = true;
    }
}

function toggleRoutePlanningMode() {
    routePlanningMode = !routePlanningMode;
    
    const resultsSection = document.querySelector('.results-section');
    const routeModeBtn = document.getElementById('route-mode-toggle');
    const planRouteBtn = document.getElementById('plan-route-btn');
    
    if (routePlanningMode) {
        resultsSection.classList.add('route-planning-mode');
        routeModeBtn.classList.add('active');
        routeModeBtn.innerHTML = '<i class="fas fa-times"></i><span>Cancel Selection</span>';
        planRouteBtn.style.display = 'flex';
    } else {
        resultsSection.classList.remove('route-planning-mode');
        routeModeBtn.classList.remove('active');
        routeModeBtn.innerHTML = '<i class="fas fa-route"></i><span>Select for Route</span>';
        planRouteBtn.style.display = 'none';
        // Clear selections
        selectedCenters = [];
        updateSelectedCount();
        displayResults(getDisplayCenters());
    }
}

function planRoute() {
    if (selectedCenters.length < 2) {
        showToast('Please select at least 2 centers', 'warning');
        return;
    }
    
    // Get selected centers data
    const centers = evacuationCenters.filter(c => selectedCenters.includes(c.id));
    
    // Sort by distance if user location exists
    if (userLocation) {
        centers.sort((a, b) => {
            const distA = a.distance || 9999;
            const distB = b.distance || 9999;
            return distA - distB;
        });
    }
    
    // Build Google Maps URL with waypoints
    let url = 'https://www.google.com/maps/dir/';
    
    // Add origin (user location or first center)
    if (userLocation) {
        url += `${userLocation.lat},${userLocation.lon}/`;
    }
    
    // Add waypoints
    centers.forEach(center => {
        url += `${center.lat},${center.lon}/`;
    });
    
    // Open in new tab
    window.open(url, '_blank');
    
    showToast(`Planning route for ${centers.length} centers`, 'success');
    
    // Reset
    toggleRoutePlanningMode();
}

// ===================================
// RECENT SEARCHES
// ===================================

function loadRecentSearches() {
    const saved = localStorage.getItem('evacufinder_recent_searches');
    recentSearches = saved ? JSON.parse(saved) : [];
}

function saveRecentSearches() {
    localStorage.setItem('evacufinder_recent_searches', JSON.stringify(recentSearches));
}

function addRecentSearch(query) {
    if (!query || query.trim().length < 2) return;
    
    // Remove if already exists
    const index = recentSearches.indexOf(query);
    if (index > -1) {
        recentSearches.splice(index, 1);
    }
    
    // Add to beginning
    recentSearches.unshift(query);
    
    // Keep only last 5
    if (recentSearches.length > 5) {
        recentSearches = recentSearches.slice(0, 5);
    }
    
    saveRecentSearches();
    displayRecentSearches();
}

function displayRecentSearches() {
    const container = document.getElementById('recent-searches');
    const list = document.getElementById('recent-searches-list');
    
    if (recentSearches.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    list.innerHTML = recentSearches.map(search => `
        <div class="recent-search-item" onclick="fillSearch('${search.replace(/'/g, "\\'")}')">
            <i class="fas fa-clock-rotate-left"></i>
            <span>${search}</span>
        </div>
    `).join('');
}

function fillSearch(query) {
    document.getElementById('search-input').value = query;
    applyFilters();
}

function clearRecentSearches() {
    recentSearches = [];
    saveRecentSearches();
    displayRecentSearches();
    showToast('Recent searches cleared', 'info');
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add custom marker styles
const style = document.createElement('style');
style.textContent = `
    .custom-marker {
        background: none;
        border: none;
    }
    
    .marker-pin {
        width: 30px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        position: relative;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }
    
    .marker-pin i {
        transform: rotate(45deg);
        color: white;
        font-size: 14px;
    }
    
    .user-marker {
        background: none;
        border: none;
    }
    
    .user-marker-pin {
        width: 40px;
        height: 40px;
        background: #ef4444;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s ease-in-out infinite;
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    }
    
    .user-marker-pin i {
        color: white;
        font-size: 20px;
    }
    
    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
        }
        70% {
            box-shadow: 0 0 0 20px rgba(239, 68, 68, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
        }
    }
`;
document.head.appendChild(style);
