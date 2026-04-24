import { Briefcase } from 'lucide-react';
import { ManagePageType } from './ManagePageType';

export const ManageCareers = () => (
  <ManagePageType 
    pageType="careers" 
    title="Careers" 
    icon={Briefcase}
    description="Manage careers pages"
  />
);

