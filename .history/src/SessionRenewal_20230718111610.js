import React, { useEffect, useRef } from 'react';

function SessionRenewal(WrappedComponent) {
  return function WrappedWithSessionRenewal(props) {
    const activityDetected = useRef(false);

    useEffect(() => {
      let timeoutId;

      const renewSession = () => {
        fetch('/api/renew-session', {
          method: 'POST',
          credentials: 'include', // Include cookies in the request
        })
        .then(res => res.json())
        .then((data) => {
          if (!data.success) {
            console.error('Session renewal failed:', data.error);
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      };

      const resetTimeout = () => {
        console.log('User activity detected');
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(renewSession, 5 * 60 * 800); // 5 minutes
      };

      const activityHandler = () => {
        activityDetected.current = true;
      };

      window.addEventListener('mousemove', activityHandler);
      window.addEventListener('keydown', activityHandler);
      window.addEventListener('click', activityHandler);
      window.addEventListener('input', activityHandler);

      const intervalId = setInterval(() => {
        if (activityDetected.current) {
          resetTimeout();
          activityDetected.current = false;
        }
      }, 10000);

      return () => {
        window.removeEventListener('mousemove', activityHandler);
        window.removeEventListener('keydown', activityHandler);
        window.removeEventListener('click', activityHandler);
        window.removeEventListener('input', activityHandler);
        clearTimeout(timeoutId);
        clearInterval(intervalId);
      };
    }, []);

    return <WrappedComponent {...props} />;
  };
}

export default SessionRenewal;
