import { useState } from 'react'
import { OrderForm }     from './OrderForm'
import { ConfirmDialog } from '../UI/ConfirmDialog'
import styles from './OrdersPage.module.css'

export function OrdersPage({ orders, setOrders, showToast }) {
  const [orderModal,    setOrderModal]    = useState(null)   // null | 'create' | order
  const [ctxMenu,       setCtxMenu]       = useState(null)   // {x, y, order}
  const [confirmDialog, setConfirmDialog] = useState(null)

  const submitOrder = data => {
    if (data.id && orders.find(o => o.id === data.id)) {
      setOrders(prev => prev.map(o => o.id === data.id ? data : o))
      showToast('Order updated')
    } else {
      setOrders(prev => [...prev, data])
      showToast('Order created')
    }
    setOrderModal(null)
  }

  const deleteOrder = id => {
    setConfirmDialog({
      msg: 'Delete this order?',
      sub: 'This will permanently remove the record.',
      onConfirm: () => {
        setOrders(prev => prev.filter(o => o.id !== id))
        setConfirmDialog(null)
        showToast('Order deleted')
      },
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Customer Orders
          <small>{orders.length} records</small>
        </h1>
        <button className="btn btn-primary" onClick={() => setOrderModal('create')}>
          + Create Order
        </button>
      </div>

      <div className={styles.tableWrap}>
        {orders.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 64, color: 'var(--text2)' }}>
            <div style={{ fontSize: 40 }}>📦</div>
            <strong style={{ color: 'var(--text)' }}>No orders yet</strong>
            <p style={{ fontSize: 13 }}>Click "Create Order" to add your first order.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                {['Customer ID','Customer Name','Order ID','Order Date','Product','Qty','Unit Price','Total','Status','Created By',''].map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, order: o }) }}>
                  <td className={styles.mono}>{o.customerId}</td>
                  <td className={styles.bold}>{o.customerName}</td>
                  <td className={styles.mono}>{o.orderId}</td>
                  <td className={styles.muted}>{o.orderDate}</td>
                  <td className={styles.bold}>{o.product}</td>
                  <td style={{ textAlign: 'center' }}>{o.quantity}</td>
                  <td className={styles.mono}>${o.unitPrice}</td>
                  <td className={styles.total}>${o.totalAmount}</td>
                  <td><span className={`badge badge-${o.status.toLowerCase().replace(/\s+/g, '-')}`}>{o.status}</span></td>
                  <td className={styles.muted}>{o.createdBy}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-icon primary" title="Edit"   onClick={() => setOrderModal(o)}>✏</button>
                      <button className="btn-icon danger"  title="Delete" onClick={() => deleteOrder(o.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Context menu */}
      {ctxMenu && (
        <div className="ctx-menu" style={{ left: ctxMenu.x, top: ctxMenu.y }} onClick={e => { e.stopPropagation(); setCtxMenu(null) }}>
          <div className="ctx-item" onClick={() => { setOrderModal(ctxMenu.order); setCtxMenu(null) }}>✏ Edit</div>
          <div className="ctx-item danger" onClick={() => { deleteOrder(ctxMenu.order.id); setCtxMenu(null) }}>🗑 Delete</div>
        </div>
      )}

      {/* Order modal */}
      {orderModal && (
        <div className="modal-overlay" onClick={() => setOrderModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <OrderForm order={orderModal === 'create' ? null : orderModal} onSubmit={submitOrder} onClose={() => setOrderModal(null)} />
          </div>
        </div>
      )}

      <ConfirmDialog dialog={confirmDialog} onClose={() => setConfirmDialog(null)} />
    </div>
  )
}
