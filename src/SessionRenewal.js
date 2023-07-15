import React, { useEffect, useRef } from 'react';

function SessionRenewal(WrappedComponent) {
  return function WrappedWithSessionRenewal(props) {
    const activityDetected = useRef(false);

    useEffect(() => {
      let timeoutId;

      const renewSession = () => {
        // Send a request to the server to renew the session
        fetch('/api/renew-session', {
          method: 'POST',
          credentials: 'include', // Include cookies in the request
        });
      };

      const resetTimeout = () => {
        console.log('User activity detected');
        // Clear the existing timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Set a new timeout
        timeoutId = setTimeout(renewSession, 5 * 60 * 1000); // 5 minutes
      };

      const activityHandler = () => {
        activityDetected.current = true;
      };

      // Add event listeners for mouse and keyboard events
      window.addEventListener('mousemove', activityHandler);
      window.addEventListener('keydown', activityHandler);
      window.addEventListener('click', activityHandler); // Add a listener for mouse clicks
      window.addEventListener('input', activityHandler); // Add a listener for form inputs

      const intervalId = setInterval(() => {
        if (activityDetected.current) {
          resetTimeout();
          activityDetected.current = false;
        }
      }, 10000); // Check for activity every second

      // Remove the event listeners and clear the timeout when the component is unmounted
      return () => {
        window.removeEventListener('mousemove', activityHandler);
        window.removeEventListener('keydown', activityHandler);
        window.removeEventListener('click', activityHandler); // Remove the listener for mouse clicks
        window.removeEventListener('input', activityHandler); // Remove the listener for form inputs
        clearTimeout(timeoutId);
        clearInterval(intervalId);
      };
    }, []);

    return <WrappedComponent {...props} />;
  };
}

export default SessionRenewal;
