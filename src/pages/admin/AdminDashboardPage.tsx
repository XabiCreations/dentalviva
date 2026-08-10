import { useAdminAuth } from '../../admin/AdminAuthContext'

export default function AdminDashboardPage() {
  const { dentist } = useAdminAuth()

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-h4 font-bold text-text mb-1">
          Buenos días, {dentist?.name.replace(/^(Dr\.|Dra\.)\s+/i, '').split(' ')[0]}
        </h1>
        <p className="text-muted text-body-sm">Panel de administración · DentalViva</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Siguiente paciente — placeholder */}
        <div className="bg-white border border-border rounded-2xl shadow-card p-6 min-h-[280px] flex items-center justify-center">
          <p className="text-muted text-body-sm">Siguiente paciente — próximamente</p>
        </div>

        {/* Citas pendientes — placeholder */}
        <div className="bg-white border border-border rounded-2xl shadow-card p-6 min-h-[280px] flex items-center justify-center">
          <p className="text-muted text-body-sm">Citas pendientes — próximamente</p>
        </div>
      </div>
    </div>
  )
}
