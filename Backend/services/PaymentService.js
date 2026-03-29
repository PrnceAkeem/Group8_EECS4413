let paymentAttemptCount = 0;

async function processPayment(paymentInfo = {}) {
  paymentAttemptCount += 1;

  const isDenied = paymentAttemptCount % 3 === 0;

  if (isDenied) {
    return {
      success: false,
      paymentStatus: 'declined',
      attemptCount: paymentAttemptCount,
      message: 'Credit Card Authorization Failed.'
    };
  }

  return {
    success: true,
    paymentStatus: 'approved',
    attemptCount: paymentAttemptCount,
    message: 'Payment approved by mock payment service.'
  };
}

function getPaymentAttemptCount() {
  return paymentAttemptCount;
}

module.exports = {
  processPayment,
  getPaymentAttemptCount
};