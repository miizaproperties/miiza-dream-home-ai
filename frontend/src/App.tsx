import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import Chatbot from "@/components/Chatbot";
import QuickActions from "@/components/QuickActions";
import PageLoader from "@/components/ui/page-loader";
import PerformanceMonitor from "@/components/ui/performance-monitor";
// Lazy loaded components
const Index = lazy(() => import("./pages/Index"));
const PropertiesPage = lazy(() => import("./pages/PropertiesPage"));
const OptimizedPropertiesPage = lazy(() => import("./pages/OptimizedPropertiesPage"));
const PropertiesRentPage = lazy(() => import("./pages/PropertiesRentPage"));
const PropertiesBuyPage = lazy(() => import("./pages/PropertiesBuyPage"));
const PropertiesSellPage = lazy(() => import("./pages/PropertiesSellPage"));
const PropertyDetailsPage = lazy(() => import("./pages/PropertyDetailsPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const CareersPage = lazy(() => import("./pages/CareersPage"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const ArticlesPage = lazy(() => import("./pages/ArticlesPage"));
const NewsArticlesPage = lazy(() => import("./pages/news/ArticlesPage"));
const SingleArticle = lazy(() => import("./pages/news/SingleArticle"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const AnnouncementsPage = lazy(() => import("./pages/AnnouncementsPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const HelpCenterPage = lazy(() => import("./pages/HelpCenterPage"));
const PageView = lazy(() => import("./pages/PageView"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Service Pages
const PropertySalesPage = lazy(() => import("./pages/services/PropertySalesPage"));
const PropertyRentalsPage = lazy(() => import("./pages/services/PropertyRentalsPage"));
const PropertyManagementPage = lazy(() => import("./pages/services/PropertyManagementPage"));
const RealEstateMarketingPage = lazy(() => import("./pages/services/RealEstateMarketingPage"));
const TenantPlacementPage = lazy(() => import("./pages/services/TenantPlacementPage"));
const PropertyAdvisoryPage = lazy(() => import("./pages/services/PropertyAdvisoryPage"));

// Dashboard components
import { AuthProvider } from "./dashboard/hooks/useAuth";
import { AuthGuard } from "./dashboard/components/AuthGuard";
import { DashboardLayout } from "./dashboard/components/DashboardLayout";
const Login = lazy(() => import("./dashboard/pages/Login").then(module => ({ default: module.Login })));
const Dashboard = lazy(() => import("./dashboard/pages/Dashboard").then(module => ({ default: module.Dashboard })));
const Analytics = lazy(() => import("./dashboard/pages/Analytics").then(module => ({ default: module.Analytics })));
const DashboardProperties = lazy(() => import("./dashboard/pages/DashboardProperties").then(module => ({ default: module.DashboardProperties })));
const DashboardUsers = lazy(() => import("./dashboard/pages/DashboardUsers").then(module => ({ default: module.DashboardUsers })));
const AddProperty = lazy(() => import("./dashboard/pages/AddProperty").then(module => ({ default: module.AddProperty })));
const ViewPendingViewings = lazy(() => import("./dashboard/pages/ViewPendingViewings").then(module => ({ default: module.ViewPendingViewings })));
const ManageAgents = lazy(() => import("./dashboard/pages/ManageAgents").then(module => ({ default: module.ManageAgents })));
const ViewContacts = lazy(() => import("./dashboard/pages/ViewContacts").then(module => ({ default: module.ViewContacts })));
const EditProperty = lazy(() => import("./dashboard/pages/EditProperty").then(module => ({ default: module.EditProperty })));
const AddUser = lazy(() => import("./dashboard/pages/AddUser").then(module => ({ default: module.AddUser })));
const EditUser = lazy(() => import("./dashboard/pages/EditUser").then(module => ({ default: module.EditUser })));
const ChangePassword = lazy(() => import("./dashboard/pages/ChangePassword").then(module => ({ default: module.ChangePassword })));
const ManagePages = lazy(() => import("./dashboard/pages/ManagePages").then(module => ({ default: module.ManagePages })));
const AddPage = lazy(() => import("./dashboard/pages/AddPage").then(module => ({ default: module.AddPage })));
const EditPage = lazy(() => import("./dashboard/pages/EditPage").then(module => ({ default: module.EditPage })));
const AddArticle = lazy(() => import("./dashboard/pages/AddArticle").then(module => ({ default: module.AddArticle })));
const EditArticle = lazy(() => import("./dashboard/pages/EditArticle").then(module => ({ default: module.EditArticle })));
const AgentDashboard = lazy(() => import("./dashboard/pages/AgentDashboard").then(module => ({ default: module.AgentDashboard })));
const ManageCareers = lazy(() => import("./dashboard/pages/ManageCareers").then(module => ({ default: module.ManageCareers })));
const ManageArticles = lazy(() => import("./dashboard/pages/ManageArticles").then(module => ({ default: module.ManageArticles })));
const ManageLegal = lazy(() => import("./dashboard/pages/ManageLegal").then(module => ({ default: module.ManageLegal })));
const ManageAnnouncements = lazy(() => import("./dashboard/pages/ManageAnnouncements").then(module => ({ default: module.ManageAnnouncements })));
const ManageTestimonials = lazy(() => import("./dashboard/pages/ManageTestimonials").then(module => ({ default: module.ManageTestimonials })));
const ManageEvents = lazy(() => import("./dashboard/pages/ManageEvents").then(module => ({ default: module.ManageEvents })));

const queryClient = new QueryClient();

// Component to conditionally show Chatbot on non-admin routes
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <Routes>
        <Route path="/" element={<Suspense fallback={<PageLoader />}><Index /></Suspense>} />
        <Route path="/properties" element={<Suspense fallback={<PageLoader />}><PropertiesPage /></Suspense>} />
        <Route path="/properties-optimized" element={<Suspense fallback={<PageLoader />}><OptimizedPropertiesPage /></Suspense>} />
        <Route path="/properties/rent" element={<Suspense fallback={<PageLoader />}><PropertiesRentPage /></Suspense>} />
        <Route path="/properties/buy" element={<Suspense fallback={<PageLoader />}><PropertiesBuyPage /></Suspense>} />
        <Route path="/properties/sell" element={<Suspense fallback={<PageLoader />}><PropertiesSellPage /></Suspense>} />
        <Route path="/property/:identifier" element={<Suspense fallback={<PageLoader />}><PropertyDetailsPage key={location.pathname} /></Suspense>} />
        <Route path="/about" element={<Suspense fallback={<PageLoader />}><AboutPage /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<PageLoader />}><ContactPage /></Suspense>} />
        <Route path="/careers" element={<Suspense fallback={<PageLoader />}><CareersPage /></Suspense>} />
        <Route path="/careers/job/:id" element={<Suspense fallback={<PageLoader />}><JobDetails /></Suspense>} />
        <Route path="/articles" element={<Suspense fallback={<PageLoader />}><NewsArticlesPage /></Suspense>} />
        <Route path="/articles/:slug" element={<Suspense fallback={<PageLoader />}><SingleArticle /></Suspense>} />
        <Route path="/articles-old" element={<Suspense fallback={<PageLoader />}><ArticlesPage /></Suspense>} />
        <Route path="/legal" element={<Suspense fallback={<PageLoader />}><LegalPage /></Suspense>} />
        <Route path="/announcements" element={<Suspense fallback={<PageLoader />}><AnnouncementsPage /></Suspense>} />
        <Route path="/faq" element={<Suspense fallback={<PageLoader />}><FAQPage /></Suspense>} />
        <Route path="/events" element={<Suspense fallback={<PageLoader />}><EventsPage /></Suspense>} />
        <Route path="/help-center" element={<Suspense fallback={<PageLoader />}><HelpCenterPage /></Suspense>} />
        <Route path="/page/:slug" element={<Suspense fallback={<PageLoader />}><PageView /></Suspense>} />
        
        {/* Services */}
        <Route path="/services" element={<Suspense fallback={<PageLoader />}><ServicesPage /></Suspense>} />

        {/* Service Pages */}
        <Route path="/services/sales" element={<Suspense fallback={<PageLoader />}><PropertySalesPage /></Suspense>} />
        <Route path="/services/rentals" element={<Suspense fallback={<PageLoader />}><PropertyRentalsPage /></Suspense>} />
        <Route path="/services/management" element={<Suspense fallback={<PageLoader />}><PropertyManagementPage /></Suspense>} />
        <Route path="/services/marketing" element={<Suspense fallback={<PageLoader />}><RealEstateMarketingPage /></Suspense>} />
        <Route path="/services/tenant-placement" element={<Suspense fallback={<PageLoader />}><TenantPlacementPage /></Suspense>} />
        <Route path="/services/advisory" element={<Suspense fallback={<PageLoader />}><PropertyAdvisoryPage /></Suspense>} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />

        {/* Change Password Route */}
        <Route
          path="/admin/change-password"
          element={
            <AuthGuard>
              <Suspense fallback={<PageLoader />}><ChangePassword /></Suspense>
            </AuthGuard>
          }
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/admin"
          element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
          <Route path="agent" element={<Suspense fallback={<PageLoader />}><AgentDashboard /></Suspense>} />
          <Route path="analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
          <Route path="properties" element={<Suspense fallback={<PageLoader />}><DashboardProperties /></Suspense>} />
          <Route path="properties/add" element={<Suspense fallback={<PageLoader />}><AddProperty /></Suspense>} />
          <Route path="properties/edit/:id" element={<Suspense fallback={<PageLoader />}><EditProperty /></Suspense>} />
          <Route path="viewings" element={<Suspense fallback={<PageLoader />}><ViewPendingViewings /></Suspense>} />
          <Route path="agents" element={<Suspense fallback={<PageLoader />}><ManageAgents /></Suspense>} />
          <Route path="contacts" element={<Suspense fallback={<PageLoader />}><ViewContacts /></Suspense>} />
          <Route path="users" element={<Suspense fallback={<PageLoader />}><DashboardUsers /></Suspense>} />
          <Route path="users/add" element={<Suspense fallback={<PageLoader />}><AddUser /></Suspense>} />
          <Route path="users/edit/:id" element={<Suspense fallback={<PageLoader />}><EditUser /></Suspense>} />
          <Route path="pages" element={<Suspense fallback={<PageLoader />}><ManagePages /></Suspense>} />
          <Route path="pages/add" element={<Suspense fallback={<PageLoader />}><AddPage /></Suspense>} />
          <Route path="pages/edit/:id" element={<Suspense fallback={<PageLoader />}><EditPage /></Suspense>} />
          <Route path="careers" element={<Suspense fallback={<PageLoader />}><ManageCareers /></Suspense>} />
          <Route path="articles" element={<Suspense fallback={<PageLoader />}><ManageArticles /></Suspense>} />
          <Route path="articles/add" element={<Suspense fallback={<PageLoader />}><AddArticle /></Suspense>} />
          <Route path="articles/edit/:id" element={<Suspense fallback={<PageLoader />}><EditArticle /></Suspense>} />
          <Route path="legal" element={<Suspense fallback={<PageLoader />}><ManageLegal /></Suspense>} />
          <Route path="announcements" element={<Suspense fallback={<PageLoader />}><ManageAnnouncements /></Suspense>} />
          <Route path="testimonials" element={<Suspense fallback={<PageLoader />}><ManageTestimonials /></Suspense>} />
          <Route path="events" element={<Suspense fallback={<PageLoader />}><ManageEvents /></Suspense>} />
        </Route>

        {/* Redirect old dashboard routes to admin */}
        <Route path="/dashboard/*" element={<Navigate to="/admin" replace />} />

        <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
      </Routes>
      {!isAdminRoute && (
        <>
          <Chatbot />
          <QuickActions />
        </>
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <AppContent />
          <PerformanceMonitor />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
