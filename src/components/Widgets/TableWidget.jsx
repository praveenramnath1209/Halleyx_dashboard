import { useState } from 'react'
import styles from './TableWidget.module.css'
import { TABLE_COLUMNS } from '../../data/constants'

function getCell(order, col) {
  const k = col.toLowerCase().replace(/\s/g, '')
  const map = {
    customerid: order.customerId, customername: order.customerName,
    emailid: order.email, phonenumber: order.phone, address: order.address,
    orderid: order.orderId, orderdate: order.orderDate, product: order.product,
    quantity: order.quantity, unitprice: '$' + order.unitPrice,
    totalamount: '$' + order.totalAmount, status: order.status, createdby: order.createdBy,
  }
  return map[k] ?? '–'
}

export function TableWidget({ config, orders }) {
  const [page, setPage] = useState(0)
  const cols      = config.columns?.length ? config.columns : TABLE_COLUMNS.slice(0, 5)
  const pageSize  = parseInt(config.pagination) || 10
  const fontSize  = config.fontSize || 14
  const headerBg  = config.headerBg || '#5b6af9'

  let sorted = [...orders]
  if (config.sortBy === 'Ascending')  sorted.sort((a, b) => a.orderId.localeCompare(b.orderId))
  if (config.sortBy === 'Descending') sorted.sort((a, b) => b.orderId.localeCompare(a.orderId))
  if (config.sortBy === 'Order date') sorted.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))

  const pages = Math.ceil(sorted.length / pageSize)
  const rows  = sorted.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className={styles.wrap} style={{ fontSize }}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {cols.map(c => (
                <th key={c} style={{ background: headerBg, color: '#fff', padding: '7px 10px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(o => (
              <tr key={o.id}>
                {cols.map(c => (
                  <td key={c} style={{ padding: '6px 10px', color: 'var(--text)', whiteSpace: 'nowrap', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', borderBottom: '1px solid var(--border)', fontSize }}>
                    {getCell(o, c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              className={`${styles.pageBtn} ${i === page ? styles.active : ''}`}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
