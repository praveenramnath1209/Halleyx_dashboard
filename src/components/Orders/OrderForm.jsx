import { useState } from 'react'
import { STATUSES, PRODUCTS, COUNTRIES, CREATED_BY_OPTIONS, genId } from '../../data/constants'

// Plain helper — NOT a nested component (avoids focus-loss bug)
function F({ label, name, required = true, error, children }) {
  return (
    <div className="field">
      <label>{label}{required && <span className="req"> *</span>}</label>
      {children}
      {error && <span className="error-msg">{error}</span>}
    </div>
  )
}

const INIT = {
  firstName: '', lastName: '', email: '', phone: '',
  streetAddress: '', city: '', state: '', postalCode: '', country: '',
  product: '', quantity: '1', unitPrice: '',
  status: 'Pending', createdBy: '',
}

export function OrderForm({ order, onSubmit, onClose }) {
  const init = order ? {
    firstName:     order.firstName     || '',
    lastName:      order.lastName      || '',
    email:         order.email         || '',
    phone:         order.phone         || '',
    streetAddress: order.streetAddress || '',
    city:          order.city          || '',
    state:         order.state         || '',
    postalCode:    order.postalCode    || '',
    country:       order.country       || '',
    product:       order.product       || '',
    quantity:      String(order.quantity   || 1),
    unitPrice:     String(order.unitPrice  || ''),
    status:        order.status        || 'Pending',
    createdBy:     order.createdBy     || '',
  } : { ...INIT }

  const [f, setF]     = useState(init)
  const [errs, setE]  = useState({})

  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const qty   = Math.max(1, parseInt(f.quantity)    || 1)
  const price = parseFloat(f.unitPrice) || 0
  const total = (qty * price).toFixed(2)

  const required = ['firstName','lastName','email','phone','streetAddress','city','state','postalCode','country','product','quantity','unitPrice','status','createdBy']

  const validate = () => {
    const e = {}
    required.forEach(k => { if (!String(f[k]).trim()) e[k] = 'Please fill the field' })
    if (parseFloat(f.unitPrice) <= 0 && f.unitPrice !== '') e.unitPrice = 'Please fill the field'
    setE(e)
    return Object.keys(e).length === 0
  }

  const submit = () => {
    if (!validate()) return
    const q = Math.max(1, parseInt(f.quantity) || 1)
    const p = parseFloat(f.unitPrice) || 0
    onSubmit({
      ...f,
      id:           order?.id || genId(),
      orderId:      order?.orderId || 'ORD-' + String(Math.floor(Math.random() * 90000) + 10000),
      orderDate:    order?.orderDate || new Date().toISOString().split('T')[0],
      // computed / display helpers
      customerName: `${f.firstName} ${f.lastName}`.trim(),
      customerId:   order?.customerId || 'C' + String(Math.floor(Math.random() * 9000) + 1000),
      address:      `${f.streetAddress}, ${f.city}, ${f.state} ${f.postalCode}, ${f.country}`,
      quantity:     q,
      unitPrice:    p,
      totalAmount:  +(q * p).toFixed(2),
    })
  }

  const inp = (k, extra = {}) => (
    <input
      className={`input ${errs[k] ? 'error' : ''}`}
      value={f[k]} onChange={e => set(k, e.target.value)}
      autoComplete="off" {...extra}
    />
  )
  const sel = (k, opts, placeholder = '') => (
    <select
      className={`select ${errs[k] ? 'error' : ''}`}
      value={f[k]} onChange={e => set(k, e.target.value)}
    >
      <option value="">{placeholder || 'Select…'}</option>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  return (
    <>
      <div className="modal-header">
        <div className="modal-title">{order ? 'Edit Order' : 'Create Order'}</div>
        <button className="btn-icon" onClick={onClose}>✕</button>
      </div>

      <div className="modal-body">
        {/* ── Customer Information ── */}
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 2 }}>
          Customer Information
        </div>

        <div className="form-grid">
          <F label="First name"    error={errs.firstName}>{inp('firstName')}</F>
          <F label="Last name"     error={errs.lastName}>{inp('lastName')}</F>
          <F label="Email ID"      error={errs.email}>{inp('email', { type: 'email' })}</F>
          <F label="Phone number"  error={errs.phone}>{inp('phone', { type: 'tel' })}</F>
        </div>

        <F label="Street Address" error={errs.streetAddress}>{inp('streetAddress')}</F>

        <div className="form-grid">
          <F label="City"           error={errs.city}>{inp('city')}</F>
          <F label="State / Province" error={errs.state}>{inp('state')}</F>
          <F label="Postal code"    error={errs.postalCode}>{inp('postalCode')}</F>
          <F label="Country"        error={errs.country}>{sel('country', COUNTRIES)}</F>
        </div>

        {/* ── Order Information ── */}
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 4, marginBottom: 2 }}>
          Order Information
        </div>

        <F label="Choose product" error={errs.product}>{sel('product', PRODUCTS, 'Select product…')}</F>

        <div className="form-grid">
          <F label="Quantity" error={errs.quantity}>
            <input
              className={`input ${errs.quantity ? 'error' : ''}`}
              type="number" min={1} value={f.quantity}
              onChange={e => set('quantity', String(Math.max(1, parseInt(e.target.value) || 1)))}
              autoComplete="off"
            />
          </F>
          <F label="Unit price ($)" error={errs.unitPrice}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)', fontWeight: 600, fontSize: 13, pointerEvents: 'none' }}>$</span>
              <input
                className={`input ${errs.unitPrice ? 'error' : ''}`}
                type="number" min={0} step="0.01" value={f.unitPrice}
                onChange={e => set('unitPrice', e.target.value)}
                style={{ paddingLeft: 22 }} autoComplete="off"
              />
            </div>
          </F>
        </div>

        {/* Total amount — readonly calculated */}
        <F label="Total amount" required={false}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)', fontWeight: 600, fontSize: 13, pointerEvents: 'none' }}>$</span>
            <input className="input" readOnly value={total} style={{ paddingLeft: 22, background: 'var(--surface3)', color: 'var(--text2)', cursor: 'default' }} />
          </div>
        </F>

        <div className="form-grid">
          <F label="Status" error={errs.status}>{sel('status', STATUSES)}</F>
          <F label="Created by" error={errs.createdBy}>{sel('createdBy', CREATED_BY_OPTIONS, 'Select…')}</F>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit}>Submit</button>
      </div>
    </>
  )
}
