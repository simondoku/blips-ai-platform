// client/src/pages/Events/index.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Events = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  
  // Mock data for development
  useEffect(() => {
    setTimeout(() => {
      setUpcomingEvents([
        {
          id: 1,
          title: "AI Film Festival 2025",
          date: "April 15-20, 2025",
          location: "Virtual Event",
          description: "The premier event for AI-generated films and animations. Featuring screenings, workshops, and panel discussions.",
          image: null
        },
        {
          id: 2,
          title: "Blips AI Creators Meetup",
          date: "May 5, 2025",
          location: "San Francisco, CA",
          description: "Connect with fellow AI creators, share techniques, and explore new possibilities in AI-generated media.",
          image: null
        },
        {
          id: 3,
          title: "AI Art Exhibition",
          date: "June 10-15, 2025",
          location: "New York, NY",
          description: "A showcase of the best AI-generated artwork from the Blips community.",
          image: null
        }
      ]);
      
      setPastEvents([
        {
          id: 4,
          title: "AI Animation Workshop",
          date: "February 20, 2025",
          location: "Online",
          description: "Learn advanced techniques for creating AI animations with expert guidance.",
          image: null
        },
        {
          id: 5,
          title: "Blips AI Launch Party",
          date: "January 15, 2025",
          location: "Los Angeles, CA",
          description: "Celebrating the official launch of the Blips AI platform with demos and special guests.",
          image: null
        }
      ]);
      
      setIsLoading(false);
    }, 1000);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-blips-purple rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Blips AI Events</h1>
        <p className="text-xl text-blips-text-secondary max-w-3xl mx-auto">
          Connect with the AI creative community through our virtual and in-person events.
        </p>
      </div>
      
      {/* Upcoming Events */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-8 border-b border-blips-dark pb-4">Upcoming Events</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card card-hover overflow-hidden"
            >
              {/* Event Image */}
              <div className="h-48 bg-gradient-to-br from-blips-dark to-blips-purple/30 flex items-center justify-center">
                <span className="text-2xl text-white opacity-50">Event</span>
              </div>
              
              {/* Event Details */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{event.title}</h3>
                  <span className="bg-blips-purple rounded-full px-3 py-1 text-xs font-medium">Upcoming</span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center text-blips-text-secondary mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {event.date}
                  </div>
                  
                  <div className="flex items-center text-blips-text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                </div>
                
                <p className="text-blips-text-secondary mb-6">{event.description}</p>
                
                <button className="btn-primary w-full">
                  Register Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Past Events */}
      <section>
        <h2 className="text-2xl font-bold mb-8 border-b border-blips-dark pb-4">Past Events</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pastEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card overflow-hidden opacity-80 hover:opacity-100 transition-opacity"
            >
              {/* Event Image */}
              <div className="h-48 bg-gradient-to-br from-blips-dark to-blips-card flex items-center justify-center">
                <span className="text-2xl text-white opacity-30">Event</span>
              </div>
              
              {/* Event Details */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{event.title}</h3>
                  <span className="bg-blips-dark rounded-full px-3 py-1 text-xs font-medium text-blips-text-secondary">Past</span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center text-blips-text-secondary mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {event.date}
                  </div>
                  
                  <div className="flex items-center text-blips-text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                </div>
                
                <p className="text-blips-text-secondary mb-6">{event.description}</p>
                
                <button className="btn-secondary w-full">
                  View Recordings
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Events;