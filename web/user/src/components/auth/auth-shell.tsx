import { CompassIcon, MapPinIcon, SparklesIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { AuthBackButton } from '@/components/auth/auth-back-button'

const HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80'

type AuthShellProps = {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={HERO_IMAGE_URL}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/55 to-slate-800/30" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2 text-sm font-medium text-white/90">
            <MapPinIcon className="size-4" />
            Trip Planner
          </div>
          <div className="max-w-md space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-balance">
                Plan trips you will actually remember
              </h1>
              <p className="text-base leading-relaxed text-white/80">
                Organize destinations by day, keep every detail in one place, and
                travel with a plan that feels effortless.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-white/85">
              <li className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-white/10">
                  <CompassIcon className="size-4" />
                </span>
                Build day-by-day itineraries
              </li>
              <li className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-white/10">
                  <MapPinIcon className="size-4" />
                </span>
                Save locations and revisit them anytime
              </li>
              <li className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-white/10">
                  <SparklesIcon className="size-4" />
                </span>
                Start planning in minutes
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col">
        <div className="absolute top-4 left-4 z-20 sm:top-6 sm:left-6">
          <AuthBackButton className="text-white hover:bg-white/10 hover:text-white lg:text-muted-foreground lg:hover:bg-muted lg:hover:text-foreground" />
        </div>
        <div className="relative h-40 overflow-hidden lg:hidden">
          <img
            src={HERO_IMAGE_URL}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/55" />
          <div className="relative flex h-full flex-col justify-end p-6 text-white">
            <p className="text-sm font-medium text-white/80">Trip Planner</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Your next adventure starts here
            </h1>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  )
}
