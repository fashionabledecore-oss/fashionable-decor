import { Outlet } from 'react-router-dom'
import { AuthProvider } from './AuthProvider'

function AdminRoot() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

export default AdminRoot