import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { rideService } from '../services/rideService';
import { ratingService } from '../services/ratingService';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PaymentModal from '../components/PaymentModal';

function MyTrips() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector(state => state.user);
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [completedRides, setCompletedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [createdRides, setCreatedRides] = useState([]);
  const [joinedRides, setJoinedRides] = useState([]);
  const [activeTab, setActiveTab] = useState('current');
  const [currentRides, setCurrentRides] = useState([]);
  const [ratings, setRatings] = useState({});
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [rideToPayFor, setRideToPayFor] = useState(null);

  // Add the fetchRatings function
  const fetchRatings = async () => {
    if (!currentUser || !currentUser._id) return;
    
    try {
      // Get ratings for completed rides - add defensive check
      if (!ratingService || typeof ratingService.getUserRatings !== 'function') {
        console.log('Rating service not available or getUserRatings not a function');
        return;
      }
      
      const response = await ratingService.getUserRatings(currentUser._id);
      if (response && response.ratings) {
        const ratingsMap = {};
        response.ratings.forEach(rating => {
          if (rating.rideId) {
            ratingsMap[rating.rideId] = rating.value;
          }
        });
        setRatings(ratingsMap);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      // Don't show error toast as this is not critical
    }
  };
  
  // Helper function to get auth token
  const getAuthToken = () => {
    // Try to get token from Redux store
    const token = currentUser?.token;
    
    if (token) {
      return token;
    }
    
    // Check cookies as fallback
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const accessToken = cookies.find(cookie => cookie.startsWith('access_token='));
    
    if (accessToken) {
      return accessToken.split('=')[1];
    }
    
    return null;
  };
  
  // Fetch user trips function
  const fetchUserTrips = async () => {
    if (!currentUser || !currentUser._id) {
      setShowLoginModal(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      console.log('Starting to fetch user trips... Current environment:', import.meta.env.MODE);
      console.log('API base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');
      console.log('Current user ID:', currentUser._id);
      
      // Add debugging for authentication
      const token = getAuthToken();
      console.log('Authorization token available:', !!token);
      
      // Get all rides for the user (both created and joined)
      const response = await rideService.getUserRides();
      console.log('Received response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch rides');
      }
      
      const rides = response.rides || [];
      console.log(`Processing ${rides.length} rides for user ${currentUser._id}`);

      // Verify that rides are properly structured and log info about each role type
      if (rides.length > 0) {
        const driverRides = rides.filter(ride => ride.userRole?.isDriver);
        const passengerRides = rides.filter(ride => ride.userRole?.isPassenger);
        const bothRoles = rides.filter(ride => ride.userRole?.isDriver && ride.userRole?.isPassenger);
        
        console.log(`Role breakdown: Driver: ${driverRides.length}, Passenger: ${passengerRides.length}, Both: ${bothRoles.length}`);
        
        if (passengerRides.length === 0) {
          console.warn('No passenger rides found - this might indicate a problem!');
        }
      } else {
        console.log('No rides found for user. This could be normal if user has no rides yet.');
      }
      
      // Current date for comparison
      const currentDate = new Date();
      const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      
      // Format rides - add defensive checks for bad data
      const formattedRides = rides.map(ride => {
        if (!ride || typeof ride !== 'object') {
          console.error('Invalid ride data:', ride);
          return null; // Skip this ride
        }
        
        // Extract basic ride info with fallbacks for missing data
        const rideId = ride._id || `temp-${Math.random()}`;
        const source = ride.source || 'Unknown location';
        const destination = ride.destination || 'Unknown destination';
        const date = ride.date?.split('T')[0] || new Date().toISOString().split('T')[0];
        const time = ride.departureTime || '12:00';
        const price = ride.price || 0;
        const leftSeats = ride.leftSeats || 0;
        const totalSeats = ride.totalSeats || 4;
        const distance = ride.distance || '0 km';
        
        // Get the role information from the ride
        const isDriver = ride.userRole?.isDriver || false;
        const isPassenger = ride.userRole?.isPassenger || false;
        
        // Find the current user's passenger record in this ride
        const userPassenger = ride.passengers?.find(p => {
          if (!p || typeof p !== 'object') return false;
          
          // Try multiple ways to find the current user in passengers
          return (p.user === currentUser._id) || 
                (p.user && p.user._id === currentUser._id) ||
                (p.userId === currentUser._id) ||
                (p.email === currentUser.email);
        });
        
        // Get booked seats from the passenger record or use default
        const bookedSeats = userPassenger?.seats || 1;
        
        // Determine payment status
        const paymentStatus = userPassenger?.paymentStatus || 'pending';
        
        // Comprehensive driver info extraction with better defensive coding
        let driverInfo = {
          id: rideId,
          name: 'Unknown Driver',
          rating: 0,
          profilePicture: ''
        };
        
        // If current user is the driver, use their info
        if (isDriver) {
          driverInfo = {
            id: currentUser._id,
            name: 'You (Driver)',
            rating: currentUser.rating || 0,
            profilePicture: currentUser.profilePicture || ''
          };
        } else {
          // Try to extract driver info from various possible fields
          
          // Check for driverId as object (populated)
          if (ride.driverId && typeof ride.driverId === 'object') {
            driverInfo = {
              id: ride.driverId._id || ride.driverId.id || 'unknown',
              name: ride.driverId.firstName ? 
                   `${ride.driverId.firstName} ${ride.driverId.lastName || ''}` : 
                   (ride.driverId.name || ride.driverId.username || 'Unknown Driver'),
              rating: ride.driverId.rating || 0,
              profilePicture: ride.driverId.profilePicture || ''
            };
          }
          // Check for driver field (populated)
          else if (ride.driver && typeof ride.driver === 'object') {
            driverInfo = {
              id: ride.driver._id || ride.driver.id || 'unknown',
              name: ride.driver.firstName ? 
                   `${ride.driver.firstName} ${ride.driver.lastName || ''}` : 
                   (ride.driver.name || ride.driver.username || 'Unknown Driver'),
              rating: ride.driver.rating || 0,
              profilePicture: ride.driver.profilePicture || ''
            };
          }
          // Check for driverInfo field (populated)
          else if (ride.driverInfo && typeof ride.driverInfo === 'object') {
            driverInfo = {
              id: ride.driverInfo._id || ride.driverInfo.id || 'unknown',
              name: ride.driverInfo.firstName ? 
                   `${ride.driverInfo.firstName} ${ride.driverInfo.lastName || ''}` : 
                   (ride.driverInfo.name || ride.driverInfo.username || 'Unknown Driver'),
              rating: ride.driverInfo.rating || 0,
              profilePicture: ride.driverInfo.profilePicture || ''
            };
          }
          // Check for creator field (populated)
          else if (ride.creator && typeof ride.creator === 'object') {
            driverInfo = {
              id: ride.creator._id || ride.creator.id || 'unknown',
              name: ride.creator.firstName ? 
                   `${ride.creator.firstName} ${ride.creator.lastName || ''}` : 
                   (ride.creator.name || ride.creator.username || 'Unknown Driver'),
              rating: ride.creator.rating || 0,
              profilePicture: ride.creator.profilePicture || ''
            };
          }
        }
        
        // Ensure proper status mapping - use the actual ride status if available
        let status = ride.status || 'scheduled';
        
        // Add time checking for ongoing status if not explicitly set
        if (status !== 'completed' && status !== 'cancelled' && status !== 'ongoing') {
          const rideDateTime = new Date(`${date}T${time}`);
          const currentDateTime = new Date();
          
          // If ride is scheduled for today and the time has passed but within 6 hours, mark as ongoing
          if (status === 'scheduled' && 
              rideDateTime.toDateString() === currentDateTime.toDateString() && 
              rideDateTime <= currentDateTime && 
              (currentDateTime - rideDateTime) <= (6 * 60 * 60 * 1000)) {
            status = 'ongoing';
            console.log(`Ride ${rideId} marked as ongoing based on time: ${rideDateTime}`);
          }
        }
        
        // Format the ride data for display
        return {
          id: rideId,
          from: source,
          to: destination,
          date: date,
          time: time,
          price: price,
          seats: leftSeats,
          totalSeats: totalSeats,
          bookedSeats: bookedSeats,
          distance: distance,
          status: status,
          driver: driverInfo,
          isCreator: isDriver,
          isPassenger: isPassenger,
          paymentStatus: paymentStatus
        };
      }).filter(Boolean); // Remove any null entries from bad data
      
      // Log the number of formatted rides
      console.log(`Formatted ${formattedRides.length} rides successfully`);
      
      // Update states with the processed ride data
      updateTripStates(formattedRides);
      
      // Fetch ratings for completed rides
      fetchRatings();
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user trips:', error);
      setError(error.message || 'Error loading trips. Please try again.');
      
      // Still update the UI to show no trips rather than leaving the loading screen
      updateTripStates([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchUserTrips();
    
    // Check for tab in URL query params
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('tab');
    
    // Set active tab from URL if valid
    if (tabParam && ['current', 'upcoming', 'completed'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    // No auto-refresh interval anymore as requested
  }, [currentUser, navigate, location]);

  const handleViewDetails = (trip) => {
    const rideData = {
      _id: trip.id,
      source: trip.from,
      destination: trip.to,
      date: trip.date,
      departureTime: trip.time,
      price: trip.price,
      leftSeats: trip.seats,
      distance: trip.distance,
      driverName: trip.driver.name,
      driverRating: trip.driver.rating,
      // Add information about the user's relationship to this ride
      isCreator: trip.isCreator,
      isPassenger: trip.isPassenger
    };
    
    navigate('/booking-details', { 
      state: { 
        ride: rideData,
        isViewOnly: true
      } 
    });
  };

  const handleLogin = () => {
    navigate('/sign-in', { state: { returnTo: '/my-trips' } });
  };

  const handleCancelRide = async (rideId) => {
    try {
      if (!window.confirm('Are you sure you want to cancel this ride?')) {
        return;
      }
      
      setLoading(true);
      await rideService.cancelRide(rideId);
      
      // Update local state: mark the ride as cancelled
      setUpcomingRides(prev => 
        prev.map(ride => 
          ride.id === rideId 
            ? { ...ride, status: 'cancelled' } 
            : ride
        )
      );
      
      setLoading(false);
      alert('Ride has been cancelled successfully');
    } catch (err) {
      console.error('Error cancelling ride:', err);
      setError(err.message || 'Failed to cancel ride. Please try again.');
      setLoading(false);
    }
  };

  const handleRatingClick = (ride) => {
    setSelectedRide(ride);
    setRatingValue(0);
    setComment('');
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    if (!ratingValue) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await ratingService.submitRating(selectedRide.id, ratingValue, comment);
      setRatings(prev => ({
        ...prev,
        [selectedRide.id]: { rating: ratingValue, comment }
      }));
      setShowRatingModal(false);
      toast.success('Rating submitted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to submit rating');
    }
  };

  const handlePaymentClick = (trip) => {
    setRideToPayFor(trip);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setRideToPayFor(null);
    toast.success('Payment successful! Your ride is now confirmed.');
    
    // Refresh trip data
    if (currentUser && currentUser._id) {
      rideService.getUserRides().then(response => {
        if (response.success) {
          // Re-process the rides data with the updated payment information
          const rides = response.rides || [];
          
          // Process rides similar to fetchUserTrips
          // This ensures the UI updates with the new payment status
          const currentDate = new Date();
          const formattedRides = rides.map(ride => {
            const userPassenger = ride.passengers?.find(p => 
              p.user === currentUser._id || 
              (p.user && p.user._id === currentUser._id)
            );
            
            // Comprehensive driver info extraction
            let driverInfo = {
              id: ride._id || 'unknown',
              name: 'Unknown Driver',
              rating: 0,
              profilePicture: ''
            };
            
            // First check if the current user is the creator/driver
            const isCreator = (ride.creatorId === currentUser._id) || 
                            (ride.creator && ride.creator._id === currentUser._id) ||
                            (ride.driverId === currentUser._id) || 
                            (ride.driverId && ride.driverId._id === currentUser._id);
            
            if (isCreator) {
              // Current user is the driver
              driverInfo = {
                id: currentUser._id,
                name: 'You (Driver)',
                rating: currentUser.rating || 0,
                profilePicture: currentUser.profilePicture || ''
              };
            } else {
              // Try to extract driver info from various possible fields
              
              // Check for driverId as object (populated)
              if (ride.driverId && typeof ride.driverId === 'object') {
                driverInfo = {
                  id: ride.driverId._id || ride.driverId.id || 'unknown',
                  name: ride.driverId.firstName ? 
                       `${ride.driverId.firstName} ${ride.driverId.lastName || ''}` : 
                       (ride.driverId.name || ride.driverId.username || 'Unknown Driver'),
                  rating: ride.driverId.rating || 0,
                  profilePicture: ride.driverId.profilePicture || ''
                };
              }
              // Check for driver field (populated)
              else if (ride.driver && typeof ride.driver === 'object') {
                driverInfo = {
                  id: ride.driver._id || ride.driver.id || 'unknown',
                  name: ride.driver.firstName ? 
                       `${ride.driver.firstName} ${ride.driver.lastName || ''}` : 
                       (ride.driver.name || ride.driver.username || 'Unknown Driver'),
                  rating: ride.driver.rating || 0,
                  profilePicture: ride.driver.profilePicture || ''
                };
              }
              // Check for driverInfo field (populated)
              else if (ride.driverInfo && typeof ride.driverInfo === 'object') {
                driverInfo = {
                  id: ride.driverInfo._id || ride.driverInfo.id || 'unknown',
                  name: ride.driverInfo.firstName ? 
                       `${ride.driverInfo.firstName} ${ride.driverInfo.lastName || ''}` : 
                       (ride.driverInfo.name || ride.driverInfo.username || 'Unknown Driver'),
                  rating: ride.driverInfo.rating || 0,
                  profilePicture: ride.driverInfo.profilePicture || ''
                };
              }
              // Check for creator field (populated)
              else if (ride.creator && typeof ride.creator === 'object') {
                driverInfo = {
                  id: ride.creator._id || ride.creator.id || 'unknown',
                  name: ride.creator.firstName ? 
                       `${ride.creator.firstName} ${ride.creator.lastName || ''}` : 
                       (ride.creator.name || ride.creator.username || 'Unknown Driver'),
                  rating: ride.creator.rating || 0,
                  profilePicture: ride.creator.profilePicture || ''
                };
              }
            }
            
            return {
              id: ride._id,
              from: ride.source,
              to: ride.destination,
              date: ride.date.split('T')[0],
              time: ride.departureTime,
              price: ride.price,
              seats: ride.leftSeats,
              totalSeats: ride.totalSeats || 4,
              bookedSeats: userPassenger?.seats || 1,
              distance: ride.distance,
              status: ride.status || 'scheduled',
              driver: driverInfo,
              isCreator,
              isPassenger: ride.passengers?.some(p => 
                p.user === currentUser._id || 
                (p.user && p.user._id === currentUser._id)
              ) || false,
              paymentStatus: ride._id === rideToPayFor.id ? 'completed' : userPassenger?.paymentStatus || 'pending' // Update only the specific ride's payment status
            };
          });
          
          // Update state with the fresh data
          updateTripStates(formattedRides);
        }
      });
    }
  };
  
  // Helper function to update trip states
  const updateTripStates = (formattedRides) => {
    const currentDate = new Date();
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    // Separate into current, upcoming, and completed
    const upcoming = [];
    const completed = [];
    const current = [];
    
    // Categorize rides - simplified logic based on status
    formattedRides.forEach(trip => {
      console.log(`Categorizing ride ${trip.id} with status ${trip.status}`, trip);
      
      // Base the categorization primarily on the ride status
      if (trip.status === 'completed' || trip.status === 'cancelled') {
        // Completed or cancelled rides go to the completed section
        completed.push(trip);
      } else if (trip.status === 'ongoing') {
        // Ongoing rides always go to current section
        current.push(trip);
      } else if (trip.status === 'scheduled') {
        // Scheduled rides always go to upcoming section, regardless of date/time
        upcoming.push(trip);
      } else if (trip.status === 'pending') {
        // Pending rides go to upcoming section
        upcoming.push(trip);
      } else {
        // Default case - use date to categorize if status isn't explicit
        const rideDateTime = new Date(`${trip.date}T${trip.time}`);
        
        if (rideDateTime > currentDate) {
          // Future rides go to upcoming
          upcoming.push(trip);
        } else if (rideDateTime.toDateString() === currentDate.toDateString()) {
          // Today's rides go to current
          current.push(trip);
        } else {
          // Past rides go to completed
          completed.push({...trip, status: 'completed'});
        }
      }
    });
    
    // Sort the arrays
    current.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    upcoming.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    completed.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));
    
    console.log('Categories after sorting:', { 
      current: current.length, 
      upcoming: upcoming.length, 
      completed: completed.length 
    });
    
    // Update state
    setCurrentRides(current);
    setUpcomingRides(upcoming);
    setCompletedRides(completed);
    
    // For a passenger:
    // Joined rides are rides where the user is a passenger
    setJoinedRides(formattedRides.filter(r => r.isPassenger && r.status !== 'cancelled'));
    
    // No need to track created rides for passengers, but we'll keep the variable
    // for compatibility with the UI
    setCreatedRides([]);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your trips...</p>
      </div>
    );
  }

  if (showLoginModal) {
    return (
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Sign In Required</h2>
              <p className="mt-2 text-gray-600">
                You need to sign in to view your trips and booking history
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-800">Why sign in?</h3>
                  <div className="mt-1 text-sm text-gray-600">
                    <p>Signing in allows you to:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>View your upcoming and past trips</li>
                      <li>Manage your bookings</li>
                      <li>Access your ride history</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Home
              </button>
              <button
                onClick={handleLogin}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalCreated = createdRides.length;
  const totalJoined = joinedRides.length;

  // Get status badge elements
  const getStatusBadge = (status) => {
    const statusConfig = {
      'scheduled': { bgColor: 'bg-green-100', textColor: 'text-green-800', icon: (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )},
      'pending': { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', icon: (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )},
      'completed': { bgColor: 'bg-blue-100', textColor: 'text-blue-800', icon: (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      )},
      'cancelled': { bgColor: 'bg-red-100', textColor: 'text-red-800', icon: (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    };
    
    const config = statusConfig[status] || statusConfig.scheduled;
    
    return (
      <span className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Function to get border color based on status
  const getBorderColor = (status) => {
    switch(status) {
      case 'scheduled': return 'border-green-400';
      case 'pending': return 'border-yellow-400';
      case 'completed': return 'border-blue-400';
      case 'cancelled': return 'border-red-400';
      default: return 'border-gray-300';
    }
  };

  const renderRatingStars = (ride) => {
    const userRating = ratings[ride.id];
    if (userRating) {
      return (
        <div className="flex items-center space-x-2">
          <div className="flex">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={`text-yellow-400 ${index < userRating.rating ? 'text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          {userRating.comment && (
            <p className="text-sm text-gray-600">{userRating.comment}</p>
          )}
        </div>
      );
    }

    return (
      <button
        onClick={() => handleRatingClick(ride)}
        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
      >
        <FaRegStar className="text-yellow-400 mr-2" />
        <span>Rate this ride</span>
      </button>
    );
  };

  // Function to render a ride card
  const renderRideCard = (trip) => {
    // Define totalSeats and bookedSeats here to avoid reference errors
    const totalSeats = trip.totalSeats || 4;
    const bookedSeats = trip.bookedSeats || (totalSeats - (trip.leftSeats || 0));
    
    return (
      <div 
        key={trip.id}
        className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${getBorderColor(trip.status)} border-l-4`}
      >
        {/* Trip Header */}
        <div className="bg-gray-50 p-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded">
                {trip.distance} km
              </span>
              {getStatusBadge(trip.status)}
              {trip.isCreator ? (
                <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Driver
                </span>
              ) : (
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-1 rounded-full flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Passenger
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">From</p>
                <p className="font-medium text-gray-900 truncate">{trip.from.split(',')[0]}</p>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">To</p>
                <p className="font-medium text-gray-900 truncate">{trip.to.split(',')[0]}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trip Details */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Date and Time */}
            <div className="flex items-start">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date & Time</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(trip.date).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-600">{trip.time}</p>
              </div>
            </div>
            
            {/* Price */}
            <div className="flex items-start">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Price per seat</p>
                <p className="text-sm font-medium text-green-600">₹{trip.price}</p>
                {trip.isCreator && (
                  <p className="text-xs text-gray-600">
                    Total: ₹{trip.price * bookedSeats}
                  </p>
                )}
              </div>
            </div>
            
            {/* Seats */}
            <div className="flex items-start">
              <div className="p-2 bg-purple-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Seats Booked</p>
                <div className="flex items-center mt-1">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{bookedSeats}/{totalSeats}</span>
                      <div className="ml-2 flex space-x-1">
                        {[...Array(totalSeats)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < bookedSeats ? 'bg-purple-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {trip.isCreator 
                        ? `${bookedSeats} passenger${bookedSeats !== 1 ? 's' : ''} booked`
                        : `${totalSeats - bookedSeats} seat${totalSeats - bookedSeats !== 1 ? 's' : ''} left`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Driver/Passenger Info */}
            <div className="flex items-start">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">{trip.isCreator ? 'You are the driver' : 'Driver'}</p>
                <div className="flex items-center">
                  <p className="text-sm font-medium">{trip.driver.name}</p>
                  {!trip.isCreator && trip.driver.rating && (
                    <div className="flex items-center ml-2">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm ml-1 text-gray-600">{trip.driver.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2 pt-3 border-t border-gray-100">
            <button
              onClick={() => handleViewDetails(trip)}
              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Details
            </button>
            
            {trip.status === 'completed' && !ratings[trip.id] && (
              <button
                onClick={() => handleRatingClick(trip)}
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
              >
                <FaRegStar className="text-yellow-400 mr-2" />
                <span>Rate this ride</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modify the renderCurrentTrip function to include the updated card styling
  const renderCurrentTrip = (trip) => {
    // Define totalSeats and bookedSeats here too
    const totalSeats = trip.totalSeats || 4;
    const bookedSeats = trip.bookedSeats || (totalSeats - (trip.leftSeats || 0));
    
    return (
      <div 
        key={trip.id}
        className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border-purple-400 border-l-4`}
      >
        {/* Trip Header */}
        <div className="bg-gray-50 p-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded">
                {trip.distance} km
              </span>
              <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Ongoing
              </span>
              
              {/* Payment Status Badge */}
              {trip.isPassenger && (
                <span className={`text-xs px-2.5 py-1 rounded-full flex items-center ${
                  trip.paymentStatus === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d={trip.paymentStatus === 'completed' 
                        ? "M5 13l4 4L19 7" // Checkmark for completed
                        : "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"} // Clock for pending
                    />
                  </svg>
                  {trip.paymentStatus === 'completed' ? 'Paid' : 'Payment Pending'}
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">From</p>
                <p className="font-medium text-gray-900 truncate">{trip.from.split(',')[0]}</p>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">To</p>
                <p className="font-medium text-gray-900 truncate">{trip.to.split(',')[0]}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trip Details */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Date and Time */}
            <div className="flex items-start">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date & Time</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(trip.date).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-600">{trip.time}</p>
              </div>
            </div>
            
            {/* Price */}
            <div className="flex items-start">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Price per seat</p>
                <p className="text-sm font-medium text-green-600">₹{trip.price}</p>
                <p className="text-xs text-gray-600">
                  Total: ₹{trip.price * (trip.bookedSeats || 1)}
                </p>
              </div>
            </div>
            
            {/* Driver/Passenger Info */}
            <div className="flex items-start">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">{trip.isCreator ? 'You are the driver' : 'Driver'}</p>
                <div className="flex items-center">
                  <p className="text-sm font-medium">{trip.driver.name}</p>
                  {!trip.isCreator && trip.driver.rating && (
                    <div className="flex items-center ml-2">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm ml-1 text-gray-600">{trip.driver.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2 pt-3 border-t border-gray-100">
            <button
              onClick={() => handleViewDetails(trip)}
              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Details
            </button>
            
            {trip.isPassenger && trip.paymentStatus === 'pending' && (
              <button
                onClick={() => handlePaymentClick(trip)}
                className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Pay Now
              </button>
            )}
            
            {trip.isPassenger && trip.paymentStatus === 'completed' && (
              <div className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Paid
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modify the renderUpcomingTrip function to include the updated card styling
  const renderUpcomingTrip = (trip) => {
    // Define totalSeats and bookedSeats here too
    const totalSeats = trip.totalSeats || 4;
    const bookedSeats = trip.bookedSeats || (totalSeats - (trip.leftSeats || 0));
    
    return (
      <div 
        key={trip.id}
        className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border-green-400 border-l-4`}
      >
        {/* Trip Header */}
        <div className="bg-gray-50 p-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded">
                {trip.distance} km
              </span>
              {getStatusBadge(trip.status)}
              {trip.isCreator ? (
                <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Driver
                </span>
              ) : (
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-1 rounded-full flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Passenger
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">From</p>
                <p className="font-medium text-gray-900 truncate">{trip.from.split(',')[0]}</p>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">To</p>
                <p className="font-medium text-gray-900 truncate">{trip.to.split(',')[0]}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trip Details */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Date and Time */}
            <div className="flex items-start">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date & Time</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(trip.date).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-600">{trip.time}</p>
              </div>
            </div>
            
            {/* Price */}
            <div className="flex items-start">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Price per seat</p>
                <p className="text-sm font-medium text-green-600">₹{trip.price}</p>
                {trip.isCreator && (
                  <p className="text-xs text-gray-600">
                    Total: ₹{trip.price * bookedSeats}
                  </p>
                )}
              </div>
            </div>
            
            {/* Seats */}
            <div className="flex items-start">
              <div className="p-2 bg-purple-50 rounded-lg mr-3">
                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Seats Booked</p>
                <div className="flex items-center mt-1">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{bookedSeats}/{totalSeats}</span>
                      <div className="ml-2 flex space-x-1">
                        {[...Array(totalSeats)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < bookedSeats ? 'bg-purple-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {trip.isCreator 
                        ? `${bookedSeats} passenger${bookedSeats !== 1 ? 's' : ''} booked`
                        : `${totalSeats - bookedSeats} seat${totalSeats - bookedSeats !== 1 ? 's' : ''} left`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Driver/Passenger Info */}
            <div className="flex items-start">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">{trip.isCreator ? 'You are the driver' : 'Driver'}</p>
                <div className="flex items-center">
                  <p className="text-sm font-medium">{trip.driver.name}</p>
                  {!trip.isCreator && trip.driver.rating && (
                    <div className="flex items-center ml-2">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm ml-1 text-gray-600">{trip.driver.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2 pt-3 border-t border-gray-100">
            <button
              onClick={() => handleViewDetails(trip)}
              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Details
            </button>
            
            {trip.status !== 'cancelled' && (
              <button
                onClick={() => handleCancelRide(trip.id)}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel Ride
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-24">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-800 text-sm mb-6">
            <div className="flex">
              <svg className="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Welcome Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-900">My Trips</h2>
            <p className="mt-0.5 text-sm text-gray-600">
              {currentUser && `Welcome, ${currentUser.firstName || currentUser.username || 'User'}! `}
              View and manage all your trips as a passenger
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Trips */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-50 mr-4">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{createdRides.length + joinedRides.length}</p>
              </div>
            </div>
          </div>
          
          {/* Current Trips */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-50 mr-4">
                <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Trips</p>
                <p className="text-2xl font-bold text-gray-900">{currentRides.length}</p>
              </div>
            </div>
          </div>
          
          {/* Upcoming Trips */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-50 mr-4">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Upcoming Trips</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingRides.length}</p>
              </div>
            </div>
          </div>
          
          {/* Completed Trips */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-50 mr-4">
                <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed Trips</p>
                <p className="text-2xl font-bold text-gray-900">{completedRides.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="flex">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'current'
                ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50' 
                : 'text-gray-500 hover:text-blue-500 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('current')}
            >
              Current Trips
              {currentRides.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {currentRides.length}
                </span>
              )}
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'upcoming'
                ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50' 
                : 'text-gray-500 hover:text-blue-500 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming Trips
              {upcomingRides.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {upcomingRides.length}
                </span>
              )}
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'past'
                ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50' 
                : 'text-gray-500 hover:text-blue-500 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('past')}
            >
              Completed Trips
              {completedRides.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {completedRides.length}
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === 'current' && (
              <>
                {currentRides.length === 0 ? (
                  <div className="text-center py-12">
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png" 
                      alt="No current trips" 
                      className="w-20 h-20 mx-auto mb-4 opacity-50"
                    />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No current trips</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      You don't have any ongoing trips right now.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Find a Ride
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {currentRides.map(trip => renderCurrentTrip(trip))}
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'upcoming' && (
              <>
                {upcomingRides.length === 0 ? (
                  <div className="text-center py-12">
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png" 
                      alt="No upcoming trips" 
                      className="w-20 h-20 mx-auto mb-4 opacity-50"
                    />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No upcoming trips</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      You don't have any upcoming trips scheduled. Start exploring available rides or create your own!
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Find a Ride
                      </button>
                      <button
                        onClick={() => navigate('/create-ride')}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Create a Ride
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingRides.map(trip => renderUpcomingTrip(trip))}
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'past' && (
              <>
                {completedRides.length === 0 ? (
                  <div className="text-center py-12">
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png" 
                      alt="No past trips" 
                      className="w-20 h-20 mx-auto mb-4 opacity-50"
                    />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No past trips</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      You haven't completed any trips yet. Start by finding a ride!
                    </p>
                    <button
                      onClick={() => navigate('/')}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Find a Ride
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {completedRides.map(trip => renderRideCard(trip))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Authentication Required</h3>
              <p className="text-sm text-gray-500 mt-2">Please sign in to view your trips</p>
              <div className="mt-5">
                <button
                  onClick={handleLogin}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full mt-3 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
                >
                  Go to Homepage
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <button
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <FaRegStar className="text-yellow-400" />
                  <span className="text-xl font-semibold">Rate Your Ride</span>
                </button>
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">How was your experience?</p>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setRatingValue(value)}
                      className={`text-2xl ${ratingValue >= value ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                    >
                      {ratingValue >= value ? <FaStar /> : <FaRegStar />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Share your experience..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal - Only render when showPaymentModal is true */}
        {showPaymentModal && rideToPayFor && (
          <PaymentModal
            ride={rideToPayFor}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
}

export default MyTrips; 