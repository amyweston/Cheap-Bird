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

  const filteredOptions = useMemo(() => {
    return transportOptions.filter((option) => {
      const modeMatch = selectedMode === 'All' || option.mode === selectedMode
      const budgetMatch = option.price <= maxBudget
      return modeMatch && budgetMatch
    })
  }, [maxBudget, selectedMode, transportOptions])

  return (
    <main className="page-shell">
      <section className="section-heading">
        <h1>Compare Transportation Modes</h1>
        <p>Choose the option that best fits your budget, schedule, and comfort.</p>
      </section>
      <section className="card filter-row">
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
          <h2>Boston to Washington DC - May 24</h2>
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
  const timeline = [
    { day: 'Now', event: 'Lowest average fare window opens', trend: 'down' },
    { day: 'Tue', event: 'Flight demand rises after 6 PM', trend: 'up' },
    { day: 'Thu', event: 'Train flash sale predicted', trend: 'down' },
    { day: 'Weekend', event: 'Last-minute prices spike likely', trend: 'up' },
  ]

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

function App() {
  const navigate = useNavigate()
  const [bookingItems, setBookingItems] = useState([])
  const [trackedRoutes, setTrackedRoutes] = useState(initialTrackedRoutes)

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
          <div>
            <p>Cheap Bird</p>
            <small>Compare, Save, Book</small>
          </div>
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
        <Route path="/group" element={<GroupDashboardPage bookingItems={bookingItems} />} />
      </Routes>
    </div>
  )
}

export default App
