let requestCount = 0;

async function processPayment({ amountCents = 0, cardLast4 = '0000' } = {}) {
  requestCount += 1;

  const approved = requestCount % 3 !== 0;
  const result = approved
    ? {
        approved: true,
        requestCount
      }
    : {
        approved: false,
        reason: 'Credit Card Authorization Failed.',
        requestCount
      };

  // Observer-style side effect used as a mock notification hook.
  console.log(
    '[PaymentService]',
    JSON.stringify({
      requestCount,
      amountCents,
      cardLast4,
      approved,
      reason: result.reason || null
    })
  );

  return result;
}

function getPaymentAttemptCount() {
  return requestCount;
}

module.exports = {
  processPayment,
  getPaymentAttemptCount
};
