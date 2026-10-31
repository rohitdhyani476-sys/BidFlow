
import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'

function Bids() {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchBids = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      const response = await api.get('bids/')

      setBids(response.data)
      setError('')
      setLastUpdated(new Date())
    } catch (err) {
      setError('Unable to load bids. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchBids(true)

    const intervalId = setInterval(() => {
      fetchBids()
    }, 5000)

    return () => clearInterval(intervalId)
  }, [fetchBids])

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4>Submitted Bids</h4>
          <p className="text-secondary mb-0">
            View all bids submitted by suppliers.
          </p>
          <small className="text-muted">
            {refreshing ? 'Updating bids...' : 'Auto-refresh every 5 seconds'}
          </small>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={() => fetchBids()}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {lastUpdated && (
        <p className="text-secondary small">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <p className="text-center">Loading bids...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Bid ID</th>
                    <th>Procurement</th>
                    <th>Supplier</th>
                    <th>Bid Amount</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>

                <tbody>
                  {bids.map((bid) => (
                    <tr key={bid.id}>
                      <td>{bid.id}</td>
                      <td>
                        {bid.procurement_title ||
                          bid.procurement_name ||
                          bid.procurement}
                      </td>
                      <td>
                        {bid.supplier_name ||
                          bid.supplier_email ||
                          bid.supplier}
                      </td>
                      <td className="fw-semibold">
                        ₹{bid.amount}
                      </td>
                      <td>
                        {bid.created_at
                          ? new Date(bid.created_at).toLocaleString()
                          : '-'}
                      </td>
                    </tr>
                  ))}

                  {bids.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-secondary">
                        No bids have been submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Bids
