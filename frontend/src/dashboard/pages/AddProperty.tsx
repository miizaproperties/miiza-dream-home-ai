import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { dashboardApi } from '../services/dashboardApi';
import { propertiesApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useFeaturedProperties } from '@/hooks/useFeaturedProperties';

interface PropertyFormData {
  title: string;
  description: string;
  property_type: string;
  status: string;
  development_type?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  bedrooms: string;
  bathrooms: string;
  square_feet: number;
  max_guests: number;
  price: number;
  rental_price_per_night: number;
  currency: string;
  is_for_sale: boolean;
  is_for_rent: boolean;
  featured: boolean;
  rental_duration?: string;
  amenities: string[];
}

export const AddProperty: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { invalidateFeaturedProperties } = useFeaturedProperties();
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mainImagePreviewRef = useRef<string | null>(null);
  const imagePreviewsRef = useRef<string[]>([]);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PropertyFormData>({
    defaultValues: {
      property_type: 'apartment',
      status: 'available',
      country: 'Kenya',
      currency: 'KSH',
      bedrooms: '',
      bathrooms: '',
      square_feet: 0,
      max_guests: 2,
      price: 0,
      rental_price_per_night: 0,
      is_for_sale: true,
      is_for_rent: false,
      featured: false,
      amenities: [],
    },
  });

  const propertyType = watch('property_type');
  const status = watch('status');
  const isForSale = watch('is_for_sale');
  const isForRent = watch('is_for_rent');
  const selectedAmenities = watch('amenities') || [];
  const [isAirbnb, setIsAirbnb] = useState(false);

  // Validation function for comma-separated numbers
  const validateCommaSeparatedNumbers = (value: string) => {
    if (!value || value.trim() === '') {
      return 'This field is required';
    }
    
    const numbers = value.split(',').map(n => n.trim());
    const isValid = numbers.every(n => {
      const num = parseInt(n);
      return !isNaN(num) && num >= 0 && num.toString() === n;
    });
    
    if (!isValid) {
      return 'Please enter valid positive numbers separated by commas (e.g., 1,2,4,6)';
    }
    
    return true;
  };

  // Auto-check Airbnb when property type is airbnb
  useEffect(() => {
    if (propertyType === 'airbnb') {
      setIsAirbnb(true);
      setValue('is_for_rent', true);
    }
  }, [propertyType, setValue]);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Clean up previous preview URL
      if (mainImagePreviewRef.current) {
        URL.revokeObjectURL(mainImagePreviewRef.current);
      }
      setMainImage(file);
      const previewUrl = URL.createObjectURL(file);
      setMainImagePreview(previewUrl);
      mainImagePreviewRef.current = previewUrl;
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      // Clean up previous preview URLs
      imagePreviewsRef.current.forEach(url => URL.revokeObjectURL(url));
      setImages(newImages);
      const previewUrls = newImages.map(img => URL.createObjectURL(img));
      setImagePreviews(previewUrls);
      imagePreviewsRef.current = previewUrls;
    }
  };

  const removeImage = (index: number) => {
    // Clean up the preview URL
    if (imagePreviewsRef.current[index]) {
      URL.revokeObjectURL(imagePreviewsRef.current[index]);
    }
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
    imagePreviewsRef.current = newPreviews;
  };

  const removeMainImage = () => {
    // Clean up the preview URL
    if (mainImagePreviewRef.current) {
      URL.revokeObjectURL(mainImagePreviewRef.current);
    }
    setMainImage(null);
    setMainImagePreview(null);
    mainImagePreviewRef.current = null;
  };

  // Cleanup all object URLs on unmount
  useEffect(() => {
    return () => {
      if (mainImagePreviewRef.current) {
        URL.revokeObjectURL(mainImagePreviewRef.current);
      }
      imagePreviewsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const onSubmit = async (data: PropertyFormData) => {
    // Validate development_type when status is development
    if (data.status === 'development' && !data.development_type) {
      toast.error('Please select a development type when status is Development');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add all property fields with safer number handling to avoid sending "NaN" or invalid values
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'amenities') {
          // Handle amenities array - append each as separate field with same name
          if (Array.isArray(value) && value.length > 0) {
            value.forEach((amenity) => {
              formData.append('amenities', amenity);
            });
          }
          return;
        }

        if (typeof value === 'boolean') {
          formData.append(key, value.toString());
          return;
        }

        if (typeof value === 'number') {
          // Skip NaN so the backend can apply its own defaults
          if (Number.isNaN(value)) {
            return;
          }
          formData.append(key, value.toString());
          return;
        }

        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value.toString());
        }
      });

      // Add images
      if (mainImage) {
        formData.append('main_image', mainImage);
      }

      images.forEach((image) => {
        formData.append('images', image);
      });

      const result = await dashboardApi.createProperty(formData);

      if (result.success) {
        // Invalidate queries to refresh the properties list
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'properties'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'analytics'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'activity'] });
        
        // Invalidate featured properties cache to refresh the featured section
        invalidateFeaturedProperties();

        toast.success('Property created successfully!');
        // Redirect to properties list page
        navigate('/admin/properties', { replace: true });
      } else {
        throw new Error(result.error || 'Failed to create property');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableAmenities = [
    '24/7 Security', 'Air Conditioning', 'Alarm System', 'Amphitheatre - Open to Sky', 'Artcaffe', 'Balcony', 'Barbecue Area', 'Basketball Court', 'Borehole', 'Built-in Wardrobes', 'CCTV', 'Cable TV', 'Carport', 'Ceiling Fans', 'Central Heating', "Children's Play Area", "Children's Pool", 'Communal Restrooms', 'Concierge', 'Convenience Store', 'Daycare Centre', 'Deck', 'Dishwasher', 'Doorman', 'Driveway', 'Dryer', 'Eastern Tower', 'Electric Fence', 'Electric Gate', 'Elevator', 'Fence', 'Fireplace', 'Fountain', 'Fully Equipped Gym', 'Furnished', 'Garage', 'Garden', 'Gated Community', 'Gazebo', 'Generator', 'Granite Countertops', 'Guest House', 'Hardwood Floors', 'Heated Infinity Pool', 'Home Office', 'Indoor Games Area', 'Intercom', 'WiFi', 'Jacuzzi', 'Jogging/Walking Track', 'Kitchen Island', "Maid's Quarters", 'Management Office', 'Marble Floors', 'Meeting Nooks', 'Meeting Rooms', 'Microwave', 'Mosque', 'Movie Theatre', 'Outdoor Kitchen', 'Parking', 'Patio', 'Pergola', 'Pet-friendly', 'Pharmacy', 'Pond', 'Pool', 'Pool Deck', 'Putting Green', 'Private Balconies', 'Refrigerator', 'Roof Terrace', 'Sauna', 'Social Hall Kitchen', 'Social Hall Opening to Pool Deck', 'Solar Power', 'Spa', 'Stainless Steel Appliances', 'Steam Room', 'Storage Room', 'Study Room', 'TV', 'Telephone', 'Tennis Court', 'Terrace', 'Tile Floors', 'Viewing Deck', 'Walk-in Closet', 'Washing Machine', 'Water Feature', 'Water Heater', 'Water Tank', 'Workshop', 'Yoga/Aerobics/Dance Hall', 'Coffee Shop/Restaurant', 'Laundry Area', '24/7 Security & CCTV Surveillance'
  ].sort(); // Sort alphabetically for better UX

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-gray-600">Create a new property listing</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/properties')}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Basic Information</h2>

          <div>
            <Label htmlFor="title">Property Title *</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="e.g., Modern 3BR Apartment"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              rows={4}
              placeholder="Describe the property..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="property_type">Property Type *</Label>
              <Select
                value={propertyType}
                onValueChange={(value) => setValue('property_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">Townhouses</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="airbnb">Airbnb</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="traditional_home">Traditional Home</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                value={status}
                onValueChange={(value) => {
                  setValue('status', value);
                  if (value !== 'development') {
                    setValue('development_type', '');
                  }
                }}
                defaultValue="available"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {status === 'development' && (
            <div>
              <Label htmlFor="development_type">Type of Development *</Label>
              <Select
                onValueChange={(value) => setValue('development_type', value, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select development type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_development">New Development</SelectItem>
                  <SelectItem value="off_plan">Off-Plan</SelectItem>
                  <SelectItem value="pre_launch">Pre-Launch</SelectItem>
                  <SelectItem value="under_construction">Under Construction</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="gated_community">Gated Community</SelectItem>
                  <SelectItem value="mixed_use_development">Mixed-Use Development</SelectItem>
                </SelectContent>
              </Select>
              {errors.development_type && (
                <p className="text-red-500 text-sm mt-1">{errors.development_type.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Location</h2>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              {...register('address', { required: 'Address is required' })}
              placeholder="Street address"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register('city', { required: 'City is required' })}
                placeholder="Enter city name"
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
            </div>

            <div>
              <Label htmlFor="state">Suburb/Neighbourhood</Label>
              <Input
                id="state"
                {...register('state')}
                placeholder="Suburb or neighbourhood"
              />
            </div>

            <div>
              <Label htmlFor="zip_code">Zip Code</Label>
              <Input
                id="zip_code"
                {...register('zip_code')}
                placeholder="Zip code"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              {...register('country', { required: 'Country is required' })}
              placeholder="Country"
            />
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
          </div>
        </div>

        {/* Property Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">
            {isAirbnb ? '🏠 Airbnb Property Details' : 'Property Details'}
          </h2>
          
          {isAirbnb && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Airbnb Listing Mode</h3>
              <p className="text-sm text-blue-700">
                You're creating an Airbnb property. This includes specific fields for guest accommodation, 
                amenities, and nightly pricing to help guests find the perfect short-term rental.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="bedrooms">Bedrooms *</Label>
              <Input
                id="bedrooms"
                type="text"
                {...register('bedrooms', { 
                  required: 'Bedrooms is required',
                  validate: validateCommaSeparatedNumbers
                })}
                placeholder="e.g., 3 or 6,5,6"
              />
              <p className="text-xs text-gray-500 mt-1">Single number or comma-separated (e.g. 3 or 6,5,6)</p>
              {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>}
            </div>

            <div>
              <Label htmlFor="bathrooms">Bathrooms *</Label>
              <Input
                id="bathrooms"
                type="text"
                {...register('bathrooms', { 
                  required: 'Bathrooms is required',
                  validate: validateCommaSeparatedNumbers
                })}
                placeholder="e.g., 2 or 2,4,7"
              />
              <p className="text-xs text-gray-500 mt-1">Single number or comma-separated (e.g. 2 or 2,4,7)</p>
              {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</p>}
            </div>

            <div>
              <Label htmlFor="square_feet">Square Feet</Label>
              <Input
                id="square_feet"
                type="number"
                {...register('square_feet', { min: 0, valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="max_guests">Max Guests</Label>
              <Input
                id="max_guests"
                type="number"
                {...register('max_guests', { min: 1, valueAsNumber: true })}
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">
            {isAirbnb ? '💰 Airbnb Pricing & Availability' : 'Pricing'}
          </h2>
          
          {isAirbnb && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Airbnb Pricing Guide</h3>
              <p className="text-sm text-green-700">
                Set your nightly rate, cleaning fees, and availability. Consider local market rates, 
                seasonal demand, and your property's unique features when pricing your listing.
              </p>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_for_sale"
                checked={isForSale}
                onCheckedChange={(checked) => setValue('is_for_sale', checked as boolean)}
              />
              <Label htmlFor="is_for_sale">For Sale</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="buy"
                checked={isForSale}
                onCheckedChange={(checked) => setValue('is_for_sale', checked as boolean)}
              />
              <Label htmlFor="buy">Buy</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_for_rent"
                checked={isForRent}
                onCheckedChange={(checked) => setValue('is_for_rent', checked as boolean)}
              />
              <Label htmlFor="is_for_rent">For Rent</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                {...register('featured')}
              />
              <Label htmlFor="featured">Featured</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="airbnb"
                checked={isAirbnb}
                onCheckedChange={(checked) => {
                  setIsAirbnb(checked as boolean);
                  if (checked) {
                    setValue('property_type', 'airbnb');
                    setValue('is_for_rent', true);
                  }
                }}
              />
              <Label htmlFor="airbnb">Airbnb</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="currency">Currency *</Label>
              <Select
                onValueChange={(value) => setValue('currency', value)}
                defaultValue="KSH"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KSH">KSH (Kenyan Shilling)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { required: true, min: 0, valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            {isForRent && (
              <div>
                <Label htmlFor="rental_price_per_night">
                  {isAirbnb ? 'Rental Price per Night' : 'Rental Price per Month'}
                </Label>
                <Input
                  id="rental_price_per_night"
                  type="number"
                  step="0.01"
                  {...register('rental_price_per_night', { min: 0, valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>
          
          {/* Rental Duration for Airbnb */}
          {isAirbnb && isForRent && (
            <div>
              <Label htmlFor="rental_duration">Rental Duration Options</Label>
              <Select
                onValueChange={(value) => setValue('rental_duration', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rental duration options" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short_term">Short-term (1-30 days)</SelectItem>
                  <SelectItem value="long_term">Long-term (30+ days)</SelectItem>
                  <SelectItem value="both">Both Short & Long-term</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Choose the rental duration options for your Airbnb property</p>
            </div>
          )}
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Images</h2>

          <div>
            <Label htmlFor="main_image">Main Image</Label>
            <div className="mt-2">
              <Input
                id="main_image"
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
                className="cursor-pointer"
              />
              {mainImage && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Main Image Preview:</p>
                  <div className="relative inline-block group">
                    <div className="w-64 h-64 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                      {mainImagePreview && (
                        <img
                          src={mainImagePreview}
                          alt="Main image preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={removeMainImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-gray-600 mt-2 truncate" title={mainImage.name}>
                      {mainImage.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="images">Additional Images</Label>
            <p className="text-sm text-gray-500 mb-2">You can select multiple images at once</p>
            <div className="mt-2">
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                className="cursor-pointer"
              />
              {images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {images.length} image{images.length !== 1 ? 's' : ''} selected:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                          {imagePreviews[index] && (
                            <img
                              src={imagePreviews[index]}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate" title={image.name}>
                          {image.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-xl font-semibold">
              {isAirbnb ? '🛋️ Airbnb Amenities & Features' : 'Amenities'}
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                // If all are selected, deselect all. Otherwise, select all.
                if (selectedAmenities.length === availableAmenities.length) {
                  setValue('amenities', []);
                } else {
                  setValue('amenities', [...availableAmenities]);
                }
              }}
            >
              {selectedAmenities.length === availableAmenities.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableAmenities.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity}`}
                  checked={selectedAmenities.includes(amenity)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setValue('amenities', [...selectedAmenities, amenity]);
                    } else {
                      setValue('amenities', selectedAmenities.filter((a) => a !== amenity));
                    }
                  }}
                />
                <Label htmlFor={`amenity-${amenity}`} className="font-normal cursor-pointer">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/properties')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4 mr-2" />
                Create Property
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

