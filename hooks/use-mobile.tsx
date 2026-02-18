import * as React from 'react'

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile
}

export function useDevice(): { device: DeviceType; isMobile: boolean; isTablet: boolean; isDesktop: boolean } {
  const [device, setDevice] = React.useState<DeviceType>('desktop')

  React.useEffect(() => {
    const updateDevice = () => {
      const width = window.innerWidth
      if (width < MOBILE_BREAKPOINT) {
        setDevice('mobile')
      } else if (width < TABLET_BREAKPOINT) {
        setDevice('tablet')
      } else {
        setDevice('desktop')
      }
    }

    updateDevice()
    window.addEventListener('resize', updateDevice)
    return () => window.removeEventListener('resize', updateDevice)
  }, [])

  return {
    device,
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop' || device === 'tablet',
  }
}
