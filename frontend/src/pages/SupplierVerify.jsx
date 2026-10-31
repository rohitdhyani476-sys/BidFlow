
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

function SupplierVerify() {
  const { invitationId } = useParams()

  const [invitation, setInvitation] = useState(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await api.get(`invitations/${invitationId}/`)
        setInvitation(response.data)
      } catch (err) {
        setError(
          err.response?.data?.detail ||
          'Unable to load invitation details.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchInvitation()
  }, [invitationId])

  const formatDateTime = (value) => {
    if (!value) return 'Not specified'

    return new Date(value).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid bid amount.')
      return
    }

    try {
      setSubmitting(true)

      await api.post('bids/', {
        procurement: invitation.procurement_id,
        amount: amount,
        invitation_id: invitation.invitation_id,
      })

      setSuccess('Your bid has been submitted successfully!')
      setAmount('')
    } catch (err) {
      const errorData = err.response?.data

      setError(
        errorData?.error ||
        errorData?.amount?.[0] ||
        'Unable to submit your bid. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" />
        <p className="mt-3">Loading invitation...</p>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <h4>Invitation Not Found</h4>
          {error || 'Unable to load invitation details.'}
        </div>
      </div>
    )
  }

  const status = invitation.auction_status
  const isAuctionActive = status === 'active'

  const statusClass = {
    scheduled: 'bg-warning text-dark',
    active: 'bg-success',
    closed: 'bg-danger',
  }[status] || 'bg-secondary'

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card border-0 shadow">
            <div className="card-body p-4">

              <div className="text-center mb-4">
                <h2 className="text-primary">BidFlow</h2>
                <span className="badge bg-success">
                  Supplier Invitation
                </span>
              </div>

              <h4>Welcome, {invitation.supplier_name}!</h4>

              <p className="text-secondary">
                You are invited to participate in this procurement auction.
              </p>

              <hr />

              <p>
                <strong>Supplier:</strong> {invitation.supplier_name}
              </p>

              <p>
                <strong>Email:</strong> {invitation.supplier_email}
              </p>

              <p>
                <strong>Procurement:</strong> {invitation.procurement_title}
              </p>

              <p>
                <strong>Description:</strong> {invitation.description}
              </p>

              <p>
                <strong>Quantity:</strong> {invitation.quantity}
              </p>

              <p>
                <strong>Starting Price:</strong> ₹{invitation.starting_price}
              </p>

              <hr />

              <h5>Auction Information</h5>

              <p>
                <strong>Status:</strong>{' '}
                <span className={`badge ${statusClass}`}>
                  {status ? status.toUpperCase() : 'UNKNOWN'}
                </span>
              </p>

              <p>
                <strong>Start Time:</strong>{' '}
                {formatDateTime(invitation.start_time)}
              </p>

              <p>
                <strong>End Time:</strong>{' '}
                {formatDateTime(invitation.end_time)}
              </p>

              <hr />

              <h5 className="mb-3">Submit Your Bid</h5>

              {!isAuctionActive && (
                <div className="alert alert-warning">
                  {status === 'scheduled'
                    ? 'This auction has not started yet. You can submit your bid once it becomes active.'
                    : status === 'closed'
                    ? 'This auction is closed. Bids are no longer accepted.'
                    : 'Bidding is currently unavailable.'}
                </div>
              )}

              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              {success && (
                <div className="alert alert-success">{success}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">
                    Your Bid Amount (₹)
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter your bid amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    required
                    disabled={!isAuctionActive || submitting}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={!isAuctionActive || submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Bid'}
                </button>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupplierVerify
