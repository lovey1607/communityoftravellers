// ============================================
// Search & Filter Module
// Premium horizontal marketplace filter panel
// ============================================

import { store } from '../state.js';
import { formatPrice } from '../utils/format.js';

export function renderSearchFilters(options = {}) {
    const { inline = false, showSort = true } = options;
    const filters = store.get('filters');

    // Format budget display
    const formatBudgetVal = (val) => {
        if (val >= 1000000) return '₹10.0L+';
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
        return `₹${val}`;
    };

    const isExpanded = store.get('filtersPanelExpanded') || false;

    return `
        <div class="search-module ${inline ? 'search-module-inline' : ''}" id="search-module">
            <style>
                .search-module {
                    background: rgba(8, 8, 8, 0.6) !important;
                    border: 1px solid rgba(255, 90, 0, 0.15) !important;
                    border-radius: var(--radius-xl) !important;
                    padding: var(--space-5) !important;
                    backdrop-filter: blur(25px) !important;
                    -webkit-backdrop-filter: blur(25px) !important;
                    display: flex !important;
                    flex-direction: column !important;
                    gap: var(--space-4) !important;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5) !important;
                    width: 100% !important;
                    margin-bottom: var(--space-6) !important;
                    z-index: 10 !important;
                }
                .search-horizontal-row {
                    display: grid !important;
                    grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1fr !important;
                    gap: 16px !important;
                    align-items: center !important;
                }
                @media (max-width: 1100px) {
                    .search-horizontal-row {
                        grid-template-columns: 1fr 1fr !important;
                        gap: 20px !important;
                    }
                }
                @media (max-width: 650px) {
                    .search-horizontal-row {
                        grid-template-columns: 1fr !important;
                        gap: 16px !important;
                    }
                }
                .search-col {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 6px !important;
                    text-align: left !important;
                }
                .search-col-label {
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    color: rgba(255, 255, 255, 0.45) !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.08em !important;
                }
                .search-col-label.highlighted {
                    color: var(--color-teal) !important;
                }
                .search-input-container {
                    background: rgba(255, 255, 255, 0.03) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    border-radius: var(--radius-md) !important;
                    padding: 10px 14px !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    transition: all 0.2s ease !important;
                    height: 42px !important;
                }
                .search-input-container:focus-within {
                    border-color: rgba(255, 90, 0, 0.5) !important;
                    background: rgba(255, 90, 0, 0.04) !important;
                }
                .search-input-container input {
                    background: transparent !important;
                    border: none !important;
                    color: #ffffff !important;
                    font-size: 14px !important;
                    outline: none !important;
                    width: 100% !important;
                    font-family: var(--font-body) !important;
                }
                .search-input-container input::placeholder {
                    color: rgba(255, 255, 255, 0.3) !important;
                }
                .filter-pills-row {
                    display: flex !important;
                    gap: 6px !important;
                    height: 42px !important;
                    align-items: center !important;
                }
                .filter-pill-btn {
                    background: rgba(255, 255, 255, 0.03) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    border-radius: var(--radius-md) !important;
                    height: 42px !important;
                    padding: 0 14px !important;
                    color: rgba(255, 255, 255, 0.8) !important;
                    font-size: 13px !important;
                    cursor: pointer !important;
                    font-weight: 600 !important;
                    transition: all 0.2s ease !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 6px !important;
                    font-family: var(--font-body) !important;
                }
                .filter-pill-btn:hover {
                    background: rgba(255, 90, 0, 0.1) !important;
                    border-color: rgba(255, 90, 0, 0.3) !important;
                    color: #ffffff !important;
                }
                .filter-pill-btn.active {
                    background: rgba(255, 90, 0, 0.15) !important;
                    border-color: var(--color-teal) !important;
                    color: var(--color-teal) !important;
                }
                .more-filters-toggle {
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                    color: rgba(255, 255, 255, 0.4) !important;
                    font-size: 13px !important;
                    font-weight: 600 !important;
                    cursor: pointer !important;
                    text-decoration: none !important;
                    margin-top: 4px !important;
                    width: fit-content !important;
                    transition: color 0.2s ease !important;
                    background: none !important;
                    border: none !important;
                    padding: 0 !important;
                }
                .more-filters-toggle:hover {
                    color: var(--color-teal) !important;
                }
                .expanded-filters-panel {
                    display: none;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
                    gap: 24px !important;
                    border-top: 1px solid rgba(255,255,255,0.06) !important;
                    padding-top: var(--space-5) !important;
                    margin-top: var(--space-2) !important;
                }
                .expanded-filters-panel.open {
                    display: grid !important;
                }
                .expanded-col {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 12px !important;
                }
                .expanded-col-title {
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    color: rgba(255, 255, 255, 0.4) !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.08em !important;
                }
                .expanded-chips {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    gap: 8px !important;
                }
                .bottom-actions-row {
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    border-top: 1px solid rgba(255,255,255,0.06) !important;
                    padding-top: var(--space-4) !important;
                    margin-top: var(--space-2) !important;
                }
                .clear-all-link {
                    color: rgba(255, 255, 255, 0.45) !important;
                    font-size: 13px !important;
                    font-weight: 600 !important;
                    cursor: pointer !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                    background: none !important;
                    border: none !important;
                }
                .clear-all-link:hover {
                    color: var(--color-teal) !important;
                }
                .slider-container input[type=range] {
                    -webkit-appearance: none;
                    width: 100%;
                    background: rgba(255,255,255,0.1);
                    height: 4px;
                    border-radius: 2px;
                    outline: none;
                    margin: 0;
                }
                .slider-container input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: var(--color-teal);
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(255, 90, 0, 0.5);
                    transition: transform 0.1s ease;
                }
                .slider-container input[type=range]::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                }
            </style>

            <div class="search-horizontal-row">
                <!-- Where to -->
                <div class="search-col">
                    <div class="search-col-label highlighted">Where to ✨</div>
                    <div class="search-input-container">
                        <span class="material-icons-round" style="color:var(--color-teal);font-size:18px;">place</span>
                        <input type="text" id="filter-destination" placeholder="Search destination" value="${filters.destination || ''}">
                    </div>
                </div>

                <!-- From Where -->
                <div class="search-col">
                    <div class="search-col-label">From Where</div>
                    <div class="search-input-container">
                        <span class="material-icons-round" style="color:var(--color-teal);font-size:18px;">near_me</span>
                        <input type="text" id="filter-origin" placeholder="Your city (e.g. Gurgaon)..." value="${filters.origin || store.get('userOrigin') || 'Gurgaon'}">
                    </div>
                </div>

                <!-- Dates -->
                <div class="search-col">
                    <div class="search-col-label">Dates</div>
                    <div class="search-input-container" style="position:relative;">
                        <span class="material-icons-round" style="color:var(--color-teal);font-size:18px;">calendar_today</span>
                        <input type="text" id="filter-date-display" placeholder="Any dates" value="${filters.dateStart ? filters.dateStart : ''}" onfocus="(this.type='date')" onblur="if(!this.value)this.type='text'">
                    </div>
                </div>

                <!-- Price Slider -->
                <div class="search-col" style="min-width: 140px;">
                    <div class="search-col-label" id="budget-range-label">₹0k - ${formatBudgetVal(filters.budgetMax || 1000000)}</div>
                    <div class="slider-container" style="position: relative; padding-top: 10px; height: 42px; display: flex; align-items: center;">
                        <input type="range" id="filter-budget" min="10000" max="1000000" step="10000" value="${filters.budgetMax || 1000000}">
                    </div>
                </div>

                <!-- Region -->
                <div class="search-col">
                    <div class="search-col-label">Region</div>
                    <div class="filter-pills-row" id="filter-region-pills">
                        <button class="filter-pill-btn ${!filters.region ? 'active' : ''}" data-region="">All</button>
                        <button class="filter-pill-btn ${filters.region === 'India' ? 'active' : ''}" data-region="India">🇮🇳</button>
                        <button class="filter-pill-btn ${filters.region === 'International' ? 'active' : ''}" data-region="International">🌍</button>
                    </div>
                </div>

                <!-- Group -->
                <div class="search-col">
                    <div class="search-col-label">Group</div>
                    <div class="filter-pills-row">
                        <button class="filter-pill-btn ${filters.groupType === 'female' ? 'active' : ''}" id="btn-female-only">
                            <span class="material-icons-round" style="font-size:16px;">person_outline</span> Females Only
                        </button>
                    </div>
                </div>
            </div>

            <!-- More Filters Expand Trigger -->
            <div>
                <button class="more-filters-toggle" id="btn-toggle-advanced">
                    <span class="material-icons-round" style="font-size:16px;">${isExpanded ? 'expand_less' : 'expand_more'}</span>
                    <span>${isExpanded ? 'Hide filters' : 'More filters'}</span>
                </button>
            </div>

            <!-- Expanded Advanced Filters -->
            <div class="expanded-filters-panel ${isExpanded ? 'open' : ''}" id="expanded-panel">
                <!-- Host Type -->
                <div class="expanded-col">
                    <div class="expanded-col-title">Host Type</div>
                    <div class="expanded-chips" id="filter-host-pills">
                        <button class="filter-pill-btn ${!filters.hostType ? 'active' : ''}" data-host="">All</button>
                        <button class="filter-pill-btn ${filters.hostType === 'influencer' ? 'active' : ''}" data-host="influencer">Travel Influencer</button>
                        <button class="filter-pill-btn ${filters.hostType === 'company' ? 'active' : ''}" data-host="company">Top Travel Company</button>
                    </div>
                </div>

                <!-- Host Name Search -->
                <div class="expanded-col">
                    <div class="expanded-col-title">Search Host Name</div>
                    <div class="search-input-container">
                        <span class="material-icons-round" style="color:var(--color-teal);font-size:18px;">badge</span>
                        <input type="text" id="filter-host-name" placeholder="e.g. Priya, Abhinav..." value="${filters.hostNameQuery || ''}">
                    </div>
                </div>

                <!-- Stay Type -->
                <div class="expanded-col">
                    <div class="expanded-col-title">Stay Type</div>
                    <div class="expanded-chips" id="filter-stay-pills">
                        <button class="filter-pill-btn ${!filters.stayType ? 'active' : ''}" data-stay="">All</button>
                        <button class="filter-pill-btn ${filters.stayType === 'rooms' ? 'active' : ''}" data-stay="rooms">
                            <span class="material-icons-round" style="font-size:14px;">home</span> Rooms
                        </button>
                        <button class="filter-pill-btn ${filters.stayType === 'tent' ? 'active' : ''}" data-stay="tent">
                            <span class="material-icons-round" style="font-size:14px;">storefront</span> Tent
                        </button>
                        <button class="filter-pill-btn ${filters.stayType === 'hostel' ? 'active' : ''}" data-stay="hostel">
                            <span class="material-icons-round" style="font-size:14px;">hotel</span> Hostel
                        </button>
                    </div>
                </div>

                <!-- Travel Mode -->
                <div class="expanded-col">
                    <div class="expanded-col-title">Travel Mode</div>
                    <div class="expanded-chips" id="filter-travel-pills">
                        <button class="filter-pill-btn ${!filters.transportMode ? 'active' : ''}" data-travel="">All</button>
                        <button class="filter-pill-btn ${filters.transportMode === 'car' ? 'active' : ''}" data-travel="car">
                            <span class="material-icons-round" style="font-size:14px;">directions_car</span> Car
                        </button>
                        <button class="filter-pill-btn ${filters.transportMode === 'tempo' ? 'active' : ''}" data-travel="tempo">
                            <span class="material-icons-round" style="font-size:14px;">airport_shuttle</span> Tempo
                        </button>
                        <button class="filter-pill-btn ${filters.transportMode === 'flight' ? 'active' : ''}" data-travel="flight">
                            <span class="material-icons-round" style="font-size:14px;">flight</span> Flight
                        </button>
                        <button class="filter-pill-btn ${filters.transportMode === 'train' ? 'active' : ''}" data-travel="train">
                            <span class="material-icons-round" style="font-size:14px;">train</span> Train
                        </button>
                    </div>
                </div>

                <!-- Food -->
                <div class="expanded-col">
                    <div class="expanded-col-title">Food</div>
                    <div class="expanded-chips" id="filter-food-pills">
                        <button class="filter-pill-btn ${!filters.foodPreference ? 'active' : ''}" data-food="">All</button>
                        <button class="filter-pill-btn ${filters.foodPreference === 'veg' ? 'active' : ''}" data-food="veg">
                            <span class="material-icons-round" style="font-size:14px;">restaurant</span> Veg
                        </button>
                        <button class="filter-pill-btn ${filters.foodPreference === 'non-veg' ? 'active' : ''}" data-food="non-veg">
                            <span class="material-icons-round" style="font-size:14px;">restaurant</span> Non-Veg
                        </button>
                        <button class="filter-pill-btn ${filters.foodPreference === 'both' ? 'active' : ''}" data-food="both">
                            <span class="material-icons-round" style="font-size:14px;">restaurant</span> Both
                        </button>
                    </div>
                </div>
            </div>

            <!-- Bottom Actions Row -->
            <div class="bottom-actions-row">
                <button class="clear-all-link" id="filter-clear-all">
                    <span class="material-icons-round" style="font-size:16px;">close</span> Clear all
                </button>
                <button class="btn btn-primary" id="search-btn" style="border-radius:99px; padding: 10px 24px; display: flex; align-items: center; gap: 8px;">
                    <span class="material-icons-round" style="font-size:18px;">search</span> Search
                </button>
            </div>

            <!-- Active Filters Display -->
            <div class="active-filters-bar" id="active-filters-bar" style="display:none; margin-top: 12px;"></div>
        </div>
    `;
}

export function setupFilterEvents(onFilterChange) {
    // 1. Text Inputs (Destination & Origin)
    ['filter-destination', 'filter-origin', 'filter-host-name'].forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;
        let timeout;
        input.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const key = id === 'filter-destination' ? 'destination' : id === 'filter-origin' ? 'origin' : 'hostNameQuery';
                store.set(`filters.${key}`, input.value.trim());
                updateActiveFilters();
                onFilterChange?.();
            }, 300);
        });
    });

    // 2. Date Input
    const dateInput = document.getElementById('filter-date-display');
    dateInput?.addEventListener('change', () => {
        store.set('filters.dateStart', dateInput.value);
        updateActiveFilters();
        onFilterChange?.();
    });

    // 3. Price Slider
    const budgetSlider = document.getElementById('filter-budget');
    const budgetLabel = document.getElementById('budget-range-label');
    const formatBudgetVal = (val) => {
        if (val >= 1000000) return '₹10.0L+';
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
        return `₹${val}`;
    };

    budgetSlider?.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        budgetLabel.textContent = `₹0k - ${formatBudgetVal(val)}`;
        store.set('filters.budgetMax', val);
    });

    budgetSlider?.addEventListener('change', () => {
        updateActiveFilters();
        onFilterChange?.();
    });

    // 4. Region Pills
    document.querySelectorAll('#filter-region-pills .filter-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const region = btn.dataset.region;
            document.querySelectorAll('#filter-region-pills .filter-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            store.set('filters.region', region);
            updateActiveFilters();
            onFilterChange?.();
        });
    });

    // 5. Group Type (Females Only toggle)
    const femaleBtn = document.getElementById('btn-female-only');
    femaleBtn?.addEventListener('click', () => {
        const currentGroup = store.get('filters.groupType');
        if (currentGroup === 'female') {
            store.set('filters.groupType', '');
            femaleBtn.classList.remove('active');
        } else {
            store.set('filters.groupType', 'female');
            femaleBtn.classList.add('active');
        }
        updateActiveFilters();
        onFilterChange?.();
    });

    // 6. Advanced Filters Expand / Collapse Toggle
    const advancedToggle = document.getElementById('btn-toggle-advanced');
    const expandedPanel = document.getElementById('expanded-panel');
    advancedToggle?.addEventListener('click', () => {
        const isCurrentlyExpanded = store.get('filtersPanelExpanded') || false;
        const newExpandedState = !isCurrentlyExpanded;
        store.set('filtersPanelExpanded', newExpandedState);
        
        expandedPanel?.classList.toggle('open', newExpandedState);
        
        // Update button text and icon
        const icon = advancedToggle.querySelector('.material-icons-round');
        const text = advancedToggle.querySelector('span:not(.material-icons-round)');
        if (icon) icon.textContent = newExpandedState ? 'expand_less' : 'expand_more';
        if (text) text.textContent = newExpandedState ? 'Hide filters' : 'More filters';
    });

    // 7. Advanced Host Pills
    document.querySelectorAll('#filter-host-pills .filter-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const hostType = btn.dataset.host;
            document.querySelectorAll('#filter-host-pills .filter-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            store.set('filters.hostType', hostType);
            updateActiveFilters();
            onFilterChange?.();
        });
    });

    // 8. Advanced Stay Pills
    document.querySelectorAll('#filter-stay-pills .filter-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const stayType = btn.dataset.stay;
            document.querySelectorAll('#filter-stay-pills .filter-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            store.set('filters.stayType', stayType);
            updateActiveFilters();
            onFilterChange?.();
        });
    });

    // 9. Advanced Travel Pills
    document.querySelectorAll('#filter-travel-pills .filter-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const travelMode = btn.dataset.travel;
            document.querySelectorAll('#filter-travel-pills .filter-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            store.set('filters.transportMode', travelMode);
            updateActiveFilters();
            onFilterChange?.();
        });
    });

    // 10. Advanced Food Pills
    document.querySelectorAll('#filter-food-pills .filter-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const foodPref = btn.dataset.food;
            document.querySelectorAll('#filter-food-pills .filter-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            store.set('filters.foodPreference', foodPref);
            updateActiveFilters();
            onFilterChange?.();
        });
    });

    // 11. Clear All
    document.getElementById('filter-clear-all')?.addEventListener('click', () => {
        store.resetFilters();
        
        // Reset Inputs
        const dest = document.getElementById('filter-destination');
        const orig = document.getElementById('filter-origin');
        const dates = document.getElementById('filter-date-display');
        const hostName = document.getElementById('filter-host-name');
        if (dest) dest.value = '';
        if (orig) orig.value = '';
        if (dates) { dates.value = ''; dates.type = 'text'; }
        if (hostName) hostName.value = '';
        
        // Reset Slider
        if (budgetSlider) {
            budgetSlider.value = 1000000;
            budgetLabel.textContent = `₹0k - ₹10.0L+`;
        }

        // Reset All Buttons visually
        document.querySelectorAll('.filter-pill-btn').forEach(b => {
            b.classList.remove('active');
            // If it's an "All" button, set active
            if (b.dataset.region === '' || b.dataset.host === '' || b.dataset.stay === '' || b.dataset.travel === '' || b.dataset.food === '') {
                b.classList.add('active');
            }
        });
        document.getElementById('btn-female-only')?.classList.remove('active');
        
        updateActiveFilters();
        onFilterChange?.();
    });

    // 12. Search Button
    document.getElementById('search-btn')?.addEventListener('click', () => {
        onFilterChange?.();
    });

    updateActiveFilters();
}

function updateActiveFilters() {
    const bar = document.getElementById('active-filters-bar');
    if (!bar) return;

    const filters = store.get('filters');
    const activeChips = [];

    const formatBudgetVal = (val) => {
        if (val >= 1000000) return '₹10.0L+';
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
        return `₹${val}`;
    };

    if (filters.destination) activeChips.push({ key: 'destination', label: `📍 ${filters.destination}` });
    if (filters.origin) activeChips.push({ key: 'origin', label: `✈️ From ${filters.origin}` });
    if (filters.dateStart) activeChips.push({ key: 'dateStart', label: `📅 ${filters.dateStart}` });
    if (filters.region) activeChips.push({ key: 'region', label: `🌍 ${filters.region}` });
    if (filters.groupType === 'female') activeChips.push({ key: 'groupType', label: `👥 Females Only` });
    if (filters.hostType) activeChips.push({ key: 'hostType', label: `👤 Vibe: ${filters.hostType === 'influencer' ? 'Travel Influencer' : 'Top Travel Company'}` });
    if (filters.hostNameQuery) activeChips.push({ key: 'hostNameQuery', label: `👤 Host: "${filters.hostNameQuery}"` });
    if (filters.stayType) activeChips.push({ key: 'stayType', label: `🏨 Stay: ${filters.stayType}` });
    if (filters.transportMode) activeChips.push({ key: 'transportMode', label: `🚗 Travel: ${filters.transportMode}` });
    if (filters.foodPreference) activeChips.push({ key: 'foodPreference', label: `🍽️ Food: ${filters.foodPreference}` });
    if (filters.budgetMax < 1000000) activeChips.push({ key: 'budgetMax', label: `💰 Under ${formatBudgetVal(filters.budgetMax)}` });

    if (activeChips.length === 0) {
        bar.innerHTML = '';
        bar.style.display = 'none';
        return;
    }

    bar.style.display = 'flex';
    bar.style.flexWrap = 'wrap';
    bar.style.gap = '8px';
    bar.style.alignItems = 'center';
    bar.innerHTML = `
        ${activeChips.map(chip => `
            <span class="chip active" style="background: rgba(255, 90, 0, 0.1); border: 1px solid rgba(255, 90, 0, 0.3); color: var(--color-teal); display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 99px; font-size: 12px; font-weight: 500;">
                ${chip.label}
                <span class="chip-close" data-key="${chip.key}" style="cursor:pointer; font-weight: 700; margin-left: 4px; font-size: 14px;">&times;</span>
            </span>
        `).join('')}
        <button class="btn btn-ghost btn-sm" id="clear-active-filters-link" style="color:var(--color-teal); font-size:12px; font-weight:600; background:none; border:none; cursor:pointer;">Clear all</button>
    `;

    // Remove individual chips
    bar.querySelectorAll('.chip-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const key = btn.dataset.key;
            
            if (key === 'budgetMax') {
                store.set('filters.budgetMax', 1000000);
                const budgetSlider = document.getElementById('filter-budget');
                const budgetLabel = document.getElementById('budget-range-label');
                if (budgetSlider) budgetSlider.value = 1000000;
                if (budgetLabel) budgetLabel.textContent = `₹0k - ₹10.0L+`;
            } else if (key === 'hostNameQuery') {
                store.set('filters.hostNameQuery', '');
                const hnInput = document.getElementById('filter-host-name');
                if (hnInput) hnInput.value = '';
            } else if (key === 'groupType') {
                store.set('filters.groupType', '');
                document.getElementById('btn-female-only')?.classList.remove('active');
            } else if (key === 'destination') {
                store.set('filters.destination', '');
                const destInput = document.getElementById('filter-destination');
                if (destInput) destInput.value = '';
            } else if (key === 'origin') {
                store.set('filters.origin', '');
                const origInput = document.getElementById('filter-origin');
                if (origInput) origInput.value = '';
            } else if (key === 'dateStart') {
                store.set('filters.dateStart', '');
                const datesInput = document.getElementById('filter-date-display');
                if (datesInput) { datesInput.value = ''; datesInput.type = 'text'; }
            } else {
                store.set(`filters.${key}`, '');
                // Reset corresponding button highlight
                document.querySelectorAll(`.filter-pill-btn[data-${key}]`).forEach(b => {
                    b.classList.remove('active');
                    if (b.getAttribute(`data-${key}`) === '') b.classList.add('active');
                });
            }
            updateActiveFilters();
            // Trigger refresh
            const searchBtn = document.getElementById('search-btn');
            searchBtn?.click();
        });
    });

    document.getElementById('clear-active-filters-link')?.addEventListener('click', () => {
        document.getElementById('filter-clear-all')?.click();
    });
}
