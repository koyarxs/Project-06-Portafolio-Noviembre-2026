import Link from 'next/link';
import { Navigation } from './navigation';
import { PremiumFooter } from './premium-footer';
import { BusinessHoursStatus } from './business-hours-status';
import { businessHours } from '../lib/business-hours';
export function Header() {
 return <header className="site-header">
   <div className="header-topbar"><div className="header-topbar-inner">
     <Link href="/servicios" className="header-specialty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-16-2 20" /></svg><span>Desarrollo web <b>·</b> SaaS <b>·</b> APIs</span></Link>
     <div className="header-attention"><span className="header-hours"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></svg>{businessHours.label}<small>CHILE</small></span><BusinessHoursStatus /></div>
   </div></div>
   <div className="header-brand-row"><Link href="/" className="veltrix-wordmark" aria-label="YB Veltrix Solutions, inicio"><span className="header-brand-logo" role="img" aria-label="Logo original de YB Veltrix Solutions" /></Link></div>
   <div className="header-navigation-row"><div className="site-width header-inner"><span className="header-mobile-caption">INGENIERÍA & DESARROLLO WEB</span><Navigation /></div></div>
 </header>;
}
export function Footer() {
 return <PremiumFooter />;
}
