import PropertiesPage from "./PropertiesPage";
import { useSEO } from "@/hooks/useSEO";

const PropertiesSellPage = () => {
  useSEO({
    title: "Sell Your Property in Nairobi | Property Sales Services - Miiza Realtors",
    description: "Sell your property in Nairobi with Miiza Realtors. Professional property sales services, market valuation, and expert guidance for homeowners.",
    keywords: "sell property Nairobi, property sales Kenya, real estate agent, property valuation",
    canonicalUrl: "https://miizarealtors.com/properties/sell"
  });

  return <PropertiesPage />;
};

export default PropertiesSellPage;

