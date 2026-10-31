
import { useEffect, useState } from 'react'
import api from '../services/api'

const initialFormData = {
  title: '',
  description: '',
  quantity: '',
  starting_price: '',
  start_time: '',
  end_time: '',
}

function Procurements() {
  const [procurements, setProcurements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [selectedProcurement, setSelectedProcurement] = useState(null)
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState('')

  const [formData, setFormData] = useState(initialFormData)

  const fetchProcurements = async () => {
    try {
      setError('')
      const response = await api.get('procurements/')
      setProcurements(response.data)
    } catch (err) {
      setError('Unable to load procurements.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProcurements()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (new Date(formData.end_time) <= new Date(formData.start_time)) {
      setError('Auction end time must be after start time.')
      return
    }

    try {
      await api.post('procurements/', {
        ...formData,
        quantity: Number(formData.quantity),
        starting_price: Number(formData.starting_price),
      })

      setMessage('Procurement created successfully!')
      setFormData(initialFormData)
      await fetchProcurements()
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : 'Unable to create procurement.'
      )
    }
  }

  const handleViewDetails = async (procurement) => {
    if (selectedProcurement?.id === procurement.id) {
      setSelectedProcurement(null)
      setSummary(null)
      setSummaryError('')
      return
    }

    setSelectedProcurement(procurement)
    setSummary(null)
    setSummaryError('')
    setSummaryLoading(true)

    try {
      const response = await api.get(
        `procurements/${procurement.id}/summary/`
      )
      setSummary(response.data)
    } catch (err) {
      setSummaryError(
        err.response?.data?.detail ||
        'Unable to load procurement summary.'
      )
    } finally {
      setSummaryLoading(false)
    }
  }

  const formatDateTime = (value) => {
    if (!value) return 'Not scheduled'

    return new Date(value).toLocaleString('en-IN')
  }

  const formatAmount = (value) => {
    if (value === null || value === undefined) return 'Not available'

    return `₹${Number(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <div className="container-fluid p-4">
      <h4 className="mb-1">Procurement Management</h4>

      <p className="text-secondary">
        Create and manage procurement requests and auctions.
      </p>

      {message && (
        <div className="alert alert-success">{message}</div>
      )}

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* Create Procurement Form */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <h5 className="mb-3">Create New Procurement</h5>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  className="form-control"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Starting Price (₹)</label>
                <input
                  type="number"
                  name="starting_price"
                  className="form-control"
                  min="0.01"
                  step="0.01"
                  value={formData.starting_price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <hr />

            <h6 className="mb-3">Auction Schedule</h6>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Auction Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  className="form-control"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Auction End Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="end_time"
                  className="form-control"
                  value={formData.end_time}
                  min={formData.start_time || undefined}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Create Procurement
            </button>
          </form>
        </div>
      </div>

      {/* Procurement List */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h5 className="mb-3">All Procurements</h5>

          {loading ? (
            <p>Loading procurements...</p>
          ) : procurements.length === 0 ? (
            <p className="text-secondary">No procurements found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Quantity</th>
                    <th>Starting Price</th>
                    <th>Auction Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {procurements.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.title}</td>
                      <td>{item.quantity}</td>
                      <td>{formatAmount(item.starting_price)}</td>
                      <td>
                        <span
                          className={`badge ${
                            item.auction_status === 'active'
                              ? 'bg-success'
                              : item.auction_status === 'closed'
                                ? 'bg-secondary'
                                : 'bg-warning text-dark'
                          }`}
                        >
                          {item.auction_status || 'Not available'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewDetails(item)}
                        >
                          {selectedProcurement?.id === item.id
                            ? 'Hide Details'
                            : 'View Details'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Procurement Summary */}
          {selectedProcurement && (
            <div className="card bg-light border mt-4">
              <div className="card-body">
                <h5>
                  {summary?.title || selectedProcurement.title}
                </h5>

                <p className="text-secondary">
                  {selectedProcurement.description}
                </p>

                <p>
                  <strong>Quantity:</strong>{' '}
                  {selectedProcurement.quantity}
                </p>

                <p>
                  <strong>Starting Price:</strong>{' '}
                  {formatAmount(selectedProcurement.starting_price)}
                </p>

                <p>
                  <strong>Start Time:</strong>{' '}
                  {formatDateTime(
                    summary?.start_time ?? selectedProcurement.start_time
                  )}
                </p>

                <p>
                  <strong>End Time:</strong>{' '}
                  {formatDateTime(
                    summary?.end_time ?? selectedProcurement.end_time
                  )}
                </p>

                <hr />

                <h6 className="mb-3">Auction Summary</h6>

                {summaryLoading ? (
                  <p>Loading auction summary...</p>
                ) : summaryError ? (
                  <div className="alert alert-danger">
                    {summaryError}
                  </div>
                ) : summary ? (
                  <>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body">
                            <small className="text-secondary">
                              Total Bids
                            </small>
                            <h4>{summary.total_bids}</h4>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body">
                            <small className="text-secondary">
                              Auction Status
                            </small>
                            <h5 className="mt-2">
                              {summary.auction_status?.toUpperCase()}
                            </h5>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body">
                            <small className="text-secondary">
                              Lowest Bid
                            </small>
                            <h5 className="text-success mt-2">
                              {formatAmount(summary.lowest_bid)}
                            </h5>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body">
                            <small className="text-secondary">
                              Highest Bid
                            </small>
                            <h5 className="text-primary mt-2">
                              {formatAmount(summary.highest_bid)}
                            </h5>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr />

                    <h6>Winning Supplier</h6>

                    {summary.winner ? (
                      <div className="alert alert-success mb-0">
                        <p>
                          <strong>Supplier Name:</strong>{' '}
                          {summary.winner.supplier_name}
                        </p>

                        <p>
                          <strong>Supplier Email:</strong>{' '}
                          {summary.winner.supplier_email}
                        </p>

                        <p className="mb-0">
                          <strong>Winning Bid:</strong>{' '}
                          {formatAmount(summary.winner.winning_bid)}
                        </p>
                      </div>
                    ) : summary.auction_status === 'closed' ? (
                      <div className="alert alert-warning mb-0">
                        Auction closed without any bids. No winner declared.
                      </div>
                    ) : (
                      <div className="alert alert-info mb-0">
                        Winner will be declared after the auction closes.
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Procurements
