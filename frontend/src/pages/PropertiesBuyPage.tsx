import PropertiesPage from "./PropertiesPage";
import { useSEO } from "@/hooks/useSEO";

const PropertiesBuyPage = () => {
  useSEO({
    title: "Properties for Sale in Nairobi | Buy Real Estate - Miiza Realtors",
    description: "Browse properties for sale in Nairobi. Find apartments, houses, and commercial spaces for purchase through Miiza Realtors with flexible payment options.",
    keywords: "properties for sale Nairobi, buy property Kenya, houses for sale, apartments for sale",
    canonicalUrl: "https://miizarealtors.com/properties/buy"
  });

  return <PropertiesPage />;
};

export default PropertiesBuyPage;

