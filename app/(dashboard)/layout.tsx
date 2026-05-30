import Image from 'next/image'
import { DashboardShell } from '@/components/DashboardShell'

export const dynamic = 'force-dynamic'

function GovernmentBanner() {
  return (
    <div className="w-full bg-white border-b border-gray-200 px-4 py-2">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-3 items-center gap-4 min-h-[74px]">

        {/* Left — French */}
        <div className="text-left leading-tight">
          <p className="font-bold text-gray-900 text-sm">Royaume du Maroc</p>
          <p className="text-gray-700 text-[11px] mt-0.5">
            Ministère de la Transition Énergétique<br />et du Développement Durable
          </p>
          <p className="text-gray-400 text-[10px] mt-0.5">Département de l&apos;Énergie et des Mines</p>
        </div>

        {/* Center — Logo */}
        <div className="flex justify-center">
          <Image
            src="/logo-maroc.png"
            alt="Logo Royaume du Maroc"
            width={80}
            height={80}
            className="object-contain"
            priority
          />
        </div>

        {/* Right — Arabic */}
        <div className="text-right leading-tight" dir="rtl">
          <p className="font-bold text-gray-900 text-sm">المملكة المغربية</p>
          <p className="text-gray-700 text-[11px] mt-0.5">
            وزارة الطاقة والمعادن والماء والبيئة
          </p>
          <p className="text-gray-400 text-[10px] mt-0.5">قطاع الطاقة والمعادن</p>
        </div>

      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GovernmentBanner />
      <DashboardShell>
        {children}
      </DashboardShell>
    </>
  )
}
