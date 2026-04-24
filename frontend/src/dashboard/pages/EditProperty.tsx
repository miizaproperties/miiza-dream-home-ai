import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { API_BASE_URL, DASHBOARD_API_BASE_URL } from '../../config/api';
import { useFeaturedProperties } from '@/hooks/useFeaturedProperties';
import { dashboardApi } from '../services/dashboardApi';

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

export const EditProperty: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { invalidateFeaturedProperties } = useFeaturedProperties();
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingMainImage, setExistingMainImage] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PropertyFormData>();

  const propertyType = watch('property_type');
  const status = watch('status');
  const isForSale = watch('is_for_sale');
  const isForRent = watch('is_for_rent');
  const isFeatured = watch('featured');
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
    } else {
      setIsAirbnb(false);
    }
  }, [propertyType, setValue]);

  useEffect(() => {
    // Fetch property data
    const fetchProperty = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/properties/${id}/`, {
          credentials: 'include',
        });
        const property = await response.json();

        // Populate form
        setValue('title', property.title || '');
        setValue('description', property.description || '');
        setValue('property_type', property.property_type || 'apartment');
        setValue('status', property.status || 'available');
        setValue('development_type', property.development_type || '');
        setValue('address', property.address || '');
        setValue('city', property.city || '');
        setValue('state', property.state || '');
        setValue('zip_code', property.zip_code || '');
        setValue('country', property.country || 'Kenya');
        setValue('bedrooms', property.bedrooms != null ? String(property.bedrooms) : '');
        setValue('bathrooms', property.bathrooms != null ? String(property.bathrooms) : '');
        setValue('square_feet', property.square_feet || 0);
        setValue('max_guests', property.max_guests || 2);
        
        // Set existing images
        setExistingMainImage(property.main_image || null);
        setExistingImages(property.images || []);
        console.log('Loaded existing images:', property.images || []);
        setValue('price', property.price || 0);
        setValue('rental_price_per_night', property.rental_price_per_night || 0);
        setValue('currency', property.currency || 'KSH');
        setValue('is_for_sale', property.is_for_sale || false);
        setValue('is_for_rent', property.is_for_rent || false);
        setValue('featured', property.featured || false);
        setValue('rental_duration', property.rental_duration || '');
        setValue('amenities', property.amenities || []);

        // Set Airbnb state if property type is airbnb
        if (property.property_type === 'airbnb') {
          setIsAirbnb(true);
        }
      } catch (error) {
        toast.error('Failed to load property');
        navigate('/admin/properties');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id, setValue, navigate]);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImage(e.target.files[0]);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PropertyFormData) => {
    // Validate development_type when status is development
    if (data.status === 'development' && !data.development_type) {
      toast.error('Please select a development type when status is Development');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add all property fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'amenities') {
          if (Array.isArray(value) && value.length > 0) {
            value.forEach((amenity) => {
              formData.append('amenities', amenity);
            });
          }
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value.toString());
        }
      });

      // Add images only if new ones are selected
      if (mainImage) {
        formData.append('main_image', mainImage);
      }

      images.forEach((image) => {
        formData.append('images', image);
      });

      // Add images to delete
      if (imagesToDelete.length > 0) {
        console.log('Sending images to delete:', imagesToDelete);
        formData.append('images_to_delete', JSON.stringify(imagesToDelete));
      }

      const result = await dashboardApi.updateProperty(Number(id), formData);

      if (result.success) {
        // Clear the images to delete array since they're now deleted
        setImagesToDelete([]);
        
        // Clear any new images since they're now saved
        setImages([]);
        setMainImage(null);
        
        // If the response contains the updated property, update the existing images
        if (result.property && result.property.images) {
          setExistingImages(result.property.images);
        }
        if (result.property && result.property.main_image) {
          setExistingMainImage(result.property.main_image);
        }

        // Invalidate queries to refresh the properties list
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'properties'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'analytics'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'activity'] });
        
        // Invalidate featured properties cache to refresh the featured section
        invalidateFeaturedProperties();

        toast.success('Property updated successfully!');
        
        // Re-fetch the property data to ensure we have the latest state
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/properties/${id}/`, {
            credentials: 'include',
          });
          if (refreshResponse.ok) {
            const refreshedProperty = await refreshResponse.json();
            setExistingImages(refreshedProperty.images || []);
            setExistingMainImage(refreshedProperty.main_image || null);
          }
        } catch (refreshError) {
          console.error('Failed to refresh property data:', refreshError);
        }
        
        // Optional: Stay on the page to see the changes, or navigate away
        // navigate('/admin/properties');
      } else {
        console.error('Update failed:', result);
        toast.error(result.error || 'Failed to update property');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableAmenities = [
    '24/7 Security', 'Air Conditioning', 'Alarm System', 'Amphitheatre - Open to Sky', 'Artcaffe', 'Balcony', 'Barbecue Area', 'Basketball Court', 'Borehole', 'Built-in Wardrobes', 'CCTV', 'Cable TV', 'Carport', 'Ceiling Fans', 'Central Heating', "Children's Play Area", "Children's Pool", 'Communal Restrooms', 'Concierge', 'Convenience Store', 'Daycare Centre', 'Deck', 'Dishwasher', 'Doorman', 'Driveway', 'Dryer', 'Eastern Tower', 'Electric Gate', 'Elevator', 'Fence', 'Fireplace', 'Fountain', 'Fully Equipped Gym', 'Furnished', 'Garage', 'Garden', 'Gated Community', 'Gazebo', 'Generator', 'Granite Countertops', 'Guest House', 'Hardwood Floors', 'Home Office', 'Indoor Games Area', 'Intercom', 'WiFi', 'Jacuzzi', 'Jogging/Walking Track', 'Kitchen Island', "Maid's Quarters", 'Management Office', 'Marble Floors', 'Meeting Nooks', 'Meeting Rooms', 'Microwave', 'Movie Theatre', 'Outdoor Kitchen', 'Parking', 'Patio', 'Pergola', 'Pet-friendly', 'Pond', 'Pool', 'Pool Deck', 'Putting Green', 'Refrigerator', 'Roof Terrace', 'Sauna', 'Social Hall Kitchen', 'Social Hall Opening to Pool Deck', 'Solar Power', 'Spa', 'Stainless Steel Appliances', 'Steam Room', 'Storage Room', 'Study Room', 'TV', 'Telephone', 'Tennis Court', 'Terrace', 'Tile Floors', 'Viewing Deck', 'Walk-in Closet', 'Washing Machine', 'Water Feature', 'Water Heater', 'Water Tank', 'Workshop', 'Yoga/Aerobics/Dance Hall'
  ].sort(); // Sort alphabetically for better UX

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
          <p className="text-gray-600">Update property information</p>
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
                value={watch('development_type') || ''}
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
          <h2 className="text-xl font-semibold border-b pb-2">Property Details</h2>

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
                min="1"
                placeholder="Enter maximum guests"
                {...register('max_guests', { 
                  required: 'Max guests is required',
                  min: { value: 1, message: 'Must be at least 1 guest' },
                  valueAsNumber: true 
                })}
              />
              {errors.max_guests && (
                <span className="text-red-500 text-sm">{errors.max_guests.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Pricing</h2>

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
                checked={isFeatured}
                onCheckedChange={(checked) => setValue('featured', checked as boolean)}
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
                value={watch('rental_duration') || ''}
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
          <h2 className="text-xl font-semibold border-b pb-2">Images Management</h2>

          {/* Current Main Image */}
          {existingMainImage && (
            <div>
              <Label>Current Main Image</Label>
              <div className="mt-2 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-4">
                  <img 
                    src={existingMainImage} 
                    alt="Current main" 
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">Current main image</p>
                    <button
                      type="button"
                      onClick={() => setExistingMainImage(null)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove Current Main Image
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="main_image">Update Main Image (optional)</Label>
            <div className="mt-2">
              <Input
                id="main_image"
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
              />
              {mainImage && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-green-50 rounded">
                  <ImageIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700 flex-1">New: {mainImage.name}</span>
                  <button
                    type="button"
                    onClick={() => setMainImage(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Existing Additional Images */}
          {existingImages.length > 0 && (
            <div>
              <Label>Current Additional Images ({existingImages.length})</Label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                {existingImages.map((image, index) => {
                  const isMarkedForDeletion = image.id && imagesToDelete.includes(image.id);
                  return (
                    <div key={image.id || index} className={`relative group border rounded-lg p-2 ${
                      isMarkedForDeletion ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}>
                      <img 
                        src={image.image || image.url} 
                        alt={image.alt_text || `Image ${index + 1}`}
                        className={`w-full h-24 object-cover rounded transition-all ${
                          isMarkedForDeletion ? 'opacity-50 grayscale' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsImageLoading(true);
                          console.log('Image clicked for deletion:', image, 'has id:', image.id);
                          setTimeout(() => {
                            if (image.id) {
                              if (imagesToDelete.includes(image.id)) {
                                // Remove from delete list (undo delete)
                                setImagesToDelete(imagesToDelete.filter(id => id !== image.id));
                                console.log('Removed from delete list. Current list:', imagesToDelete.filter(id => id !== image.id));
                                toast.info('Image restored to keep');
                              } else {
                                // Add to delete list
                                const newList = [...imagesToDelete, image.id];
                                setImagesToDelete(newList);
                                console.log('Added to delete list. Current list:', newList);
                                toast.info('Image marked for deletion');
                              }
                            } else {
                              // If no ID, remove from UI immediately
                              console.log('Image has no ID, removing from UI immediately');
                              setExistingImages(existingImages.filter((_, i) => i !== index));
                              toast.success('Image removed from list');
                            }
                            setIsImageLoading(false);
                          }, 100);
                        }}
                        disabled={isImageLoading}
                        className={`absolute top-1 right-1 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 ${
                          isMarkedForDeletion 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                        title={isMarkedForDeletion ? 'Click to keep this image' : 'Click to delete this image'}
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {isMarkedForDeletion && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded">
                          <span className="text-xs font-semibold text-red-700 bg-white px-2 py-1 rounded">
                            Will be deleted
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {image.alt_text || `Image ${index + 1}`}
                      </p>
                    </div>
                  );
                })}
              </div>
              {imagesToDelete.length > 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-700 font-medium">
                    ⚠️ {imagesToDelete.length} image(s) will be permanently deleted when you save
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Click the green X on marked images to undo deletion
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="images">Add New Additional Images (optional)</Label>
            <div className="mt-2">
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
              />
              {images.length > 0 && (
                <div className="mt-2 space-y-2">
                  {images.map((image, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700 flex-1">New: {image.name}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-xl font-semibold">Amenities</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                // If all are selected, deselect all. Otherwise, select all.
                if (selectedAmenities.length === availableAmenities.length) {
                  setValue('amenities', [] as any); // Cast to any to avoid type complaints if type definition is strict
                } else {
                  setValue('amenities', [...availableAmenities] as any);
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
                Updating...
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4 mr-2" />
                Update Property
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

