import { HelpCircle } from 'lucide-react';
import { ManagePageType } from './ManagePageType';

export const ManageFAQ = () => (
  <ManagePageType 
    pageType="faq" 
    title="FAQ" 
    icon={HelpCircle}
    description="Manage frequently asked questions pages"
  />
);

