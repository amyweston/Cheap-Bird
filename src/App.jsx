import { useMemo, useState } from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'

const baseTransportOptions = [
  {
    id: 'f1',
    mode: 'Flight',
    provider: 'SkyBridge Air',
    price: 142,
    totalTime: '2h 20m',
    carbon: '174 kg CO2',
    score: 'Fastest',
  },
  {
    id: 't1',
    mode: 'Train',
    provider: 'AmRail Express',
    price: 89,
    totalTime: '4h 35m',
    carbon: '42 kg CO2',
    score: 'Best value',
  },
  {
    id: 'b1',
    mode: 'Bus',
    provider: 'GoCity Lines',
    price: 52,
    totalTime: '6h 05m',
    carbon: '31 kg CO2',
    score: 'Cheapest',
  },
  {
    id: 'd1',
    mode: 'Drive',
    provider: 'Personal Vehicle',
    price: 74,
    totalTime: '5h 10m',
    carbon: '96 kg CO2',
    score: 'Flexible',
  },
]

const initialTrackedRoutes = [
  { id: 'r1', route: 'Boston to Washington, DC', mode: 'Flight', history: [179, 168, 154, 142] },
  { id: 'r2', route: 'Boston to Washington, DC', mode: 'Train', history: [97, 96, 92, 89] },
]

function formatPrice(value) {
  return `$${value}`
}

function estimateMpg({ make, model, year }) {
  const makeBias = {
    toyota: 3,
    honda: 2,
    ford: -1,
    chevrolet: -2,
    tesla: 40,
    bmw: -1,
    hyundai: 1,
    kia: 1,
    nissan: 0,
  }

  const modelBias = {
    civic: 3,
    corolla: 3,
    camry: 1,
    accord: 1,
    prius: 9,
    rav4: -2,
    crv: -1,
    f150: -8,
    silverado: -9,
    model3: 45,
    modely: 42,
  }

  const normalizedMake = make.trim().toLowerCase()
  const normalizedModel = model.trim().toLowerCase().replace(/\s+/g, '')
  const base = 29
  const agePenalty = Math.max(0, Math.floor((2026 - Number(year || 2026)) / 3))
  const mpg = base + (makeBias[normalizedMake] ?? 0) + (modelBias[normalizedModel] ?? 0) - agePenalty
  return Math.min(120, Math.max(14, mpg))
}

function BirdLogo() {
  return (
    <svg viewBox="0 0 64 64" className="bird-logo" aria-hidden="true">
      <defs>
        <linearGradient id="birdGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8EE7FF" />
          <stop offset="100%" stopColor="#7D72FF" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="#0B1230" stroke="url(#birdGradient)" strokeWidth="2.5" />
      <path d="M13 36c8-1 12-6 18-15 2-3 4-4 8-5-2 4-3 7-3 11 5 0 10 2 15 5-5 1-10 2-14 4-4 2-7 5-11 10 1-5 0-8-3-10-4 0-7 0-10 0z" fill="url(#birdGradient)" />
      <circle cx="38" cy="25" r="2" fill="#E9F5FF" />
      <path d="M45 30l7 2-7 2z" fill="#FFD77A" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="profile-icon" aria-hidden="true">
      <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 20c1.6-3.8 4.3-5.7 7.5-5.7s5.9 1.9 7.5 5.7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function HomePage({ onGoCompare, onGoAlerts, savingsValue }) {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">Smart Travel Comparison</p>
        <h1>Plan the trip, not the spreadsheet.</h1>
        <p className="hero-text">
          Cheap Bird pulls flights, trains, buses, driving costs, and stays into one
          clear workspace so you can make budget-first travel decisions with confidence.
        </p>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={onGoCompare}>
            Start Comparing
          </button>
          <button type="button" className="btn btn-secondary" onClick={onGoAlerts}>
            Watch Price Trends
          </button>
        </div>
      </section>

      <section className="grid-two">
        <article className="card">
          <h2>Why Cheap Bird works</h2>
          <ul className="feature-list">
            <li>Single search across flights, trains, buses, driving, and rentals</li>
            <li>Real total-cost view including gas, tolls, parking, and baggage fees</li>
            <li>Book-now vs wait recommendations powered by price trend snapshots</li>
            <li>Shared trip planning tools for groups traveling from different cities</li>
          </ul>
        </article>
        <article className="card emphasis-card">
          <h2>Savings potential</h2>
          <p className="metric">{formatPrice(savingsValue)}</p>
          <p>Average trip savings when users compare all major transportation modes.</p>
        </article>
      </section>
    </main>
  )
}

function ComparePage({ transportOptions, onAddBooking, bookedIds }) {
  const [selectedMode, setSelectedMode] = useState('All')
  const [maxBudget, setMaxBudget] = useState(220)
  const [destination, setDestination] = useState('Washington, DC')

  const destinationProfiles = {
    'Washington, DC': { flight: 0, train: 0, bus: 0, drive: 0 },
    'New York, NY': { flight: -24, train: -16, bus: -9, drive: -6 },
    'Chicago, IL': { flight: 38, train: 28, bus: 19, drive: 15 },
    'Atlanta, GA': { flight: 22, train: 34, bus: 26, drive: 18 },
    'Miami, FL': { flight: 55, train: 47, bus: 41, drive: 33 },
    'Philadelphia, PA': { flight: -12, train: -8, bus: -6, drive: -4 },
    'Los Angeles, CA': { flight: 92, train: 118, bus: 96, drive: 74 },
    'San Francisco, CA': { flight: 88, train: 112, bus: 90, drive: 69 },
    'Seattle, WA': { flight: 84, train: 109, bus: 88, drive: 66 },
    'Denver, CO': { flight: 61, train: 73, bus: 58, drive: 43 },
    'Dallas, TX': { flight: 52, train: 66, bus: 54, drive: 39 },
    'Houston, TX': { flight: 57, train: 71, bus: 57, drive: 42 },
    'Orlando, FL': { flight: 58, train: 50, bus: 45, drive: 36 },
    'Las Vegas, NV': { flight: 77, train: 96, bus: 79, drive: 61 },
    'Nashville, TN': { flight: 36, train: 45, bus: 33, drive: 27 },
    'Charlotte, NC': { flight: 28, train: 37, bus: 30, drive: 23 },
    'Detroit, MI': { flight: 31, train: 40, bus: 31, drive: 24 },
    'Toronto, ON': { flight: 33, train: 39, bus: 29, drive: 26 },
    'Montreal, QC': { flight: 30, train: 35, bus: 27, drive: 22 },
    'Vancouver, BC': { flight: 86, train: 108, bus: 87, drive: 65 },
    'Mexico City, MX': { flight: 101, train: 126, bus: 108, drive: 82 },
    'London, UK': { flight: 210, train: 999, bus: 999, drive: 999 },
    'Paris, FR': { flight: 224, train: 999, bus: 999, drive: 999 },
    'Tokyo, JP': { flight: 285, train: 999, bus: 999, drive: 999 },
  }

  const destinationFactor = destinationProfiles[destination] ?? destinationProfiles['Washington, DC']

  const destinationAwareOptions = useMemo(() => {
    return transportOptions.map((option) => {
      const modeKey = option.mode.toLowerCase()
      const adjustment = destinationFactor[modeKey] ?? 0
      return {
        ...option,
        route: `Boston to ${destination}`,
        price: Math.max(35, option.price + adjustment),
      }
    })
  }, [destination, destinationFactor, transportOptions])

  const filteredOptions = useMemo(() => {
    return destinationAwareOptions
      .filter((option) => {
      const modeMatch = selectedMode === 'All' || option.mode === selectedMode
      const budgetMatch = option.price <= maxBudget
      return modeMatch && budgetMatch
    })
      .sort((a, b) => a.price - b.price)
  }, [destinationAwareOptions, maxBudget, selectedMode])

  return (
    <main className="page-shell">
      <section className="section-heading">
        <h1>Compare Transportation Modes</h1>
        <p>Choose the option that best fits your budget, schedule, and comfort.</p>
      </section>
      <section className="card filter-row">
        <label>
          Destination
          <select value={destination} onChange={(event) => setDestination(event.target.value)}>
            {Object.keys(destinationProfiles).map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mode
          <select value={selectedMode} onChange={(event) => setSelectedMode(event.target.value)}>
            <option>All</option>
            <option>Flight</option>
            <option>Train</option>
            <option>Bus</option>
            <option>Drive</option>
          </select>
        </label>
        <label>
          Max Budget: {formatPrice(maxBudget)}
          <input
            type="range"
            min="40"
            max="220"
            step="1"
            value={maxBudget}
            onChange={(event) => setMaxBudget(Number(event.target.value))}
          />
        </label>
      </section>
      <section className="card">
        <div className="table-header">
          <h2>Boston to {destination} - May 24</h2>
          <span className="chip">4 live sources synced</span>
        </div>
        <div className="comparison-grid">
          {filteredOptions.map((option) => (
            <article className="compare-item" key={option.mode}>
              <p className="tag">{option.score}</p>
              <h3>{option.mode}</h3>
              <p>{option.provider}</p>
              <p className="price">{formatPrice(option.price)}</p>
              <div className="meta-row">
                <span>{option.totalTime}</span>
                <span>{option.carbon}</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onAddBooking(option)}
                disabled={bookedIds.includes(option.id)}
              >
                {bookedIds.includes(option.id) ? 'Added to Booking' : 'Add to Booking'}
              </button>
            </article>
          ))}
        </div>
        {!filteredOptions.length && <p className="empty-state">No routes match this filter yet.</p>}
      </section>
    </main>
  )
}

function CostPlannerPage({ bookingItems }) {
  const transportTotal = bookingItems.reduce((sum, item) => sum + item.price, 0) || 178
  const housing = 284
  const localTransit = 46
  const food = 110
  const projectedTotal = transportTotal + housing + localTransit + food

  return (
    <main className="page-shell">
      <section className="section-heading">
        <h1>Total Cost Planner</h1>
        <p>Break down every expense before you commit.</p>
      </section>
      <section className="grid-two">
        <article className="card">
          <h2>Trip Inputs</h2>
          <form className="form-grid">
            <label>
              Origin
              <input defaultValue="Boston, MA" />
            </label>
            <label>
              Destination
              <input defaultValue="Washington, DC" />
            </label>
            <label>
              Travelers
              <input defaultValue="2 adults" />
            </label>
            <label>
              Max Budget
              <input defaultValue="$650 total" />
            </label>
            <button type="button" className="btn btn-primary full-width">
              Recalculate
            </button>
          </form>
        </article>
        <article className="card">
          <h2>Estimated Total Cost</h2>
          <div className="cost-list">
            <div>
              <span>Transportation</span>
              <strong>{formatPrice(transportTotal)}</strong>
            </div>
            <div>
              <span>Housing (2 nights)</span>
              <strong>{formatPrice(housing)}</strong>
            </div>
            <div>
              <span>Local transit & parking</span>
              <strong>{formatPrice(localTransit)}</strong>
            </div>
            <div>
              <span>Food estimate</span>
              <strong>{formatPrice(food)}</strong>
            </div>
            <div className="total-row">
              <span>Projected Total</span>
              <strong>{formatPrice(projectedTotal)}</strong>
            </div>
          </div>
        </article>
      </section>
    </main>
  )
}

function BookingPage({ bookingItems, onRemoveBooking, onTrackRoute, trackedRouteIds }) {
  const total = bookingItems.reduce((sum, item) => sum + item.price, 0)

  return (
    <main className="page-shell">
      <section className="section-heading">
        <h1>Flight & Transit Booking</h1>
        <p>Hold your best option now and keep fallback choices available.</p>
      </section>
      <section className="card booking-card">
        <h2>Recommended Booking</h2>
        <p className="booking-title">AmRail Express - 7:40 AM departure</p>
        <p>
          Save $53 vs flight and arrive only 1h later. Refundable window closes in 4h
          12m.
        </p>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary">
            Reserve Ticket
          </button>
          <button type="button" className="btn btn-secondary">
            Keep Tracking Price
          </button>
        </div>
      </section>
      <section className="card">
        <div className="table-header">
          <h2>Your Selected Bookings</h2>
          <span className="chip">{bookingItems.length} selected</span>
        </div>
        {!bookingItems.length && (
          <p className="empty-state">
            No bookings added yet. Visit Compare and add options to your trip basket.
          </p>
        )}
        <div className="booking-list">
          {bookingItems.map((item) => (
            <article className="booking-item" key={item.id}>
              <div>
                <h3>
                  {item.mode} - {item.provider}
                </h3>
                <p>
                  {formatPrice(item.price)} - {item.totalTime}
                </p>
              </div>
              <div className="hero-actions">
                <button type="button" className="btn btn-secondary" onClick={() => onRemoveBooking(item.id)}>
                  Remove
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onTrackRoute(item)}
                  disabled={trackedRouteIds.includes(item.id)}
                >
                  {trackedRouteIds.includes(item.id) ? 'Tracking' : 'Track Price'}
                </button>
              </div>
            </article>
          ))}
        </div>
        {bookingItems.length > 0 && (
          <p className="booking-total">Booking subtotal: {formatPrice(total)}</p>
        )}
      </section>
    </main>
  )
}

function AlertsPage({ trackedRoutes, onSimulatePriceTick }) {
  const [notificationSubscriptions, setNotificationSubscriptions] = useState({})

  const timeline = [
    { day: 'Now', event: 'Lowest average fare window opens', trend: 'down' },
    { day: 'Tue', event: 'Flight demand rises after 6 PM', trend: 'up' },
    { day: 'Thu', event: 'Train flash sale predicted', trend: 'down' },
    { day: 'Weekend', event: 'Last-minute prices spike likely', trend: 'up' },
  ]

  function handleToggleNotification(routeId) {
    setNotificationSubscriptions((current) => ({
      ...current,
      [routeId]: !current[routeId],
    }))
  }

  return (
    <main className="page-shell">
      <section className="section-heading">
        <h1>Price Alerts & Buy Timing</h1>
        <p>Get notified before prices jump and book at the right moment.</p>
      </section>
      <section className="card">
        <div className="table-header">
          <h2>Tracked Routes</h2>
          <button type="button" className="btn btn-primary" onClick={onSimulatePriceTick}>
            Refresh Prices
          </button>
        </div>
        {!trackedRoutes.length && (
          <p className="empty-state">Track a booking to see live-like price history here.</p>
        )}
        <div className="tracked-grid">
          {trackedRoutes.map((route) => {
            const first = route.history[0]
            const latest = route.history[route.history.length - 1]
            const delta = latest - first
            return (
              <article className="compare-item" key={route.id}>
                <h3>{route.mode}</h3>
                <p>{route.route}</p>
                <p className="price">{formatPrice(latest)}</p>
                <p className={delta <= 0 ? 'trend down' : 'trend up'}>
                  {delta <= 0 ? `Down ${formatPrice(Math.abs(delta))}` : `Up ${formatPrice(delta)}`}
                </p>
                <p className="sparkline">{route.history.map((value) => formatPrice(value)).join(' -> ')}</p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleToggleNotification(route.id)}
                >
                  {notificationSubscriptions[route.id]
                    ? 'Price Notifications On'
                    : 'Track Price Notification'}
                </button>
                {notificationSubscriptions[route.id] && (
                  <p className="notification-status">
                    We will notify you when this route drops by at least $10.
                  </p>
                )}
              </article>
            )
          })}
        </div>
      </section>
      <section className="card">
        <h2>Upcoming Price Signals</h2>
        <div className="timeline">
          {timeline.map((entry) => (
            <article className="timeline-item" key={entry.day}>
              <p>{entry.day}</p>
              <p>{entry.event}</p>
              <span className={`trend ${entry.trend}`}>
                {entry.trend === 'up' ? 'Likely increase' : 'Likely drop'}
              </span>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function GroupDashboardPage({ bookingItems }) {
  return (
    <main className="page-shell">
      <section className="section-heading">
        <h1>Group Coordination Dashboard</h1>
        <p>Align arrivals, departure points, and budgets for everyone in the trip.</p>
      </section>
      <section className="card">
        <h2>Friends Trip to DC</h2>
        <div className="group-grid">
          <article>
            <h3>Mia - NYC</h3>
            <p>Budget: $220</p>
            <p>Preferred arrival: before 1 PM</p>
          </article>
          <article>
            <h3>Jordan - Boston</h3>
            <p>Budget: $260</p>
            <p>Preferred departure: after 8 AM</p>
          </article>
          <article>
            <h3>Sam - Philadelphia</h3>
            <p>Budget: $170</p>
            <p>No transfer routes only</p>
          </article>
        </div>
        {bookingItems.length > 0 && (
          <p className="group-hint">
            Group has {bookingItems.length} shared route option(s) ready for coordination.
          </p>
        )}
      </section>
    </main>
  )
}

function ProfilePage({ vehicleProfile, onVehicleProfileChange }) {
  const estimatedMpg = estimateMpg(vehicleProfile)
  const gallonsNeeded = vehicleProfile.tripMiles / estimatedMpg
  const estimatedFuelCost = gallonsNeeded * vehicleProfile.gasPrice

  function updateField(field, value) {
    onVehicleProfileChange((current) => ({
      ...current,
      [field]: value,
    }))
  }

  return (
    <main className="page-shell">
      <section className="section-heading">
        <h1>Traveler Profile</h1>
        <p>Add your car details to estimate fuel use and driving cost.</p>
      </section>
      <section className="grid-two">
        <article className="card">
          <h2>Vehicle Details</h2>
          <form className="form-grid">
            <label>
              Car Make
              <input
                value={vehicleProfile.make}
                onChange={(event) => updateField('make', event.target.value)}
                placeholder="Toyota"
              />
            </label>
            <label>
              Car Model
              <input
                value={vehicleProfile.model}
                onChange={(event) => updateField('model', event.target.value)}
                placeholder="Camry"
              />
            </label>
            <label>
              Car Year
              <input
                type="number"
                min="1980"
                max="2026"
                value={vehicleProfile.year}
                onChange={(event) => updateField('year', Number(event.target.value))}
              />
            </label>
            <label>
              Trip Distance (miles)
              <input
                type="number"
                min="1"
                value={vehicleProfile.tripMiles}
                onChange={(event) => updateField('tripMiles', Number(event.target.value))}
              />
            </label>
            <label>
              Gas Price (per gallon)
              <input
                type="number"
                min="1"
                step="0.01"
                value={vehicleProfile.gasPrice}
                onChange={(event) => updateField('gasPrice', Number(event.target.value))}
              />
            </label>
          </form>
        </article>
        <article className="card">
          <h2>Fuel Estimate</h2>
          <div className="cost-list">
            <div>
              <span>Estimated MPG</span>
              <strong>{estimatedMpg} mpg</strong>
            </div>
            <div>
              <span>Gallons Needed</span>
              <strong>{gallonsNeeded.toFixed(1)} gal</strong>
            </div>
            <div className="total-row">
              <span>Estimated Fuel Cost</span>
              <strong>{formatPrice(estimatedFuelCost.toFixed(2))}</strong>
            </div>
          </div>
          <p className="group-hint">
            Tip: add this estimate to Compare and Cost Planner when deciding between drive
            vs train/flight.
          </p>
        </article>
      </section>
    </main>
  )
}

function App() {
  const navigate = useNavigate()
  const [bookingItems, setBookingItems] = useState([])
  const [trackedRoutes, setTrackedRoutes] = useState(initialTrackedRoutes)
  const [vehicleProfile, setVehicleProfile] = useState({
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    tripMiles: 440,
    gasPrice: 3.65,
  })

  const bookedIds = bookingItems.map((item) => item.id)
  const trackedRouteIds = trackedRoutes.map((route) => route.id)
  const cheapestPrice = Math.min(...baseTransportOptions.map((item) => item.price))
  const mostExpensivePrice = Math.max(...baseTransportOptions.map((item) => item.price))
  const savingsValue = mostExpensivePrice - cheapestPrice + 97

  function handleAddBooking(option) {
    setBookingItems((current) => {
      if (current.some((item) => item.id === option.id)) {
        return current
      }
      return [...current, option]
    })
  }

  function handleRemoveBooking(id) {
    setBookingItems((current) => current.filter((item) => item.id !== id))
  }

  function handleTrackRoute(item) {
    setTrackedRoutes((current) => {
      if (current.some((route) => route.id === item.id)) {
        return current
      }
      return [
        ...current,
        {
          id: item.id,
          route: 'Boston to Washington, DC',
          mode: item.mode,
          history: [item.price + 24, item.price + 15, item.price + 8, item.price],
        },
      ]
    })
  }

  function handleSimulatePriceTick() {
    setTrackedRoutes((current) =>
      current.map((route) => {
        const latest = route.history[route.history.length - 1]
        const variance = Math.floor(Math.random() * 15) - 7
        const nextPrice = Math.max(35, latest + variance)
        return {
          ...route,
          history: [...route.history.slice(-5), nextPrice],
        }
      }),
    )
  }

  return (
    <div className="app">
      <header className="top-nav">
        <div className="brand">
          <span className="brand-dot">
            <BirdLogo />
          </span>
          <p className="brand-title">Cheap Bird</p>
          <small className="brand-tagline">Compare, Save, Book</small>
        </div>
        <nav className="links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/compare">Compare</NavLink>
          <NavLink to="/planner">Cost Planner</NavLink>
          <NavLink to="/booking">Booking</NavLink>
          <NavLink to="/alerts">Alerts</NavLink>
          <NavLink to="/group">Group Tools</NavLink>
          <NavLink to="/profile" className="profile-link" aria-label="Profile">
            <ProfileIcon />
          </NavLink>
        </nav>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              savingsValue={savingsValue}
              onGoCompare={() => navigate('/compare')}
              onGoAlerts={() => navigate('/alerts')}
            />
          }
        />
        <Route
          path="/compare"
          element={
            <ComparePage
              transportOptions={baseTransportOptions}
              onAddBooking={handleAddBooking}
              bookedIds={bookedIds}
            />
          }
        />
        <Route path="/planner" element={<CostPlannerPage bookingItems={bookingItems} />} />
        <Route
          path="/booking"
          element={
            <BookingPage
              bookingItems={bookingItems}
              onRemoveBooking={handleRemoveBooking}
              onTrackRoute={handleTrackRoute}
              trackedRouteIds={trackedRouteIds}
            />
          }
        />
        <Route
          path="/alerts"
          element={<AlertsPage trackedRoutes={trackedRoutes} onSimulatePriceTick={handleSimulatePriceTick} />}
        />
        <Route
          path="/profile"
          element={<ProfilePage vehicleProfile={vehicleProfile} onVehicleProfileChange={setVehicleProfile} />}
        />
        <Route path="/group" element={<GroupDashboardPage bookingItems={bookingItems} />} />
      </Routes>
    </div>
  )
}

export default App
