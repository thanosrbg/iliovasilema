import React, { useState, useEffect, useRef } from 'react';

// Import images directly from the apartment folder
import img1 from '../assets/apartment/pexels-chris-palladino-2158975358-38661229.jpg';
import img2 from '../assets/apartment/pexels-hector-marabelle-2157578915-34978726.jpg';
import img3 from '../assets/apartment/pexels-igor-starkov-233202-1693946.jpg';
import img4 from '../assets/apartment/pexels-redrum-visuals-12684159.jpg';

// Import Syros background image directly
import syrosBg from '../assets/Syros.jpg';

// Inline SVG icons
const CalendarDays = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const Users = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const Search = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const Plus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const Minus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const MapPin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const ImageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

const X = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Animation styles
const slideInStyles = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in {
    animation: slideIn 0.3s ease-out forwards;
  }
`;

const Home = () => {
  // State for booking form
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('booking');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadedImages, setLoadedImages] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  
  // Booking form state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Apartment images array with metadata
  const apartmentImages = [
    {
      id: 1,
      url: img1,
      title: 'Living Room',
      description: 'Spacious living area with sea view'
    },
    {
      id: 2,
      url: img2,
      title: 'Bedroom',
      description: 'Comfortable bedroom with natural light'
    },
    {
      id: 3,
      url: img3,
      title: 'Kitchen',
      description: 'Modern fully equipped kitchen'
    },
    {
      id: 4,
      url: img4,
      title: 'Bathroom',
      description: 'Contemporary bathroom design'
    }
  ];

  // Preload images on component mount
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = apartmentImages.map((img) => {
        return new Promise((resolve, reject) => {
          const image = new Image();
          image.src = img.url;
          image.onload = () => {
            setLoadedImages(prev => ({ ...prev, [img.id]: true }));
            resolve();
          };
          image.onerror = () => {
            setImageErrors(prev => ({ ...prev, [img.id]: true }));
            reject();
          };
        });
      });

      // Also preload background image
      if (syrosBg) {
        const bgImage = new Image();
        bgImage.src = syrosBg;
        bgImage.onload = () => {
          setBgLoaded(true);
          console.log('Background image loaded successfully');
        };
        bgImage.onerror = () => {
          console.warn('Background image failed to load');
        };
      }

      try {
        await Promise.all(imagePromises);
        setImagesPreloaded(true);
        console.log('All images preloaded successfully');
      } catch (error) {
        console.log('Some images failed to preload');
      }
    };

    preloadImages();
  }, []);

  // Check if booking details are filled
  const isBookingReady = checkIn && checkOut && (adults > 0 || children > 0);

  // Format date to Greek format (dd/mm/yyyy)
  const formatDateGreek = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Format date for display (dd-mm-yyyy)
  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  // Handler for increment/decrement guests
  const updateGuest = (type, operation) => {
    const setters = {
      adults: { set: setAdults, min: 1, max: 16 },
      children: { set: setChildren, min: 0, max: 10 },
      infants: { set: setInfants, min: 0, max: 5 },
    };
    const { set, min, max } = setters[type];
    set((prev) => {
      const newVal = operation === 'inc' ? prev + 1 : prev - 1;
      return Math.min(Math.max(newVal, min), max);
    });
  };

  // Total guests for display
  const totalGuests = adults + children;

  // Handle booking submit
  const handleBooking = (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions.');
      return;
    }
    const bookingData = {
      checkIn: formatDateDisplay(checkIn),
      checkOut: formatDateDisplay(checkOut),
      adults,
      children,
      infants,
      fullName,
      email,
      phone,
    };
    console.log('Booking submitted:', bookingData);
    alert('Booking submitted successfully! We will contact you shortly.');
    setShowBookingForm(false);
    setEmail('');
    setPhone('');
    setFullName('');
    setAgreedToTerms(false);
  };

  // Quick date presets
  const datePresets = [
    { label: 'This weekend', days: 2 },
    { label: 'Next week', days: 7 },
    { label: 'Long stay', days: 14 },
  ];

  const applyPreset = (days) => {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + days);
    setCheckIn(start.toISOString().split('T')[0]);
    setCheckOut(end.toISOString().split('T')[0]);
  };

  // Calculate number of nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nights = calculateNights();

  // Places data - Syrros
  const places = [
    {
      id: 1,
      name: 'Galissas Beach',
      category: 'Beaches',
      distance: '3.2 km',
      description: 'Beautiful sandy beach with crystal clear waters, ideal for families and water sports.',
      rating: 4.8,
      image: '🏖️'
    },
    {
      id: 2,
      name: 'Ermoupoli',
      category: 'Historical',
      distance: '4.5 km',
      description: 'The capital of Syrros with neoclassical architecture, charming alleys, and vibrant culture.',
      rating: 4.9,
      image: '🏛️'
    },
    {
      id: 3,
      name: 'Agios Nikolaos Church',
      category: 'Historical',
      distance: '4.8 km',
      description: 'Iconic Greek Orthodox church with stunning views over Ermoupoli and the Aegean Sea.',
      rating: 4.7,
      image: '⛪'
    },
    {
      id: 4,
      name: 'Miaoulis Square',
      category: 'Landmarks',
      distance: '4.2 km',
      description: 'Central square of Ermoupoli with the statue of Admiral Miaoulis and beautiful cafes.',
      rating: 4.6,
      image: '⛲'
    },
    {
      id: 5,
      name: 'Finikas Beach',
      category: 'Beaches',
      distance: '5.8 km',
      description: 'Secluded beach with golden sand, perfect for relaxation and swimming in calm waters.',
      rating: 4.5,
      image: '🌊'
    },
    {
      id: 6,
      name: 'Apollon Theater',
      category: 'Culture',
      distance: '4.6 km',
      description: 'Miniature version of La Scala in Milan, hosting cultural events and performances.',
      rating: 4.8,
      image: '🎭'
    },
    {
      id: 7,
      name: 'Kini Beach',
      category: 'Beaches',
      distance: '7.3 km',
      description: 'Charming fishing village with sandy beach, tavernas, and stunning sunset views.',
      rating: 4.4,
      image: '🌅'
    },
    {
      id: 8,
      name: 'Syros Island Museum',
      category: 'Culture',
      distance: '4.3 km',
      description: 'Museum showcasing the rich history, art, and maritime heritage of Syrros island.',
      rating: 4.6,
      image: '🏺'
    }
  ];

  // Filter places by category
  const filteredPlaces = selectedCategory === 'All' 
    ? places 
    : places.filter(place => place.category === selectedCategory);

  // Get unique categories for filters
  const categories = ['All', ...new Set(places.map(place => place.category))];

  return (
    <>
      {/* Inject animation styles */}
      <style dangerouslySetInnerHTML={{ __html: slideInStyles }} />
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans antialiased relative">
        {/* Background image with better visibility */}
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${syrosBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.9,
          }}
        />
        
        {/* Subtle gradient overlay for readability */}
        <div className="fixed inset-0 z-0 bg-gradient-to-b from-white/15 to-gray-50/60" />

        {/* Main container */}
        <div className="relative z-10 w-full max-w-4xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/80 overflow-hidden transition-all duration-200">
          {/* Header */}
          <div className="px-8 pt-8 pb-4 border-b border-gray-50 bg-gradient-to-r from-blue-50/50 to-white/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="bg-blue-100/80 p-2 rounded-xl">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </span>
                  <div>
                    <h1 className="text-3xl font-light tracking-tight text-gray-900">
                      <span className="font-serif italic text-blue-900">Iliovasilema</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                      Syrros Island, Greece
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-xs text-gray-400">★★★★★</div>
                <div className="text-xs text-gray-400 mt-0.5">4.9 · 127 reviews</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2 ml-12 italic">✨ Where the sun meets the sea</p>
          </div>

          {/* Tabs */}
          <div className="px-8 pt-6 border-b border-gray-50">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveTab('booking')}
                className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  activeTab === 'booking'
                    ? 'bg-blue-900 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                📅 Book Your Stay
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'gallery'
                    ? 'bg-blue-900 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ImageIcon />
                Gallery ({apartmentImages.length})
              </button>
              <button
                onClick={() => setActiveTab('places')}
                className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'places'
                    ? 'bg-blue-900 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <MapPin />
                Explore Syrros
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'booking' ? (
              <div className="max-w-2xl mx-auto">
                {/* Booking Form */}
                <form className="space-y-8">
                  {/* Date range */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span className="text-gray-400"><CalendarDays /></span>
                      <span>Select your dates</span>
                    </div>
                    
                    {/* Preset chips */}
                    <div className="flex flex-wrap gap-2">
                      {datePresets.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => applyPreset(preset.days)}
                          className="text-xs px-4 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all duration-150"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Date inputs with Greek format display */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="checkIn" className="block text-xs font-medium text-gray-500 mb-1.5">Check-in</label>
                        <input
                          type="date"
                          id="checkIn"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900/30 transition-all"
                          required
                        />
                        {checkIn && (
                          <p className="text-xs text-gray-500 mt-1">
                            📅 {formatDateGreek(checkIn)}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="checkOut" className="block text-xs font-medium text-gray-500 mb-1.5">Check-out</label>
                        <input
                          type="date"
                          id="checkOut"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          min={checkIn || new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900/30 transition-all"
                          required
                        />
                        {checkOut && (
                          <p className="text-xs text-gray-500 mt-1">
                            📅 {formatDateGreek(checkOut)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="space-y-4 relative">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span className="text-gray-400"><Users /></span>
                      <span>Number of guests</span>
                    </div>
                    
                    <div 
                      onClick={() => setShowGuestPicker(!showGuestPicker)}
                      className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-all"
                    >
                      <span className="text-sm text-gray-700">
                        {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'} 
                        {infants > 0 && `, ${infants} infant${infants > 1 ? 's' : ''}`}
                      </span>
                      <span className="text-gray-400 text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200">
                        {showGuestPicker ? '−' : '+'}
                      </span>
                    </div>

                    {showGuestPicker && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-6 z-10">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-800">Adults</div>
                              <div className="text-xs text-gray-400">Age 13+</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button type="button" onClick={() => updateGuest('adults', 'dec')} disabled={adults <= 1} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                <Minus />
                              </button>
                              <span className="w-6 text-center text-sm font-medium">{adults}</span>
                              <button type="button" onClick={() => updateGuest('adults', 'inc')} disabled={adults >= 16} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                <Plus />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-800">Children</div>
                              <div className="text-xs text-gray-400">Ages 2–12</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button type="button" onClick={() => updateGuest('children', 'dec')} disabled={children <= 0} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                <Minus />
                              </button>
                              <span className="w-6 text-center text-sm font-medium">{children}</span>
                              <button type="button" onClick={() => updateGuest('children', 'inc')} disabled={children >= 10} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                <Plus />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-800">Infants</div>
                              <div className="text-xs text-gray-400">Under 2</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button type="button" onClick={() => updateGuest('infants', 'dec')} disabled={infants <= 0} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                <Minus />
                              </button>
                              <span className="w-6 text-center text-sm font-medium">{infants}</span>
                              <button type="button" onClick={() => updateGuest('infants', 'inc')} disabled={infants >= 5} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                <Plus />
                              </button>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-gray-100 flex justify-end">
                            <button type="button" onClick={() => setShowGuestPicker(false)} className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Note about infants */}
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3">
                    <p className="text-xs text-blue-800">
                      👶 Infants (under 2) stay free of charge. Please add them to your booking.
                    </p>
                  </div>

                  {/* Check availability button */}
                  {isBookingReady && (
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(true)}
                      className="w-full bg-blue-900 text-white py-4 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <span className="opacity-70"><Search /></span>
                      Continue to Booking
                    </button>
                  )}

                  {!isBookingReady && (
                    <div className="w-full bg-gray-100 text-gray-400 py-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                      <span className="opacity-70"><Search /></span>
                      Please select dates and guests
                    </div>
                  )}

                  <p className="text-xs text-center text-gray-400">
                    You won't be charged yet • Free cancellation within 48h
                  </p>
                </form>
              </div>
            ) : activeTab === 'gallery' ? (
              // Gallery Tab
              <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-xl font-light text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">📸</span>
                    Apartment Gallery
                    <span className="text-sm font-normal text-gray-400 ml-2">
                      • {apartmentImages.length} {apartmentImages.length === 1 ? 'photo' : 'photos'}
                    </span>
                  </h2>
                </div>

                {/* Photos grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {apartmentImages.map((photo) => (
                    <div 
                      key={photo.id} 
                      className="group bg-gray-50/60 border border-gray-100 rounded-xl overflow-hidden hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => setSelectedImage(photo)}
                    >
                      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                        {!loadedImages[photo.id] && !imageErrors[photo.id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <div className="animate-pulse flex flex-col items-center">
                              <div className="w-12 h-12 bg-gray-200 rounded-full mb-2"></div>
                              <div className="h-2 w-20 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        )}
                        <img 
                          src={photo.url} 
                          alt={photo.title}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                            loadedImages[photo.id] ? 'opacity-100' : 'opacity-0'
                          }`}
                          loading={loadedImages[photo.id] ? 'eager' : 'lazy'}
                        />
                        {imageErrors[photo.id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <div className="text-center">
                              <div className="text-4xl mb-2">🖼️</div>
                              <p className="text-xs text-gray-400">Image not available</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-gray-600 text-center">{photo.title}</p>
                        <p className="text-xs text-gray-400 text-center mt-0.5">{photo.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Photo detail modal */}
                {selectedImage && (
                  <div 
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedImage(null)}
                  >
                    <div 
                      className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative bg-gray-100">
                        <img 
                          src={selectedImage.url} 
                          alt={selectedImage.title}
                          className="w-full h-auto max-h-[70vh] object-contain"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{selectedImage.title}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">{selectedImage.description}</p>
                          </div>
                          <span className="text-xs text-gray-400">Photo {selectedImage.id} of {apartmentImages.length}</span>
                        </div>
                        <button
                          onClick={() => setSelectedImage(null)}
                          className="mt-4 w-full bg-blue-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Places Tab - Explore Syrros
              <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-xl font-light text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">🏝️</span>
                    Discover Syrros
                    <span className="text-sm font-normal text-gray-400 ml-2">• {places.length} amazing places</span>
                  </h2>
                </div>

                {/* Category filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`text-xs px-4 py-2 rounded-xl transition-all duration-150 ${
                        selectedCategory === category
                          ? 'bg-blue-900 text-white shadow-md'
                          : 'border border-gray-200 bg-gray-50/50 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Places grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPlaces.map((place) => (
                    <div key={place.id} className="bg-gray-50/60 border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:bg-gray-50 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
                          {place.image}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">{place.name}</h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-500">{place.category}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span className="text-xs text-gray-500">{place.distance}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-gray-200 flex-shrink-0">
                              <span className="text-xs font-medium text-gray-700">★</span>
                              <span className="text-xs font-medium text-gray-700">{place.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{place.description}</p>
                          <button className="mt-2 text-xs font-medium text-blue-900 hover:text-blue-700 transition-colors duration-150 flex items-center gap-1">
                            Learn more
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                              <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredPlaces.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No places found in this category</p>
                  </div>
                )}

                <button className="w-full mt-6 py-3.5 border-2 border-blue-200 text-blue-900 rounded-xl text-sm font-medium hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                  Explore all points of interest on Syrros →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Booking Form Sidebar - Fixed position on the right side of the page */}
        {showBookingForm && (
          <div className="fixed inset-y-0 right-0 w-96 bg-white/95 backdrop-blur-sm shadow-2xl border-l border-gray-200 p-6 overflow-y-auto z-50 animate-slide-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-900">Complete Booking</h2>
              <button
                onClick={() => setShowBookingForm(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X />
              </button>
            </div>

            {/* Booking summary with Greek date format */}
            <div className="bg-blue-50/50 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Booking Summary</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Check-in:</span>
                  <span className="font-medium">{formatDateDisplay(checkIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>
                  <span className="font-medium">{formatDateDisplay(checkOut)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nights:</span>
                  <span className="font-medium">{nights}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span className="font-medium">
                    {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}
                    {infants > 0 && ` + ${infants} infant${infants > 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900/30 transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900/30 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900/30 transition-all"
                  placeholder="+30 123 456 7890"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
                    required
                  />
                  <span className="text-xs text-gray-600">
                    I agree to the terms and conditions and confirm that my information will only be used for booking purposes.
                  </span>
                </label>
              </div>

              {/* Disclaimer */}
              <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-3">
                <p className="text-xs text-gray-500 leading-relaxed">
                  🔒 <span className="font-medium">Privacy Notice:</span> Your personal information (email, phone, name) will only be used to process your booking and communicate with you regarding your stay. We do not share your data with third parties for commercial purposes.
                </p>
              </div>

              <button
                type="submit"
                disabled={!agreedToTerms}
                className={`w-full py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${
                  agreedToTerms
                    ? 'bg-blue-900 text-white hover:bg-blue-800 shadow-md hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Confirm Booking
              </button>

              <button
                type="button"
                onClick={() => setShowBookingForm(false)}
                className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;