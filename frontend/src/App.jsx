
import { useState, useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom'

import api from './services/api'
import Login from './pages/login'
import Procurements from './pages/Procurements'
import Suppliers from './pages/Suppliers'
import Bids from './pages/Bids'
import SupplierVerify from './pages/SupplierVerify'


// Dashboard Component
function Dashboard() {
  const [procurements, setProcurements] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const results = await Promise.allSettled([
          api.get('procurements/'),
          api.get('invitations/'),
          api.get('bids/'),
        ])

        if (results[0].status === 'fulfilled') {
          setProcurements(results[0].value.data)
        }

        if (results[1].status === 'fulfilled') {
          setSuppliers(results[1].value.data)
        }

        if (results[2].status === 'fulfilled') {
          setBids(results[2].value.data)
        }

        if (results.every((result) => result.status === 'rejected')) {
          setError('Unable to load dashboard data.')
        }
      } catch (err) {
        setError('Something went wrong while loading dashboard.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const activeProcurements = procurements.filter(
    (item) => item.is_active
  ).length

  const stats = [
    { title: 'Total Procurements', value: procurements.length, icon: '📋' },
    { title: 'Active Procurements', value: activeProcurements, icon: '🟢' },
    { title: 'Total Suppliers', value: suppliers.length, icon: '👥' },
    { title: 'Total Bids', value: bids.length, icon: '💰' },
  ]

  return (
    <div className="container-fluid p-4">
      <h4>Welcome to BidFlow 👋</h4>

      <p className="text-secondary">
        Manage procurement requests, suppliers and bids.
      </p>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <div className="row g-4 mt-2">
        {stats.map((item) => (
          <div className="col-12 col-sm-6 col-xl-3" key={item.title}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <span className="text-secondary">{item.title}</span>
                  <span>{item.icon}</span>
                </div>

                <h2 className="mt-3 mb-0">
                  {loading ? '...' : item.value}
                </h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body">
          <h5>Recent Procurements</h5>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Quantity</th>
                  <th>Starting Price</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {procurements.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.title}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.starting_price}</td>
                    <td>
                      <span
                        className={`badge ${
                          item.is_active ? 'bg-success' : 'bg-secondary'
                        }`}
                      >
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}

                {!loading && procurements.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No procurements found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}


// Main Application
function MainApp() {
  const [token, setToken] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Token ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  const handleLogin = (newToken) => {
    api.defaults.headers.common['Authorization'] = `Token ${newToken}`
    setToken(newToken)
    navigate('/')
  }

  const handleLogout = () => {
    setToken(null)
    delete api.defaults.headers.common['Authorization']
    navigate('/login')
  }

  // Public supplier invitation route
  // Supplier does not need admin login.
  if (location.pathname.startsWith('/supplier/')) {
    return (
      <Routes>
        <Route
          path="/supplier/:invitationId"
          element={<SupplierVerify />}
        />
      </Routes>
    )
  }

  // Admin login
  if (!token) {
    return <Login onLogin={handleLogin} />
  }

  // Admin dashboard
  return (
    <div className="d-flex">
      <aside
        className="bg-dark text-white p-3 min-vh-100"
        style={{ width: '250px', flexShrink: 0 }}
      >
        <h3 className="mb-4">BidFlow</h3>

        <nav className="nav flex-column gap-2">
          <Link to="/" className="nav-link text-white">
            Dashboard
          </Link>

          <Link to="/procurements" className="nav-link text-white">
            Procurements
          </Link>

          <Link to="/suppliers" className="nav-link text-white">
            Suppliers
          </Link>

          <Link to="/bids" className="nav-link text-white">
            Bids
          </Link>
        </nav>
      </aside>

      <main className="flex-grow-1">
        <nav className="navbar bg-white shadow-sm px-4 py-3">
          <h5 className="mb-0">BidFlow Admin</h5>

          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/procurements" element={<Procurements />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/bids" element={<Bids />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}


// App Component
function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  )
}

export default App
