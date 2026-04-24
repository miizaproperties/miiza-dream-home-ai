import { BookOpen } from 'lucide-react';
import { ManagePageType } from './ManagePageType';

export const ManageHelpCenter = () => (
  <ManagePageType 
    pageType="help_center" 
    title="Help center" 
    icon={BookOpen}
    description="Manage help center pages"
  />
);

