
import { useEffect, useState } from 'react'
import api from '../services/api'

function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [procurements, setProcurements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [invitationLink, setInvitationLink] = useState('')

  const [formData, setFormData] = useState({
    procurement: '',
    supplier_name: '',
    supplier_email: '',
  })

  const fetchData = async () => {
    try {
      const [supplierResponse, procurementResponse] =
        await Promise.all([
          api.get('invitations/'),
          api.get('procurements/'),
        ])

      setSuppliers(supplierResponse.data)
      setProcurements(procurementResponse.data)
    } catch (err) {
      setError('Unable to load supplier data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
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
    setInvitationLink('')

    try {
      const response = await api.post('invitations/', {
        ...formData,
        procurement: Number(formData.procurement),
      })

      setMessage('Supplier added successfully.')

      const link = `${window.location.origin}${response.data.invitation_link}`
      setInvitationLink(link)

      setFormData({
        procurement: '',
        supplier_name: '',
        supplier_email: '',
      })

      await fetchData()
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : 'Unable to add supplier.'
      )
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink)
      setMessage('Invitation link copied successfully.')
    } catch (err) {
      setError('Unable to copy link. Please copy it manually.')
    }
  }

  return (
    <div className="container-fluid p-4">
      <h4>Supplier Management</h4>

      <p className="text-secondary">
        Add suppliers and share their invitation links manually.
      </p>

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {invitationLink && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5>Supplier Invitation Link</h5>

            <p className="text-secondary">
              Share this link with the supplier.
            </p>

            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={invitationLink}
                readOnly
              />

              <button
                type="button"
                className="btn btn-success"
                onClick={copyLink}
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <h5 className="mb-3">Add New Supplier</h5>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">
                Select Procurement
              </label>

              <select
                name="procurement"
                className="form-select"
                value={formData.procurement}
                onChange={handleChange}
                required
              >
                <option value="">Choose procurement</option>

                {procurements
                  .filter((item) => item.is_active)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Supplier Name</label>

              <input
                type="text"
                name="supplier_name"
                className="form-control"
                value={formData.supplier_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Supplier Email</label>

              <input
                type="email"
                name="supplier_email"
                className="form-control"
                value={formData.supplier_email}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Add Supplier
            </button>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h5 className="mb-3">Suppliers List</h5>

          {loading ? (
            <p>Loading suppliers...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Supplier Name</th>
                    <th>Email</th>
                    <th>Procurement ID</th>
                    <th>Created At</th>
                  </tr>
                </thead>

                <tbody>
                  {suppliers.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.supplier_name}</td>
                      <td>{item.supplier_email}</td>
                      <td>{item.procurement}</td>
                      <td>
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}

                  {suppliers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No suppliers found.
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

export default Suppliers
