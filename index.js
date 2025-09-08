const appId = 'sq0ids-MrYYNRz-67udAi9NeXwivA';
const locationId = 'LM7BMTXKZPEB8';

// Function to dynamically load the Square.js script
function loadSquareScript() {
  return new Promise((resolve, reject) => {
    // Check if Square is already loaded
    if (window.Square) {
      resolve(window.Square);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://staging.web.squarecdn.com/v1/square.js';
    script.crossOrigin = 'anonymous' // This will be proxied to https://localhost:1779
    
    // Handle successful load
    script.onload = () => {
      if (window.Square) {
        console.log('Square.js loaded successfully');
        resolve(window.Square);
      } else {
        reject(new Error('Square.js loaded but Square object not found'));
      }
    };
    
    // Handle load error
    script.onerror = (error) => {
      console.error('Failed to load Square.js from webpack dev server:', error);
      reject(new Error('Failed to load Square.js script'));
    };
    
    // Add script to document head
    document.head.appendChild(script);
  });
}

async function initializeCard(payments) {
  const card = await payments.card();
  await card.attach('#card-container');

  return card;
}

function buildPaymentRequest(payments) {
  return payments.paymentRequest({
    countryCode: 'US',
    currencyCode: 'USD',
    total: {
      amount: '1.00',
      label: 'Total',
    },
  });
}

async function createPayment(token) {
  const body = JSON.stringify({
    locationId,
    sourceId: token,
    idempotencyKey: window.crypto.randomUUID(),
  });

  const paymentResponse = await fetch('/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  if (paymentResponse.ok) {
    return paymentResponse.json();
  }

  const errorBody = await paymentResponse.text();
  throw new Error(errorBody);
}

// Change the parameter to 'paymentMethod'
async function tokenize(paymentMethod) {
  const tokenResult = await paymentMethod.tokenize();
  if (tokenResult.status === 'OK') {
    return tokenResult.token;
  } else {
    let errorMessage = `Tokenization failed with status: ${tokenResult.status}`;
    if (tokenResult.errors) {
      errorMessage += ` and errors: ${JSON.stringify(
        tokenResult.errors,
      )}`;
    }

    throw new Error(errorMessage);
  }
}

// status is either SUCCESS or FAILURE;
function displayPaymentResults(status) {
  const statusContainer = document.getElementById(
    'payment-status-container',
  );
  if (status === 'SUCCESS') {
    statusContainer.classList.remove('is-failure');
    statusContainer.classList.add('is-success');
  } else {
    statusContainer.classList.remove('is-success');
    statusContainer.classList.add('is-failure');
  }

  statusContainer.style.visibility = 'visible';
}

console.log('console statement for checking');

async function init() {
  try {
    // Dynamically load Square.js from the webpack dev server
    console.log('Loading Square.js script');
    const Square = await loadSquareScript();
    
    let payments;
    try {
      payments = Square.payments(appId, locationId);
    } catch (error) {
      console.error('Failed to initialize Square payments:', error);
      const statusContainer = document.getElementById(
        'payment-status-container',
      );
      statusContainer.className = 'missing-credentials';
      statusContainer.style.visibility = 'visible';
      return;
    }

    let card;
    try {
      card = await initializeCard(payments);
    } catch (e) {
      console.error('Initializing Card failed', e);
      return;
    }

    async function handlePaymentMethodSubmission(event, paymentMethod) {
      event.preventDefault();

      try {
        // disable the submit button as we await tokenization and make a payment request.
        cardButton.disabled = true;
        const token = await tokenize(paymentMethod);
        console.log('token', token);
        // const paymentResults = await createPayment(token);
        displayPaymentResults('SUCCESS');

        console.debug('Payment Success', paymentResults);
      } catch (e) {
        cardButton.disabled = false;
        displayPaymentResults('FAILURE');
        console.error(e.message);
      }
    }

    const cardButton = document.getElementById('card-button');
    cardButton.addEventListener('click', async function (event) {
      await handlePaymentMethodSubmission(event, card);
    });
    
  } catch (error) {
    console.error('Failed to load Square.js:', error);
    const statusContainer = document.getElementById('payment-status-container');
    statusContainer.className = 'missing-credentials';
    statusContainer.style.visibility = 'visible';
    statusContainer.textContent = 'Failed to load Square.js';
  }
}

init();

// document.addEventListener('DOMContentLoaded', async function () {
//   try {
//     // Dynamically load Square.js from the webpack dev server
//     console.log('Loading Square.js script');
//     const Square = await loadSquareScript();
    
//     let payments;
//     try {
//       payments = Square.payments(appId, locationId);
//     } catch (error) {
//       console.error('Failed to initialize Square payments:', error);
//       const statusContainer = document.getElementById(
//         'payment-status-container',
//       );
//       statusContainer.className = 'missing-credentials';
//       statusContainer.style.visibility = 'visible';
//       return;
//     }

//     let card;
//     try {
//       card = await initializeCard(payments);
//     } catch (e) {
//       console.error('Initializing Card failed', e);
//       return;
//     }

//     async function handlePaymentMethodSubmission(event, paymentMethod) {
//       event.preventDefault();

//       try {
//         // disable the submit button as we await tokenization and make a payment request.
//         cardButton.disabled = true;
//         const token = await tokenize(paymentMethod);
//         console.log('token', token);
//         // const paymentResults = await createPayment(token);
//         displayPaymentResults('SUCCESS');

//         console.debug('Payment Success', paymentResults);
//       } catch (e) {
//         cardButton.disabled = false;
//         displayPaymentResults('FAILURE');
//         console.error(e.message);
//       }
//     }

//     const cardButton = document.getElementById('card-button');
//     cardButton.addEventListener('click', async function (event) {
//       await handlePaymentMethodSubmission(event, card);
//     });
    
//   } catch (error) {
//     console.error('Failed to load Square.js:', error);
//     const statusContainer = document.getElementById('payment-status-container');
//     statusContainer.className = 'missing-credentials';
//     statusContainer.style.visibility = 'visible';
//     statusContainer.textContent = 'Failed to load Square.js';
//   }
// });
