import type { Metadata } from 'next';
import { CommunityAdmin } from '../../../components/community-admin';
export const metadata:Metadata = { title:'Administración de comunidad',robots:{ index:false,follow:false } };
export default function CommunityAdminPage() { return <CommunityAdmin/>; }
