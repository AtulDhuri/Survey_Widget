(function() {
  'use strict';
  
  // Prevent multiple loads
  if (window.__surveyPopupLoaded) {
    console.log('Survey popup already loaded');
    return;
  }
  window.__surveyPopupLoaded = true;

  // Configuration object for the popup
  var config = {
    // Base URL where the Angular bundle is hosted
    // This will be the same directory as this loader script
    baseUrl: window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, ''),
    
    // Popup configuration options
    options: {
      title: 'Quick Survey',
      position: 'bottom-left', // bottom-left, bottom-right, top-left, top-right
      delay: 2000, // Delay before showing popup (in milliseconds)
      autoShow: true, // Whether to show popup automatically
      closeOnSubmit: true, // Whether to close popup after form submission
      submitUrl: null, // URL to submit form data (optional)
      onSubmit: null // Custom submit handler (optional)
    }
  };

  // Parse script tag attributes for configuration
  var script = document.currentScript || document.querySelector('script[src*="survey-popup-loader.js"]');
  if (script) {
    var dataConfig = script.getAttribute('data-config');
    if (dataConfig) {
      try {
        var parsedConfig = JSON.parse(dataConfig);
        config.options = Object.assign(config.options, parsedConfig);
      } catch (e) {
        console.warn('Invalid survey popup configuration:', e);
      }
    }
    
    // Parse individual data attributes
    if (script.hasAttribute('data-title')) {
      config.options.title = script.getAttribute('data-title');
    }
    if (script.hasAttribute('data-position')) {
      config.options.position = script.getAttribute('data-position');
    }
    if (script.hasAttribute('data-delay')) {
      config.options.delay = parseInt(script.getAttribute('data-delay')) || 2000;
    }
    if (script.hasAttribute('data-auto-show')) {
      config.options.autoShow = script.getAttribute('data-auto-show') === 'true';
    }
    if (script.hasAttribute('data-submit-url')) {
      config.options.submitUrl = script.getAttribute('data-submit-url');
    }
  }

  // Create container for the widget
  function createContainer() {
    var container = document.createElement('div');
    container.id = 'survey-popup-container';
    container.style.cssText = 'position: fixed; z-index: 999999; pointer-events: none;';
    
    // Position the container based on configuration
    switch (config.options.position) {
      case 'bottom-right':
        container.style.bottom = '20px';
        container.style.right = '20px';
        break;
      case 'top-left':
        container.style.top = '20px';
        container.style.left = '20px';
        break;
      case 'top-right':
        container.style.top = '20px';
        container.style.right = '20px';
        break;
      default: // bottom-left
        container.style.bottom = '20px';
        container.style.left = '20px';
        break;
    }
    
    document.body.appendChild(container);
    return container;
  }

  // Load the Angular bundle
  function loadAngularBundle() {
    return new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.src = config.baseUrl + '/main.js';
      script.async = true;
      
      script.onload = function() {
        console.log('Survey popup Angular bundle loaded successfully');
        resolve();
      };
      
      script.onerror = function() {
        console.error('Failed to load survey popup Angular bundle');
        reject(new Error('Failed to load Angular bundle'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Create and mount the widget
  function mountWidget(container) {
    return new Promise(function(resolve) {
      // Wait for the custom element to be defined
      var checkElement = function() {
        if (customElements.get('survey-popup-widget')) {
          var widget = document.createElement('survey-popup-widget');
          widget.style.pointerEvents = 'auto';
          
          // Pass configuration to the widget
          widget.setAttribute('data-config', JSON.stringify(config.options));
          
          container.appendChild(widget);
          console.log('Survey popup widget mounted successfully');
          resolve(widget);
        } else {
          setTimeout(checkElement, 100);
        }
      };
      
      checkElement();
    });
  }

  // Initialize the popup
  function init() {
    try {
      var container = createContainer();
      
      loadAngularBundle()
        .then(function() {
          return mountWidget(container);
        })
        .then(function(widget) {
          // Store reference for external access
          window.surveyPopupWidget = widget;
          
          // Auto-show the popup if configured
          if (config.options.autoShow && config.options.delay > 0) {
            setTimeout(function() {
              // Trigger show if the widget has a show method
              if (widget.show) {
                widget.show();
              }
            }, config.options.delay);
          }
          
          console.log('Survey popup initialized successfully');
        })
        .catch(function(error) {
          console.error('Failed to initialize survey popup:', error);
        });
    } catch (error) {
      console.error('Error initializing survey popup:', error);
    }
  }

  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose configuration and methods globally
  window.surveyPopupConfig = config;
  window.surveyPopup = {
    show: function() {
      if (window.surveyPopupWidget && window.surveyPopupWidget.show) {
        window.surveyPopupWidget.show();
      }
    },
    hide: function() {
      if (window.surveyPopupWidget && window.surveyPopupWidget.hide) {
        window.surveyPopupWidget.hide();
      }
    },
    destroy: function() {
      var container = document.getElementById('survey-popup-container');
      if (container) {
        container.remove();
        window.__surveyPopupLoaded = false;
      }
    }
  };

})(); 