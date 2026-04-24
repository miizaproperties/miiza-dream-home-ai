import { MessageSquare } from 'lucide-react';
import { ManagePageType } from './ManagePageType';

export const ManageForum = () => (
  <ManagePageType 
    pageType="forum" 
    title="Forum" 
    icon={MessageSquare}
    description="Manage forum pages"
  />
);

