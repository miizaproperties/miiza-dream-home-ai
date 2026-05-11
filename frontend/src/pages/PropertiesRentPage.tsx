import PropertiesPage from "./PropertiesPage";
import { useSEO } from "@/hooks/useSEO";

const PropertiesRentPage = () => {
  useSEO({
    title: "Properties for Rent in Nairobi | Rental Apartments & Houses - Miiza Realtors",
    description: "Find rental properties in Nairobi. Browse apartments, houses, and commercial spaces for rent with flexible leasing options through Miiza Realtors.",
    keywords: "properties for rent Nairobi, rental apartments Kenya, houses for rent, commercial space rental",
    canonicalUrl: "https://miizarealtors.com/properties/rent"
  });

  return <PropertiesPage />;
};

export default PropertiesRentPage;

