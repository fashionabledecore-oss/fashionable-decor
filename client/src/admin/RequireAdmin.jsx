import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import AdminLayout from './AdminLayout'
import Loader from '../components/common/Loader'
import Seo from '../components/common/Seo'
import { siteConfig } from '../config/site'

function RequireAdmin() {
  const { admin, checking } = useAuth()
  const location = useLocation()

  if (checking) {
    return (
      <>
        <Seo title={`Admin | ${siteConfig.name}`} noindex />
        <Loader fullPage label="Checking login..." />
      </>
    )
  }
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />

  return <AdminLayout />
}

export default RequireAdmin