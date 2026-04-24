import { Scale } from 'lucide-react';
import { ManagePageType } from './ManagePageType';

export const ManageLegal = () => (
  <ManagePageType 
    pageType="legal" 
    title="Legal Notice" 
    icon={Scale}
    description="Manage legal notice pages"
  />
);

