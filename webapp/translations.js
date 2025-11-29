// ===================================
// TRANSLATIONS
// ===================================

const translations = {
    en: {
        // Header
        appName: 'EvacuFinder PH',
        
        // Sidebar
        findCenters: 'Find Evacuation Centers',
        findNearest: 'Find Nearest Centers',
        searchPlaceholder: 'Search by name or location...',
        province: 'Province',
        allProvinces: 'All Provinces',
        type: 'Type',
        allTypes: 'All Types',
        exportCSV: 'Export CSV',
        print: 'Print',
        totalCenters: 'Total Centers',
        showing: 'Showing',
        evacuationCenters: 'Evacuation Centers',
        
        // Center Types
        'Barangay Hall': 'Barangay Hall',
        'Campus': 'Campus',
        'Church': 'Church',
        'Field': 'Field',
        'Hospital': 'Hospital',
        'Shelter': 'Shelter',
        'Sports Center': 'Sports Center',
        
        // Result Cards
        shareCenter: 'Share Center',
        capacity: 'Capacity',
        small: 'Small',
        medium: 'Medium',
        large: 'Large',
        kmAway: 'km away',
        
        // Popup
        getDirections: 'Get Directions',
        
        // Share Modal
        share: 'Share',
        copyLink: 'Copy Link',
        email: 'Email',
        sms: 'SMS',
        
        // Info Modal
        about: 'About EvacuFinder PH',
        features: 'Features',
        dataSource: 'Data Source',
        emergencyHotlines: 'Emergency Hotlines',
        disclaimer: 'Disclaimer',
        disclaimerText: 'This app is for informational purposes only. Always follow official government advisories during disasters.',
        
        // Toast Messages
        appLoaded: 'App loaded successfully!',
        gettingLocation: 'Getting your location...',
        centersNearYou: 'centers near you!',
        geolocationNotSupported: 'Geolocation is not supported by your browser',
        locationError: 'Unable to get your location. Please enable location services.',
        csvExported: 'Exported',
        csvExportedSuffix: 'centers to CSV!',
        exportError: 'Failed to export CSV. Please try again.',
        linkCopied: 'Link copied to clipboard!',
        preparingPrint: 'Preparing map for printing...',
        offlineMode: 'You are offline. Some features may be limited.',
        backOnline: 'You are back online!',
        
        // Results
        noResults: 'No evacuation centers found',
        showingFirst: 'Showing first',
        of: 'of',
        results: 'results',
        
        // Offline
        offline: 'Offline',
        online: 'Online'
    },
    
    tl: {
        // Header
        appName: 'EvacuFinder PH',
        
        // Sidebar
        findCenters: 'Maghanap ng Evacuation Center',
        findNearest: 'Hanapin ang Malapit',
        searchPlaceholder: 'Maghanap ng pangalan o lokasyon...',
        province: 'Probinsya',
        allProvinces: 'Lahat ng Probinsya',
        type: 'Uri',
        allTypes: 'Lahat ng Uri',
        exportCSV: 'I-export sa CSV',
        print: 'I-print',
        totalCenters: 'Kabuuang Centers',
        showing: 'Ipinapakita',
        evacuationCenters: 'Mga Evacuation Center',
        
        // Center Types
        'Barangay Hall': 'Barangay Hall',
        'Campus': 'Eskwelahan',
        'Church': 'Simbahan',
        'Field': 'Palaruan',
        'Hospital': 'Ospital',
        'Shelter': 'Kublihan',
        'Sports Center': 'Sports Center',
        
        // Result Cards
        shareCenter: 'Ibahagi ang Center',
        capacity: 'Kapasidad',
        small: 'Maliit',
        medium: 'Katamtaman',
        large: 'Malaki',
        kmAway: 'km ang layo',
        
        // Popup
        getDirections: 'Kunin ang Direksyon',
        
        // Share Modal
        share: 'Ibahagi',
        copyLink: 'Kopyahin ang Link',
        email: 'Email',
        sms: 'SMS',
        
        // Info Modal
        about: 'Tungkol sa EvacuFinder PH',
        features: 'Mga Feature',
        dataSource: 'Pinagmulan ng Data',
        emergencyHotlines: 'Emergency Hotlines',
        disclaimer: 'Paalala',
        disclaimerText: 'Ang app na ito ay para sa impormasyon lamang. Sundin palagi ang opisyal na payo ng gobyerno sa panahon ng sakuna.',
        
        // Toast Messages
        appLoaded: 'Matagumpay na nag-load ang app!',
        gettingLocation: 'Kinukuha ang iyong lokasyon...',
        centersNearYou: 'centers malapit sa iyo!',
        geolocationNotSupported: 'Hindi sinusuportahan ng iyong browser ang geolocation',
        locationError: 'Hindi makuha ang iyong lokasyon. Pakiusap na paganahin ang location services.',
        csvExported: 'Nag-export ng',
        csvExportedSuffix: 'centers sa CSV!',
        exportError: 'Nabigo ang pag-export ng CSV. Subukan ulit.',
        linkCopied: 'Nakopya ang link!',
        preparingPrint: 'Inihahanda ang mapa para sa pag-print...',
        offlineMode: 'Ikaw ay offline. Ang ilang features ay limitado.',
        backOnline: 'Bumalik ka na online!',
        
        // Results
        noResults: 'Walang nahanap na evacuation center',
        showingFirst: 'Ipinapakita ang unang',
        of: 'sa',
        results: 'mga resulta',
        found: 'Nahanap ang',
        
        // Offline
        offline: 'Offline',
        online: 'Online'
    }
};

// Current language
let currentLang = localStorage.getItem('language') || 'en';

// Translation function
function t(key) {
    return translations[currentLang][key] || translations.en[key] || key;
}

// Switch language
function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    updateUILanguage();
    showToast(
        lang === 'tl' ? 'Napalitan ang wika sa Tagalog!' : 'Language changed to English!',
        'success'
    );
}

// Update all UI text
function updateUILanguage() {
    // Sidebar header
    document.querySelector('.sidebar-header h2').textContent = t('findCenters');
    
    // Buttons
    document.querySelector('#locate-btn span').textContent = t('findNearest');
    document.querySelector('#export-csv-btn span').textContent = t('exportCSV');
    document.querySelector('#print-btn span').textContent = t('print');
    
    // Search placeholder
    document.getElementById('search-input').placeholder = t('searchPlaceholder');
    
    // Filter labels
    document.querySelector('label[for="province-filter"]').innerHTML = 
        `<i class="fas fa-map-marked-alt"></i> ${t('province')}`;
    document.querySelector('label[for="type-filter"]').innerHTML = 
        `<i class="fas fa-building"></i> ${t('type')}`;
    
    // Province filter first option
    const provinceFilter = document.getElementById('province-filter');
    if (provinceFilter.options[0]) {
        provinceFilter.options[0].text = t('allProvinces');
    }
    
    // Type filter options
    const typeFilter = document.getElementById('type-filter');
    if (typeFilter.options[0]) {
        typeFilter.options[0].text = t('allTypes');
    }
    
    // Stats labels
    document.querySelectorAll('.stat-label')[0].textContent = t('totalCenters');
    document.querySelectorAll('.stat-label')[1].textContent = t('showing');
    
    // Results header
    document.querySelector('.results-header').innerHTML = 
        `<i class="fas fa-list"></i> ${t('evacuationCenters')}`;
    
    // Re-render results with new language
    displayResults(filteredCenters);
}
